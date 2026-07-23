package pe.edu.unas.ctic.diagti.director.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;
import pe.edu.unas.ctic.diagti.director.support.DirectorEstados;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Regla de riesgo consolidado (un sistema = un riesgo):
 * 1) Observaciones abiertas (PENDIENTE/EN_REVISION/RECHAZADA) elevan el nivel.
 * 2) Estado OBSERVADO/RECHAZADO en flujo o validación.
 * 3) Criticidad Alta + observaciones abiertas → crítico.
 * 4) Seguridad sin SSL/TLS solo si existen registros de seguridad.
 * 5) Contrato no vigente / legacy / borrador > 30 días como factores secundarios.
 * Se conserva el factor de mayor severidad: critico > advertencia > controlado.
 */
@Component
@RequiredArgsConstructor
public class RiesgoMapper {

    private final DirectorCatalogHelper catalogHelper;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<RiesgoDTO> calcularRiesgos(SistemaEntity sistema,
                                           List<ValidacionEntity> validaciones,
                                           List<SeguridadEntity> seguridades,
                                           List<ObservacionEntity> observaciones) {
        List<RiesgoDTO> factores = new ArrayList<>();
        if (sistema == null || sistema.getIdSistema() == null) {
            return List.of();
        }

        String area = catalogHelper.valorCatalogo(sistema.getIdAreaUsuario());
        String estadoSistema = DirectorEstados.normalizarEstadoSistema(sistema.getEstadoValidacion());
        String criticidad = catalogHelper.valorCatalogo(sistema.getIdCriticidad());
        long obsAbiertas = observaciones == null ? 0
                : observaciones.stream().filter(o -> DirectorEstados.esObservacionAbierta(o.getEstadoObservacion())).count();

        if (obsAbiertas > 0) {
            int rank = DirectorTexto.normalize(criticidad).contains("alta")
                    || DirectorTexto.normalize(criticidad).contains("critica") ? 3 : 2;
            factores.add(factor(sistema, area, "Observaciones",
                    rank == 3 ? "critico" : "advertencia",
                    rank == 3 ? "Crítico" : "Medio",
                    "Observaciones abiertas",
                    obsAbiertas + " observación(es) pendiente(s) de atender.",
                    true, false, fechaSistema(sistema)));
        }

        boolean validacionObservada = (validaciones != null && validaciones.stream().anyMatch(v -> {
            String e = DirectorTexto.upper(v.getEstadoValidacion());
            return DirectorEstados.OBSERVADO.equals(e) || DirectorEstados.RECHAZADO.equals(e);
        })) || DirectorEstados.OBSERVADO.equals(estadoSistema) || DirectorEstados.RECHAZADO.equals(estadoSistema);

        if (validacionObservada) {
            factores.add(factor(sistema, area, "Validación",
                    mapNivelBadge(sistema.getNivelRiesgo(), "advertencia"),
                    mapNivelTexto(sistema.getNivelRiesgo(), "Medio"),
                    estadoSistema,
                    "El sistema se encuentra observado o rechazado en validación.",
                    false, false, fechaSistema(sistema)));
        }

        if (seguridades != null && !seguridades.isEmpty()) {
            boolean tieneSsl = seguridades.stream()
                    .anyMatch(s -> {
                        String t = DirectorTexto.safe(s.getTipoControl()).toUpperCase();
                        return t.contains("SSL") || t.contains("TLS");
                    });
            if (!tieneSsl) {
                factores.add(factor(sistema, area, "Seguridad",
                        "critico", "Crítico",
                        "Revisión de seguridad",
                        "Existen controles de seguridad sin SSL/TLS registrado.",
                        true, false, fechaSistema(sistema)));
            }
        }

        if (Boolean.FALSE.equals(sistema.getContratoVigente())
                && !DirectorEstados.BORRADOR.equals(estadoSistema)) {
            factores.add(factor(sistema, area, "Contractual",
                    "advertencia", "Medio",
                    "Gestión contractual",
                    "Contrato sin vigencia o soporte no confirmado.",
                    false, true, fechaSistema(sistema)));
        }

        if (Boolean.TRUE.equals(sistema.getEsLegacy())) {
            factores.add(factor(sistema, area, "Obsolescencia",
                    "critico", "Crítico",
                    "Migración",
                    "Sistema marcado como legacy.",
                    true, false, fechaSistema(sistema)));
        }

        if (DirectorEstados.BORRADOR.equals(estadoSistema) && sistema.getFechaCreacion() != null
                && sistema.getFechaCreacion().plusDays(30).isBefore(LocalDateTime.now())) {
            factores.add(factor(sistema, area, "Proceso",
                    "advertencia", "Medio",
                    "Borrador",
                    "Registro en borrador por más de 30 días.",
                    false, true, fechaSistema(sistema)));
        }

        if (factores.isEmpty()) {
            // Sistema sin factores de riesgo: aún se reporta como controlado una sola vez.
            factores.add(factor(sistema, area, "General",
                    "controlado", "Bajo",
                    estadoSistema,
                    "Sin factores de riesgo activos detectados.",
                    false, false, fechaSistema(sistema)));
        }

        Optional<RiesgoDTO> principal = factores.stream()
                .max(Comparator.comparingInt(r -> severidad(r.getNivel())));

        if (principal.isEmpty()) {
            return List.of();
        }

        RiesgoDTO consolidado = principal.get();
        consolidado.setId("R-" + sistema.getIdSistema());
        consolidado.setCodigo(sistema.getCodigoUnico());
        consolidado.setTitulo(consolidado.getCategoria() + " · " + DirectorTexto.safe(sistema.getNombre()));
        consolidado.setEstado(obsAbiertas > 0 || validacionObservada ? "abierto" : "controlado");
        consolidado.setPeriod(periodoActual());
        consolidado.setProbability(severidad(consolidado.getNivel()) >= 3 ? 3 : 2);
        consolidado.setImpact(severidad(consolidado.getNivel()) >= 3 ? 3 : 2);
        return List.of(consolidado);
    }

    /** Compatibilidad con llamadas anteriores sin observaciones. */
    public List<RiesgoDTO> calcularRiesgos(SistemaEntity sistema,
                                           List<ValidacionEntity> validaciones,
                                           List<SeguridadEntity> seguridades) {
        return calcularRiesgos(sistema, validaciones, seguridades, List.of());
    }

    private RiesgoDTO factor(SistemaEntity sistema, String area, String categoria,
                             String nivel, String nivelTexto, String etapa,
                             String recomendacion, boolean vulnerabilidad, boolean cuello,
                             String detectado) {
        RiesgoDTO riesgo = new RiesgoDTO();
        riesgo.setId("R-" + sistema.getIdSistema());
        riesgo.setCodigo(sistema.getCodigoUnico());
        riesgo.setTitulo(categoria + " · " + DirectorTexto.safe(sistema.getNombre()));
        riesgo.setArea(area);
        riesgo.setCategoria(categoria);
        riesgo.setNivel(nivel);
        riesgo.setNivelTexto(nivelTexto);
        riesgo.setEstado("abierto");
        riesgo.setEtapa(etapa);
        riesgo.setResponsable(catalogHelper.nombreUsuario(sistema.getIdResponsableTecnico()));
        riesgo.setDetectado(detectado);
        riesgo.setRecomendacion(recomendacion);
        riesgo.setVulnerabilidad(vulnerabilidad);
        riesgo.setCuelloBotella(cuello);
        riesgo.setProbability(2);
        riesgo.setImpact(2);
        riesgo.setPeriod(periodoActual());
        return riesgo;
    }

    private static int severidad(String nivel) {
        return switch (DirectorTexto.safe(nivel).toLowerCase()) {
            case "critico" -> 3;
            case "alto", "advertencia" -> 2;
            default -> 1;
        };
    }

    private static String mapNivelBadge(String nivelRiesgo, String def) {
        String n = DirectorTexto.upper(nivelRiesgo);
        return switch (n) {
            case "BAJO" -> "controlado";
            case "MEDIO" -> "advertencia";
            case "ALTO" -> "advertencia";
            case "CRITICO" -> "critico";
            default -> def;
        };
    }

    private static String mapNivelTexto(String nivelRiesgo, String def) {
        String n = DirectorTexto.upper(nivelRiesgo);
        return switch (n) {
            case "BAJO" -> "Bajo";
            case "MEDIO" -> "Medio";
            case "ALTO" -> "Alto";
            case "CRITICO" -> "Crítico";
            default -> def;
        };
    }

    private static String fechaSistema(SistemaEntity sistema) {
        if (sistema.getFechaActualizacion() != null) {
            return sistema.getFechaActualizacion().format(DATE_FORMAT);
        }
        if (sistema.getFechaCreacion() != null) {
            return sistema.getFechaCreacion().format(DATE_FORMAT);
        }
        return LocalDateTime.now().format(DATE_FORMAT);
    }

    private static String periodoActual() {
        int year = LocalDateTime.now().getYear();
        int month = LocalDateTime.now().getMonthValue();
        return year + (month <= 6 ? "-I" : "-II");
    }
}

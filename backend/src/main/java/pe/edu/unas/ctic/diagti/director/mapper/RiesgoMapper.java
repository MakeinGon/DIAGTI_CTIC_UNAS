package pe.edu.unas.ctic.diagti.director.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RiesgoMapper {

    private final CatalogoRepository catalogoRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Obtiene el nombre del área desde el catálogo usando el id_area_usuario
     */
    private String getAreaNombre(SistemaEntity sistema) {
        if (sistema == null || sistema.getIdAreaUsuario() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(sistema.getIdAreaUsuario())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    /**
     * Obtiene el nivel de riesgo real desde el catálogo
     */
    private String getNivelRiesgoReal(SistemaEntity sistema) {
        if (sistema == null || sistema.getNivelRiesgo() == null) {
            return "medio";  // valor por defecto
        }
        // El nivel de riesgo ya está en la tabla sistemas como "BAJO", "MEDIO", "ALTO", "CRITICO"
        // Lo devolvemos directamente
        String nivel = sistema.getNivelRiesgo().toUpperCase();
        // Mapear a los valores que espera el frontend para el badge
        return switch (nivel) {
            case "BAJO" -> "controlado";
            case "MEDIO" -> "advertencia";
            case "ALTO" -> "alto";
            case "CRITICO" -> "critico";
            default -> "advertencia";
        };
    }

    /**
     * Obtiene el nivel de riesgo en formato texto para mostrar en el frontend
     */
    private String getNivelRiesgoTexto(SistemaEntity sistema) {
        if (sistema == null || sistema.getNivelRiesgo() == null) {
            return "Medio";
        }
        String nivel = sistema.getNivelRiesgo().toUpperCase();
        return switch (nivel) {
            case "BAJO" -> "Bajo";
            case "MEDIO" -> "Medio";
            case "ALTO" -> "Alto";
            case "CRITICO" -> "Crítico";
            default -> "No definido";
        };
    }

    public List<RiesgoDTO> calcularRiesgos(SistemaEntity sistema, List<ValidacionEntity> validaciones, List<SeguridadEntity> seguridades) {
        List<RiesgoDTO> riesgos = new ArrayList<>();
        
        String nombreArea = getAreaNombre(sistema);
        String nivelRiesgoBadge = getNivelRiesgoReal(sistema);  // "critico", "advertencia", "controlado"
        String nivelRiesgoTexto = getNivelRiesgoTexto(sistema);  // "Bajo", "Medio", "Alto", "Crítico"

        // 1. Riesgo por validación observada o rechazada
        if (validaciones != null) {
            for (ValidacionEntity v : validaciones) {
                if ("OBSERVADO".equalsIgnoreCase(v.getEstadoValidacion()) || "RECHAZADO".equalsIgnoreCase(v.getEstadoValidacion())) {
                    RiesgoDTO riesgo = new RiesgoDTO();
                    riesgo.setId("R-" + UUID.randomUUID().toString().substring(0, 8));
                    riesgo.setCodigo(sistema.getCodigoUnico());
                    riesgo.setTitulo("Validación " + v.getEstadoValidacion().toLowerCase() + " - " + sistema.getNombre());
                    riesgo.setArea(nombreArea);
                    riesgo.setCategoria("Validación");
                    riesgo.setNivel(nivelRiesgoBadge);  // ← Usar el nivel de riesgo real
                    riesgo.setEstado("abierto");
                    riesgo.setEtapa(v.getEstadoValidacion());
                    riesgo.setResponsable("Validador CTIC");
                    if (v.getFechaValidacion() != null) {
                        riesgo.setDetectado(v.getFechaValidacion().format(DATE_FORMAT));
                    }
                    riesgo.setRecomendacion("Revisar observaciones y subsanar.");
                    riesgo.setVulnerabilidad(false);
                    riesgo.setCuelloBotella(false);
                    riesgo.setProbability(2);
                    riesgo.setImpact(2);
                    riesgo.setPeriod("2026-I");
                    riesgo.setNivelTexto(nivelRiesgoTexto);  // ← Para mostrar en la tabla
                    riesgos.add(riesgo);
                }
            }
        }

        // 2. Riesgo por seguridad: si no tiene SSL/TLS
        if (seguridades != null) {
            boolean tieneSSL = seguridades.stream().anyMatch(s -> "SSL/TLS".equalsIgnoreCase(s.getTipoControl()));
            if (!tieneSSL) {
                RiesgoDTO riesgo = new RiesgoDTO();
                riesgo.setId("R-" + UUID.randomUUID().toString().substring(0, 8));
                riesgo.setCodigo(sistema.getCodigoUnico());
                riesgo.setTitulo("Falta SSL/TLS - " + sistema.getNombre());
                riesgo.setArea(nombreArea);
                riesgo.setCategoria("Seguridad");
                riesgo.setNivel("critico");  // ← Falta SSL es siempre crítico
                riesgo.setEstado("abierto");
                riesgo.setEtapa("Revisión de seguridad");
                riesgo.setResponsable("Seguridad TI");
                if (sistema.getFechaCreacion() != null) {
                    riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
                }
                riesgo.setRecomendacion("Implementar certificado SSL/TLS.");
                riesgo.setVulnerabilidad(true);
                riesgo.setCuelloBotella(false);
                riesgo.setProbability(3);
                riesgo.setImpact(3);
                riesgo.setPeriod("2026-I");
                riesgo.setNivelTexto("Crítico");
                riesgos.add(riesgo);
            }
        }

        // 3. Riesgo por contrato vencido o sin soporte
        if (sistema.getContratoVigente() == null || !sistema.getContratoVigente()) {
            RiesgoDTO riesgo = new RiesgoDTO();
            riesgo.setId("R-" + UUID.randomUUID().toString().substring(0, 8));
            riesgo.setCodigo(sistema.getCodigoUnico());
            riesgo.setTitulo("Contrato sin vigencia - " + sistema.getNombre());
            riesgo.setArea(nombreArea);
            riesgo.setCategoria("Contractual");
            riesgo.setNivel("advertencia");
            riesgo.setEstado("abierto");
            riesgo.setEtapa("Gestión contractual");
            riesgo.setResponsable("Administración");
            if (sistema.getFechaCreacion() != null) {
                riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
            }
            riesgo.setRecomendacion("Renovar contrato o gestionar nuevo soporte.");
            riesgo.setVulnerabilidad(false);
            riesgo.setCuelloBotella(true);
            riesgo.setProbability(2);
            riesgo.setImpact(2);
            riesgo.setPeriod("2026-I");
            riesgo.setNivelTexto("Medio");
            riesgos.add(riesgo);
        }

        // 4. Riesgo por sistema legacy
        if (sistema.getEsLegacy() != null && sistema.getEsLegacy()) {
            RiesgoDTO riesgo = new RiesgoDTO();
            riesgo.setId("R-" + UUID.randomUUID().toString().substring(0, 8));
            riesgo.setCodigo(sistema.getCodigoUnico());
            riesgo.setTitulo("Sistema legacy - " + sistema.getNombre());
            riesgo.setArea(nombreArea);
            riesgo.setCategoria("Obsolescencia");
            riesgo.setNivel("critico");
            riesgo.setEstado("abierto");
            riesgo.setEtapa("Migración");
            riesgo.setResponsable("Área de Desarrollo");
            if (sistema.getFechaCreacion() != null) {
                riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
            }
            riesgo.setRecomendacion("Planificar migración a tecnologías modernas.");
            riesgo.setVulnerabilidad(true);
            riesgo.setCuelloBotella(false);
            riesgo.setProbability(3);
            riesgo.setImpact(3);
            riesgo.setPeriod("2026-I");
            riesgo.setNivelTexto("Crítico");
            riesgos.add(riesgo);
        }

        // 5. Riesgo por estado de flujo en "Borrador" por más de 30 días
        if ("BORRADOR".equalsIgnoreCase(sistema.getEstadoFlujo()) && sistema.getFechaCreacion() != null) {
            if (sistema.getFechaCreacion().plusDays(30).isBefore(java.time.LocalDateTime.now())) {
                RiesgoDTO riesgo = new RiesgoDTO();
                riesgo.setId("R-" + UUID.randomUUID().toString().substring(0, 8));
                riesgo.setCodigo(sistema.getCodigoUnico());
                riesgo.setTitulo("Registro en borrador prolongado - " + sistema.getNombre());
                riesgo.setArea(nombreArea);
                riesgo.setCategoria("Proceso");
                riesgo.setNivel("advertencia");
                riesgo.setEstado("abierto");
                riesgo.setEtapa("Borrador");
                riesgo.setResponsable("Área de Desarrollo");
                riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
                riesgo.setRecomendacion("Completar el registro y enviar a validación.");
                riesgo.setVulnerabilidad(false);
                riesgo.setCuelloBotella(true);
                riesgo.setProbability(2);
                riesgo.setImpact(2);
                riesgo.setPeriod("2026-I");
                riesgo.setNivelTexto("Medio");
                riesgos.add(riesgo);
            }
        }

        return riesgos;
    }
}
package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteRiesgoDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.mapper.RiesgoMapper;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.service.ReportesService;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;
import pe.edu.unas.ctic.diagti.director.support.DirectorEstados;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesServiceImpl implements ReportesService {

    private final DirectorSistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    private final DirectorSeguridadRepository seguridadRepository;
    private final ObservacionRepository observacionRepository;
    private final DirectorCatalogHelper catalogHelper;
    private final RiesgoMapper riesgoMapper;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(readOnly = true)
    public List<ReporteInventarioDTO> obtenerInventario(String area, String criticidad) {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        if (sistemas == null) {
            return List.of();
        }
        sistemas.forEach(s -> {
            Hibernate.initialize(s.getValidaciones());
            Hibernate.initialize(s.getObservaciones());
        });

        return sistemas.stream()
                .filter(s -> DirectorTexto.matchesFilter(area, catalogHelper.valorCatalogo(s.getIdAreaUsuario())))
                .filter(s -> DirectorTexto.matchesFilter(criticidad, catalogHelper.valorCatalogo(s.getIdCriticidad())))
                .map(s -> {
                    ReporteInventarioDTO dto = new ReporteInventarioDTO();
                    dto.setCodigo(s.getCodigoUnico());
                    dto.setNombre(s.getNombre());
                    dto.setTipo(catalogHelper.valorCatalogo(s.getIdTipoAplicativo()));
                    dto.setCriticidad(catalogHelper.valorCatalogo(s.getIdCriticidad()));
                    dto.setEstadoValidacion(DirectorEstados.normalizarEstadoSistema(s.getEstadoValidacion()));
                    dto.setEstadoOperativo(DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo()));
                    dto.setIdAreaUsuario(s.getIdAreaUsuario());
                    dto.setArea(catalogHelper.valorCatalogo(s.getIdAreaUsuario()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteValidacionDTO> obtenerValidacion(String area, String estado, String validationStatus) {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        if (sistemas == null) {
            return List.of();
        }
        sistemas.forEach(s -> Hibernate.initialize(s.getValidaciones()));

        String filtroEstado = (estado != null && !estado.isBlank()) ? estado : validationStatus;

        // Una fila por sistema (última validación), evita duplicados por historial.
        return sistemas.stream()
                .filter(s -> DirectorTexto.matchesFilter(area, catalogHelper.valorCatalogo(s.getIdAreaUsuario())))
                .filter(s -> DirectorTexto.matchesFilter(filtroEstado, s.getEstadoValidacion()))
                .map(s -> {
                    ValidacionEntity ultima = (s.getValidaciones() == null ? List.<ValidacionEntity>of() : s.getValidaciones())
                            .stream()
                            .max(Comparator.comparing(v -> v.getFechaValidacion() != null
                                    ? v.getFechaValidacion()
                                    : (v.getFechaActualizacion() != null ? v.getFechaActualizacion() : v.getFechaCreacion()),
                                    Comparator.nullsLast(Comparator.naturalOrder())))
                            .orElse(null);

                    ReporteValidacionDTO dto = new ReporteValidacionDTO();
                    dto.setCodigo(s.getCodigoUnico());
                    dto.setNombre(s.getNombre());
                    dto.setEstadoValidacion(DirectorEstados.normalizarEstadoSistema(s.getEstadoValidacion()));
                    dto.setArea(catalogHelper.valorCatalogo(s.getIdAreaUsuario()));
                    dto.setCriticidad(catalogHelper.valorCatalogo(s.getIdCriticidad()));
                    if (ultima != null && ultima.getFechaValidacion() != null) {
                        dto.setFechaValidacion(ultima.getFechaValidacion().format(DATE_FORMAT));
                        dto.setFechaValidacionIso(ultima.getFechaValidacion().format(ISO_DATE));
                    } else if (s.getFechaActualizacion() != null) {
                        dto.setFechaValidacion(s.getFechaActualizacion().format(DATE_FORMAT));
                        dto.setFechaValidacionIso(s.getFechaActualizacion().format(ISO_DATE));
                    } else {
                        dto.setFechaValidacion("No reportada");
                        dto.setFechaValidacionIso("");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteRiesgoDTO> obtenerRiesgos(String area, String criticidad) {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        if (sistemas == null || sistemas.isEmpty()) {
            return List.of();
        }

        List<ReporteRiesgoDTO> resultados = new ArrayList<>();
        for (SistemaEntity sistema : sistemas) {
            if (!DirectorTexto.matchesFilter(area, catalogHelper.valorCatalogo(sistema.getIdAreaUsuario()))) {
                continue;
            }
            String crit = catalogHelper.valorCatalogo(sistema.getIdCriticidad());
            if (!DirectorTexto.matchesFilter(criticidad, crit)) {
                continue;
            }

            List<ValidacionEntity> validaciones = validacionRepository.findByIdSistema(sistema.getIdSistema());
            List<SeguridadEntity> seguridades = seguridadRepository.findByIdSistema(sistema.getIdSistema());
            List<ObservacionEntity> observaciones = observacionRepository.findByIdSistema(sistema.getIdSistema());
            List<RiesgoDTO> riesgos = riesgoMapper.calcularRiesgos(sistema, validaciones, seguridades, observaciones);

            for (RiesgoDTO riesgo : riesgos) {
                // Solo reportar sistemas con riesgo no controlado, o todos si el frontend espera filas.
                ReporteRiesgoDTO dto = new ReporteRiesgoDTO();
                dto.setCodigoSistema(riesgo.getCodigo());
                dto.setRiesgo(riesgo.getTitulo());
                dto.setCategoria(riesgo.getCategoria());
                dto.setEstado(DirectorTexto.upper(riesgo.getEstado()));
                dto.setCriticidad(crit);
                dto.setArea(catalogHelper.valorCatalogo(sistema.getIdAreaUsuario()));
                dto.setFechaIso(DirectorTexto.safe(riesgo.getDetectado()));
                dto.setRiesgoNivel(toNivelReporte(riesgo.getNivel(), riesgo.getNivelTexto()));
                resultados.add(dto);
            }
        }
        return resultados;
    }

    private static String toNivelReporte(String nivelBadge, String nivelTexto) {
        String t = DirectorTexto.upper(nivelTexto);
        if (!t.isEmpty() && (t.contains("CRIT") || t.equals("ALTO") || t.equals("MEDIO") || t.equals("BAJO"))) {
            if (t.contains("CRIT")) return "CRITICO";
            return t.replace("Á", "A").replace("Í", "I");
        }
        return switch (DirectorTexto.safe(nivelBadge).toLowerCase()) {
            case "critico" -> "CRITICO";
            case "advertencia", "alto" -> "MEDIO";
            case "controlado" -> "BAJO";
            default -> "MEDIO";
        };
    }
}

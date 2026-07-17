package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteRiesgoDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.service.ReportesService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesServiceImpl implements ReportesService {

    private final SistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    private final ObservacionRepository observacionRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_FORMAT_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(readOnly = true)
    public List<ReporteInventarioDTO> obtenerInventario(String area, String criticidad) {
        List<SistemaEntity> sistemas = sistemaRepository.findAll();
        return sistemas.stream()
                .filter(s -> area == null || area.isEmpty() || "all".equals(area) || area.equalsIgnoreCase(s.getAreaUsuarioNombre()))
                .filter(s -> criticidad == null || criticidad.isEmpty() || "all".equals(criticidad) || criticidad.equalsIgnoreCase(s.getCriticidadNombre()))
                .map(s -> {
                    ReporteInventarioDTO dto = new ReporteInventarioDTO();
                    dto.setCodigo(s.getCodigoUnico());
                    dto.setNombre(s.getNombre());
                    dto.setTipo("No especificado");
                    dto.setArea(s.getAreaUsuarioNombre());
                    dto.setCriticidad(s.getCriticidadNombre());
                    dto.setEstadoValidacion(s.getEstadoValidacion());
                    dto.setEstadoOperativo("Activo");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteValidacionDTO> obtenerValidacion(String area, String estado) {
        List<ValidacionEntity> validaciones = validacionRepository.findAll();
        return validaciones.stream()
                .filter(v -> {
                    if (area == null || area.isEmpty() || "all".equals(area)) return true;
                    SistemaEntity s = v.getSistema();
                    return s != null && area.equalsIgnoreCase(s.getAreaUsuarioNombre());
                })
                .filter(v -> estado == null || estado.isEmpty() || "all".equals(estado) || estado.equalsIgnoreCase(v.getEstadoValidacion()))
                .map(v -> {
                    ReporteValidacionDTO dto = new ReporteValidacionDTO();
                    SistemaEntity s = v.getSistema();
                    dto.setCodigo(s != null ? s.getCodigoUnico() : "N/A");
                    dto.setNombre(s != null ? s.getNombre() : "N/A");
                    dto.setEstadoValidacion(v.getEstadoValidacion());
                    LocalDateTime fecha = v.getFechaValidacion();
                    dto.setFechaValidacion(fecha != null ? fecha.format(DATE_FORMAT) : "No reportada");
                    dto.setFechaValidacionIso(fecha != null ? fecha.format(DATE_FORMAT_ISO) : null);
                    dto.setArea(s != null ? s.getAreaUsuarioNombre() : "N/A");
                    dto.setCriticidad(s != null ? s.getCriticidadNombre() : "MEDIA");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteRiesgoDTO> obtenerRiesgos(String area, String criticidad) {
        // El reporte de riesgos se arma a partir de las observaciones reales
        // registradas durante la validación técnica (tabla observaciones):
        // cada observación es un riesgo/hallazgo concreto sobre un sistema.
        List<ObservacionEntity> observaciones = observacionRepository.findAll();
        return observaciones.stream()
                .filter(o -> o.getSistema() != null)
                .filter(o -> area == null || area.isEmpty() || "all".equals(area) || area.equalsIgnoreCase(o.getSistema().getAreaUsuarioNombre()))
                .filter(o -> criticidad == null || criticidad.isEmpty() || "all".equals(criticidad) || criticidad.equalsIgnoreCase(o.getSistema().getCriticidadNombre()))
                .map(o -> {
                    SistemaEntity s = o.getSistema();
                    ReporteRiesgoDTO dto = new ReporteRiesgoDTO();
                    dto.setCodigoSistema(s.getCodigoUnico());
                    dto.setRiesgo(o.getDescripcion());
                    dto.setCategoria("No reportada");
                    dto.setEstado(o.getEstadoObservacion() != null ? o.getEstadoObservacion() : "PENDIENTE");
                    dto.setCriticidad(s.getCriticidadNombre());
                    dto.setArea(s.getAreaUsuarioNombre());
                    LocalDateTime fecha = o.getFechaObservacion();
                    dto.setFechaIso(fecha != null ? fecha.format(DATE_FORMAT_ISO) : null);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}

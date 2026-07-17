package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.service.ReportesService;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesServiceImpl implements ReportesService {

    private final SistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
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
                    dto.setCriticidad(s.getCriticidadNombre());
                    dto.setEstadoValidacion(s.getEstadoValidacion());
                    dto.setEstadoOperativo("Activo");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
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
                    dto.setFechaValidacion(v.getFechaValidacion() != null ? v.getFechaValidacion().format(DATE_FORMAT) : "No reportada");
                    dto.setArea(s != null ? s.getAreaUsuarioNombre() : "N/A");
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
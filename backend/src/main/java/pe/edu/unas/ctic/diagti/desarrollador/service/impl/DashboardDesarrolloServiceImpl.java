package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.desarrollador.dto.DashboardDesarrolloDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DashboardDesarrolloService;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;
import pe.edu.unas.ctic.diagti.desarrollador.support.DesarrolladorUsuarioResolver;
import pe.edu.unas.ctic.diagti.desarrollador.support.EstadoFlujoNormalizer;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardDesarrolloServiceImpl implements DashboardDesarrolloService {

    private final DesarrolladorUsuarioResolver usuarioResolver;
    private final DesarrolladorInventarioService inventarioService;
    private final DirectorSistemaRepository sistemaRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardDesarrolloDTO obtenerDashboard(String usuario) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(usuario);
        List<SistemaFrontendDTO> sistemas = inventarioService.listarSistemasDelDesarrollador(
                desarrollador.getUsername(), Map.of());

        DashboardDesarrolloDTO dashboard = new DashboardDesarrolloDTO();
        dashboard.setEstadisticas(obtenerEstadisticasDesdeLista(sistemas));
        dashboard.setActividadReciente(obtenerActividadReciente(desarrollador.getUsername(), 10));
        dashboard.setRiesgosCriticos(obtenerRiesgosCriticos(desarrollador.getUsername()));
        dashboard.setSistemasRecientes(sistemas.stream()
                .limit(5)
                .map(s -> new DashboardDesarrolloDTO.SistemaResumenDTO(
                        parseId(s.getId()),
                        s.getCodigo(),
                        s.getNombre(),
                        EstadoFlujoNormalizer.toBd(s.getEstado()),
                        s.getRiesgo(),
                        null
                ))
                .collect(Collectors.toList()));
        return dashboard;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardDesarrolloDTO.EstadisticasDTO obtenerEstadisticas(String usuario) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(usuario);
        List<SistemaFrontendDTO> sistemas = inventarioService.listarSistemasDelDesarrollador(
                desarrollador.getUsername(), Map.of());
        return obtenerEstadisticasDesdeLista(sistemas);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardDesarrolloDTO.ActividadDTO> obtenerActividadReciente(String usuario, int limite) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(usuario);
        List<SistemaEntity> sistemas = sistemaRepository.findActivosByResponsableTecnico(desarrollador.getIdUsuario());

        return sistemas.stream()
                .sorted(Comparator.comparing(
                        s -> s.getFechaActualizacion() != null ? s.getFechaActualizacion() : LocalDateTime.MIN,
                        Comparator.reverseOrder()))
                .limit(limite)
                .map(s -> new DashboardDesarrolloDTO.ActividadDTO(
                        s.getIdSistema(),
                        s.getNombre(),
                        determinarAccion(s.getEstadoFlujo()),
                        EstadoFlujoNormalizer.toBd(s.getEstadoFlujo()),
                        s.getFechaActualizacion() != null ? s.getFechaActualizacion() : s.getFechaCreacion(),
                        desarrollador.getUsername()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardDesarrolloDTO.RiesgoCriticoDTO> obtenerRiesgosCriticos(String usuario) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(usuario);
        List<SistemaEntity> sistemas = sistemaRepository.findActivosByResponsableTecnico(desarrollador.getIdUsuario());

        return sistemas.stream()
                .filter(s -> s.getNivelRiesgo() != null
                        && ("ALTO".equalsIgnoreCase(s.getNivelRiesgo())
                        || "CRITICO".equalsIgnoreCase(s.getNivelRiesgo())
                        || "CRÍTICO".equalsIgnoreCase(s.getNivelRiesgo())))
                .limit(5)
                .map(s -> new DashboardDesarrolloDTO.RiesgoCriticoDTO(
                        s.getIdSistema(),
                        s.getCodigoUnico(),
                        s.getNombre(),
                        s.getNivelRiesgo(),
                        null,
                        null,
                        (desarrollador.getNombres() + " " + desarrollador.getApellidos()).trim()
                ))
                .collect(Collectors.toList());
    }

    private DashboardDesarrolloDTO.EstadisticasDTO obtenerEstadisticasDesdeLista(List<SistemaFrontendDTO> sistemas) {
        long total = sistemas.size();
        long borrador = sistemas.stream().filter(s -> "Borrador".equalsIgnoreCase(s.getEstado())).count();
        long enviados = sistemas.stream().filter(s -> "Enviado".equalsIgnoreCase(s.getEstado())).count();
        long observados = sistemas.stream().filter(s -> "Observado".equalsIgnoreCase(s.getEstado())).count();
        long validados = sistemas.stream().filter(s -> "Validado".equalsIgnoreCase(s.getEstado())).count();
        long criticos = sistemas.stream()
                .filter(s -> s.getRiesgo() != null
                        && ("ALTO".equalsIgnoreCase(s.getRiesgo()) || "CRITICO".equalsIgnoreCase(s.getRiesgo())))
                .count();

        return new DashboardDesarrolloDTO.EstadisticasDTO(
                total, borrador, enviados, observados, validados, 0L, criticos, 0L
        );
    }

    private String determinarAccion(String estado) {
        return switch (EstadoFlujoNormalizer.toBd(estado)) {
            case "BORRADOR" -> "Creado";
            case "ENVIADO" -> "Enviado a validación";
            case "OBSERVADO" -> "Observado";
            case "SUBSANADO" -> "Subsanado";
            case "VALIDADO" -> "Validado";
            default -> "Actualizado";
        };
    }

    private Long parseId(String id) {
        try {
            return id != null ? Long.parseLong(id) : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}

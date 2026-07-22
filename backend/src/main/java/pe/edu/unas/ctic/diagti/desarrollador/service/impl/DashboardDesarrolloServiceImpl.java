package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.desarrollador.dto.DashboardDesarrolloDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.repository.DesarrolladorValidacionRepository;  // ← CAMBIADO
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaDesarrolloRepository;
import pe.edu.unas.ctic.diagti.desarrollador.service.DashboardDesarrolloService;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardDesarrolloServiceImpl implements DashboardDesarrolloService {
    
    private final SistemaDesarrolloRepository sistemaRepository;
    private final DesarrolladorValidacionRepository validacionRepository;  // ← AGREGADO
    
    @Override
    @Transactional(readOnly = true)
    public DashboardDesarrolloDTO obtenerDashboard(String usuario) {
        String usuarioActual = usuario != null ? usuario : obtenerUsuarioActual();
        
        DashboardDesarrolloDTO dashboard = new DashboardDesarrolloDTO();
        
        // Estadísticas
        dashboard.setEstadisticas(obtenerEstadisticas(usuarioActual));
        
        // Actividad reciente
        dashboard.setActividadReciente(obtenerActividadReciente(usuarioActual, 10));
        
        // Riesgos críticos
        dashboard.setRiesgosCriticos(obtenerRiesgosCriticos(usuarioActual));
        
        // Sistemas recientes
        dashboard.setSistemasRecientes(obtenerSistemasRecientes(usuarioActual));
        
        return dashboard;
    }
    
    @Override
    @Transactional(readOnly = true)
    public DashboardDesarrolloDTO.EstadisticasDTO obtenerEstadisticas(String usuario) {
        String usuarioActual = usuario != null ? usuario : obtenerUsuarioActual();
        
        List<SistemaEntity> sistemas = sistemaRepository
                .findByResponsableTecnicoAndEliminadoFalse(usuarioActual);
        
        long total = sistemas.size();
        long borrador = sistemas.stream().filter(s -> "BORRADOR".equals(s.getEstado())).count();
        long enviados = sistemas.stream().filter(s -> "ENVIADO".equals(s.getEstado())).count();
        long observados = sistemas.stream().filter(s -> "OBSERVADO".equals(s.getEstado())).count();
        long validados = sistemas.stream().filter(s -> "VALIDADO".equals(s.getEstado())).count();
        long legacy = sistemas.stream().filter(s -> Boolean.TRUE.equals(s.getEsLegacy())).count();
        long criticos = sistemas.stream()
                .filter(s -> "CRITICA".equals(s.getCriticidad()) || "ALTA".equals(s.getCriticidad()))
                .count();
        
        // Evidencias cargadas
        long evidencias = sistemas.stream()
                .mapToLong(s -> s.getEvidencias() != null ? 
                        s.getEvidencias().stream().filter(e -> !Boolean.TRUE.equals(e.getEliminado())).count() : 0)
                .sum();
        
        return new DashboardDesarrolloDTO.EstadisticasDTO(
                total, borrador, enviados, observados, validados, legacy, criticos, evidencias
        );
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<DashboardDesarrolloDTO.ActividadDTO> obtenerActividadReciente(String usuario, int limite) {
        String usuarioActual = usuario != null ? usuario : obtenerUsuarioActual();
        
        List<SistemaEntity> sistemas = sistemaRepository
                .findByResponsableTecnicoAndEliminadoFalse(usuarioActual);
        
        return sistemas.stream()
                .sorted(Comparator.comparing(
                        s -> s.getFechaActualizacion() != null ? s.getFechaActualizacion() : LocalDateTime.MIN,
                        Comparator.reverseOrder()
                ))
                .limit(limite)
                .map(s -> {
                    String accion = determinarAccion(s);
                    return new DashboardDesarrolloDTO.ActividadDTO(
                            s.getId(),
                            s.getNombre(),
                            accion,
                            s.getEstado(),
                            s.getFechaActualizacion(),
                            s.getUsuarioModificador() != null ? s.getUsuarioModificador() : s.getUsuarioCreador()
                    );
                })
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<DashboardDesarrolloDTO.RiesgoCriticoDTO> obtenerRiesgosCriticos(String usuario) {
        String usuarioActual = usuario != null ? usuario : obtenerUsuarioActual();
        
        List<SistemaEntity> sistemas = sistemaRepository
                .findByResponsableTecnicoAndEliminadoFalse(usuarioActual);
        
        return sistemas.stream()
                .filter(s -> s.getPuntajeRiesgo() != null && s.getPuntajeRiesgo() >= 60)
                .sorted((s1, s2) -> {
                    Integer p1 = s1.getPuntajeRiesgo() != null ? s1.getPuntajeRiesgo() : 0;
                    Integer p2 = s2.getPuntajeRiesgo() != null ? s2.getPuntajeRiesgo() : 0;
                    return p2.compareTo(p1);
                })
                .limit(5)
                .map(s -> new DashboardDesarrolloDTO.RiesgoCriticoDTO(
                        s.getId(),
                        s.getCodigo(),
                        s.getNombre(),
                        s.getNivelRiesgo(),
                        s.getPuntajeRiesgo(),
                        s.getCriticidad(),
                        s.getResponsableTecnico()
                ))
                .collect(Collectors.toList());
    }
    
    private List<DashboardDesarrolloDTO.SistemaResumenDTO> obtenerSistemasRecientes(String usuario) {
        String usuarioActual = usuario != null ? usuario : obtenerUsuarioActual();
        
        List<SistemaEntity> sistemas = sistemaRepository
                .findByResponsableTecnicoAndEliminadoFalse(usuarioActual);
        
        return sistemas.stream()
                .sorted(Comparator.comparing(
                        s -> s.getFechaActualizacion() != null ? s.getFechaActualizacion() : LocalDateTime.MIN,
                        Comparator.reverseOrder()
                ))
                .limit(5)
                .map(s -> new DashboardDesarrolloDTO.SistemaResumenDTO(
                        s.getId(),
                        s.getCodigo(),
                        s.getNombre(),
                        s.getEstado(),
                        s.getNivelRiesgo(),
                        s.getFechaActualizacion()
                ))
                .collect(Collectors.toList());
    }
    
    private String determinarAccion(SistemaEntity sistema) {
        if ("BORRADOR".equals(sistema.getEstado())) {
            return "Creado";
        } else if ("ENVIADO".equals(sistema.getEstado())) {
            return "Enviado a validación";
        } else if ("OBSERVADO".equals(sistema.getEstado())) {
            return "Observado";
        } else if ("SUBSANADO".equals(sistema.getEstado())) {
            return "Subsanado";
        } else if ("VALIDADO".equals(sistema.getEstado())) {
            return "Validado";
        } else {
            return "Actualizado";
        }
    }
    
    private String obtenerUsuarioActual() {
        // TODO: Implementar obtención del usuario desde el contexto de seguridad
        return "desarrollador1";
    }
}
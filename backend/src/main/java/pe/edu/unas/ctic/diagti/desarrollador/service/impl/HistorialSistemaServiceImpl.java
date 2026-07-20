package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.desarrollador.dto.HistorialSistemaDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.desarrollador.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.desarrollador.service.HistorialSistemaService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialSistemaServiceImpl implements HistorialSistemaService {
    
    private final SistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    
    @Override
    @Transactional(readOnly = true)
    public HistorialSistemaDTO obtenerHistorial(Long id) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        // Verificar acceso
        String usuarioActual = obtenerUsuarioActual();
        if (!sistema.getResponsableTecnico().equals(usuarioActual) && !esAdministrador(usuarioActual)) {
            throw new RuntimeException("No tiene acceso a este sistema");
        }
        
        HistorialSistemaDTO dto = new HistorialSistemaDTO();
        
        // Resumen del sistema
        dto.setSistema(crearResumen(sistema));
        
        // Trazabilidad
        List<HistorialSistemaDTO.EventoDTO> eventos = new ArrayList<>();
        
        // 1. Evento de creación
        eventos.add(crearEventoCreacion(sistema));
        
        // 2. Eventos de validaciones
        List<ValidacionEntity> validaciones = validacionRepository
                .findBySistemaIdOrderByFechaValidacionDesc(sistema.getId());
        
        for (ValidacionEntity validacion : validaciones) {
            eventos.add(crearEventoValidacion(validacion));
        }
        
        // 3. Eventos de cambios (si hay auditoría)
        // TODO: Implementar cuando se tenga la tabla de auditoría
        // eventos.addAll(obtenerEventosAuditoria(sistema));
        
        // Ordenar eventos por fecha (más reciente primero)
        eventos.sort((e1, e2) -> e2.getFecha().compareTo(e1.getFecha()));
        
        dto.setTrazabilidad(eventos);
        
        return dto;
    }
    
    @Override
    @Transactional(readOnly = true)
    public HistorialSistemaDTO.ResumenSistemaDTO obtenerResumen(Long id) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        return crearResumen(sistema);
    }
    
    // ============================================================
    // MÉTODOS PRIVADOS
    // ============================================================
    
    private HistorialSistemaDTO.ResumenSistemaDTO crearResumen(SistemaEntity sistema) {
        HistorialSistemaDTO.ResumenSistemaDTO resumen = new HistorialSistemaDTO.ResumenSistemaDTO();
        resumen.setId(sistema.getId());
        resumen.setCodigo(sistema.getCodigo());
        resumen.setNombre(sistema.getNombre());
        resumen.setEstadoActual(sistema.getEstado());
        resumen.setAreaUsuaria(sistema.getAreaUsuaria());
        resumen.setResponsableTecnico(sistema.getResponsableTecnico());
        resumen.setResponsableFuncional(sistema.getResponsableFuncional());
        resumen.setCriticidad(sistema.getCriticidad());
        resumen.setNivelRiesgo(sistema.getNivelRiesgo());
        resumen.setPuntajeRiesgo(sistema.getPuntajeRiesgo());
        resumen.setFechaCreacion(sistema.getFechaCreacion());
        resumen.setFechaActualizacion(sistema.getFechaActualizacion());
        resumen.setUsuarioCreador(sistema.getUsuarioCreador());
        resumen.setUsuarioModificador(sistema.getUsuarioModificador());
        return resumen;
    }
    
    private HistorialSistemaDTO.EventoDTO crearEventoCreacion(SistemaEntity sistema) {
        HistorialSistemaDTO.EventoDTO evento = new HistorialSistemaDTO.EventoDTO();
        evento.setFecha(sistema.getFechaCreacion());
        evento.setUsuario(sistema.getUsuarioCreador() != null ? sistema.getUsuarioCreador() : "Sistema");
        evento.setAccion("Creó el sistema");
        evento.setEstado("BORRADOR");
        evento.setTipoEvento("CREACION");
        evento.setDescripcion("Registro inicial del sistema");
        evento.setEntidadAfectada("SistemaInformatico");
        return evento;
    }
    
    private HistorialSistemaDTO.EventoDTO crearEventoValidacion(ValidacionEntity validacion) {
        HistorialSistemaDTO.EventoDTO evento = new HistorialSistemaDTO.EventoDTO();
        evento.setFecha(validacion.getFechaValidacion());
        
        String estado = validacion.getEstadoValidacion();
        String accion;
        String descripcion;
        String tipoEvento;
        
        switch (estado) {
            case "ENVIADO":
                accion = "Envió a validación técnica";
                descripcion = "Sistema enviado para revisión por CTIC";
                tipoEvento = "ENVIO";
                evento.setUsuario(validacion.getValidador());
                break;
            case "OBSERVADO":
                accion = "Observó el registro";
                descripcion = validacion.getObservacion() != null ? 
                        "Observación: " + validacion.getObservacion() : 
                        "Se realizaron observaciones técnicas";
                tipoEvento = "OBSERVACION";
                evento.setUsuario(validacion.getValidador());
                break;
            case "SUBSANADO":
                accion = "Subsanó observaciones";
                descripcion = validacion.getComentarioSubsanacion() != null ?
                        "Comentario: " + validacion.getComentarioSubsanacion() :
                        "Se subsanaron las observaciones realizadas";
                tipoEvento = "SUBSANACION";
                evento.setUsuario(validacion.getUsuarioSubsanacion());
                break;
            case "APROBADO":
                accion = "Aprobó el sistema";
                descripcion = validacion.getObservacion() != null ?
                        "Comentario: " + validacion.getObservacion() :
                        "Sistema validado y aprobado";
                tipoEvento = "VALIDACION";
                evento.setUsuario(validacion.getValidador());
                break;
            case "RECHAZADO":
                accion = "Rechazó el sistema";
                descripcion = validacion.getObservacion() != null ?
                        "Motivo: " + validacion.getObservacion() :
                        "Sistema rechazado en validación";
                tipoEvento = "VALIDACION";
                evento.setUsuario(validacion.getValidador());
                break;
            default:
                accion = "Validación: " + estado;
                descripcion = validacion.getObservacion() != null ? validacion.getObservacion() : "Registro de validación";
                tipoEvento = "VALIDACION";
                evento.setUsuario(validacion.getValidador());
                break;
        }
        
        evento.setAccion(accion);
        evento.setEstado(estado);
        evento.setDescripcion(descripcion);
        evento.setTipoEvento(tipoEvento);
        evento.setEntidadAfectada("ValidacionTecnica");
        
        return evento;
    }
    
    private String obtenerUsuarioActual() {
        // TODO: Implementar obtención del usuario desde el contexto de seguridad
        return "desarrollador1";
    }
    
    private boolean esAdministrador(String usuario) {
        // TODO: Verificar si el usuario tiene rol de administrador
        return "admin".equals(usuario);
    }
}
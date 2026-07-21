package pe.edu.unas.ctic.diagti.auditor.service;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.model.Auditoria;
import pe.edu.unas.ctic.diagti.auditor.repository.AuditorAuditoriaRepository;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuditorAuditoriaServiceImpl implements AuditoriaService {
    
    @Autowired
    private AuditorAuditoriaRepository auditoriaRepository;
    
    @Autowired
    private LoginUsuarioRepository usuarioRepository;
    
    @Override
    public List<AuditoriaResponseDTO> getAuditoria(AuditoriaRequestDTO request) {
        // Convertir fechas
        LocalDateTime fechaDesde = null;
        LocalDateTime fechaHasta = null;
        
        if (request.getFechaDesde() != null) {
            fechaDesde = request.getFechaDesde().atStartOfDay();
        }
        
        if (request.getFechaHasta() != null) {
            fechaHasta = request.getFechaHasta().atTime(LocalTime.MAX);
        }
        
        // Buscar auditoría con filtros
        List<Auditoria> auditorias = auditoriaRepository.filtrarAuditoria(
            request.getSearchText(),
            request.getModulo(),
            request.getAccion(),
            fechaDesde,
            fechaHasta
        );
        
        // Obtener nombres de usuarios
        return auditorias.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Long> getKPIs() {
        Map<String, Long> kpis = new HashMap<>();
        
        kpis.put("total", auditoriaRepository.count());
        kpis.put("consultas", auditoriaRepository.countConsultas());
        kpis.put("intentosFallidos", auditoriaRepository.countIntentosFallidos());
        kpis.put("exportaciones", auditoriaRepository.countExportaciones());
        
        return kpis;
    }
    
    @Override
    @Transactional
    public void registrarEvento(Long idUsuario, String modulo, String accion, String descripcion, String ip) {
        Auditoria auditoria = new Auditoria();
        auditoria.setIdUsuario(idUsuario);
        auditoria.setModulo(modulo);
        auditoria.setAccion(accion);
        auditoria.setDescripcion(descripcion);
        auditoria.setDireccionIp(ip);
        auditoria.setFechaEvento(LocalDateTime.now());
        
        auditoriaRepository.save(auditoria);
    }
    
    private AuditoriaResponseDTO convertirADTO(Auditoria auditoria) {
        AuditoriaResponseDTO dto = new AuditoriaResponseDTO();
        dto.setIdAuditoria(auditoria.getIdAuditoria());
        dto.setIdUsuario(auditoria.getIdUsuario());
        dto.setModulo(auditoria.getModulo());
        dto.setAccion(auditoria.getAccion());
        dto.setDescripcion(auditoria.getDescripcion());
        dto.setFechaEvento(auditoria.getFechaEvento());
        dto.setDireccionIp(auditoria.getDireccionIp());
        
        // Obtener datos del usuario
        if (auditoria.getIdUsuario() != null) {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(auditoria.getIdUsuario());
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                dto.setNombreUsuario(usuario.getNombres() + " " + usuario.getApellidos());
                dto.setCorreoUsuario(usuario.getCorreo());
            } else {
                dto.setNombreUsuario("Usuario eliminado");
                dto.setCorreoUsuario("Sin correo");
            }
        } else {
            dto.setNombreUsuario("Usuario no registrado");
            dto.setCorreoUsuario("Sin correo");
        }
        
        return dto;
    }
}
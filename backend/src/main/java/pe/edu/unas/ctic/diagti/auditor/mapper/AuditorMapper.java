package pe.edu.unas.ctic.diagti.auditor.mapper;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.model.Auditoria;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;

public class AuditorMapper {

    public static AuditorAuditoriaResponseDTO toResponseDTO(Auditoria auditoria, Usuario usuario) {
        AuditorAuditoriaResponseDTO dto = new AuditorAuditoriaResponseDTO();
        
        dto.setIdAuditoria(auditoria.getIdAuditoria());
        dto.setIdUsuario(auditoria.getIdUsuario());
        dto.setModulo(auditoria.getModulo());
        dto.setAccion(auditoria.getAccion());
        dto.setDescripcion(auditoria.getDescripcion());
        dto.setFechaEvento(auditoria.getFechaEvento());
        dto.setDireccionIp(auditoria.getDireccionIp());
        
        if (usuario != null) {
            dto.setNombreUsuario(usuario.getNombres() + " " + usuario.getApellidos());
            dto.setCorreoUsuario(usuario.getCorreo());
        } else {
            dto.setNombreUsuario("Usuario no registrado");
            dto.setCorreoUsuario("Sin correo");
        }
        
        return dto;
    }

    public static AuditorAuditoriaResponseDTO toResponseDTO(Auditoria auditoria) {
        return toResponseDTO(auditoria, null);
    }
}
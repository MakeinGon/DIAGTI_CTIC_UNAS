package pe.edu.unas.ctic.diagti.auditor.mapper;

import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

public final class AuditorMapper {

    private AuditorMapper() {
    }

    public static AuditorAuditoriaResponseDTO toResponseDTO(AuditoriaEntity auditoria, Usuario usuario) {
        AuditorAuditoriaResponseDTO dto = new AuditorAuditoriaResponseDTO();
        dto.setIdAuditoria(auditoria.getIdAuditoria());
        dto.setIdUsuario(auditoria.getIdUsuario());
        dto.setModulo(DirectorTexto.safe(auditoria.getModulo()));
        dto.setAccion(DirectorTexto.safe(auditoria.getAccion()));
        dto.setDescripcion(DirectorTexto.safe(auditoria.getDescripcion()));
        dto.setFechaEvento(auditoria.getFechaEvento());
        dto.setDireccionIp(DirectorTexto.safe(auditoria.getDireccionIp()));

        if (usuario != null) {
            String nombres = DirectorTexto.safe(usuario.getNombres());
            String apellidos = DirectorTexto.safe(usuario.getApellidos());
            String full = (nombres + " " + apellidos).trim();
            dto.setNombreUsuario(full.isEmpty() ? DirectorTexto.safe(usuario.getUsername()) : full);
            dto.setCorreoUsuario(DirectorTexto.safe(usuario.getCorreo()));
        } else {
            dto.setNombreUsuario("Usuario no registrado");
            dto.setCorreoUsuario("Sin correo");
        }
        return dto;
    }
}

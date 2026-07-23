package pe.edu.unas.ctic.diagti.administrador.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Component
public class UsuarioMapper {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public UsuarioDTO toDTO(UsuarioEntity entity) {
        if (entity == null) return null;
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsuarioId(entity.getIdUsuario());
        dto.setUsername(entity.getUsername());
        dto.setNombres(entity.getNombres());
        dto.setApellidos(entity.getApellidos());
        dto.setDni(entity.getDni());
        String nombres = entity.getNombres() != null ? entity.getNombres() : "";
        String apellidos = entity.getApellidos() != null ? entity.getApellidos() : "";
        dto.setNombreCompleto((nombres + " " + apellidos).trim());
        dto.setCorreo(entity.getCorreo());
        dto.setArea(entity.getArea());
        if (entity.getRoles() != null && !entity.getRoles().isEmpty()) {
            RolEntity primerRol = entity.getRoles().iterator().next();
            dto.setRolId(primerRol.getIdRol());
            dto.setRol(primerRol.getNombre());
            dto.setRoles(entity.getRoles().stream().map(RolEntity::getNombre).collect(Collectors.toList()));
        }
        dto.setOrigen(entity.getOrigen());
        dto.setEstado(Boolean.TRUE.equals(entity.getEstado()) ? "Activo" : "Inactivo");
        if (entity.getUltimoAcceso() != null) {
            dto.setUltimoAcceso(entity.getUltimoAcceso().format(DATE_FORMAT));
        }
        if (entity.getFechaCreacion() != null) {
            dto.setFechaCreacion(entity.getFechaCreacion().format(DATE_FORMAT));
        }
        return dto;
    }
}

package pe.edu.unas.ctic.diagti.administrador.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.dto.RolDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;

@Component
public class RolMapper {

    public RolDTO toDTO(RolEntity entity, Integer cantidadUsuarios) {
        if (entity == null) return null;
        RolDTO dto = new RolDTO();
        dto.setId(entity.getIdRol());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado() ? "Activo" : "Inactivo");
        dto.setCantidadUsuarios(cantidadUsuarios != null ? cantidadUsuarios : 0);
        return dto;
    }
}
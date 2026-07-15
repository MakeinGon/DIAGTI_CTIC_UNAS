package pe.edu.unas.ctic.diagti.administrador.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.dto.PermisoDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.PermisoEntity;

@Component
public class PermisoMapper {

    public PermisoDTO toDTO(PermisoEntity entity) {
        if (entity == null) return null;
        PermisoDTO dto = new PermisoDTO();
        dto.setModulo(entity.getModulo());
        dto.setVer(entity.getVer());
        dto.setCrear(entity.getCrear());
        dto.setEditar(entity.getEditar());
        dto.setEliminar(entity.getEliminar());
        dto.setValidar(entity.getValidar());
        dto.setExportar(entity.getExportar());
        return dto;
    }

    public PermisoEntity toEntity(PermisoDTO dto, Long idRol) {
        PermisoEntity entity = new PermisoEntity();
        entity.setIdRol(idRol);
        entity.setModulo(dto.getModulo());
        entity.setVer(dto.getVer() != null && dto.getVer());
        entity.setCrear(dto.getCrear() != null && dto.getCrear());
        entity.setEditar(dto.getEditar() != null && dto.getEditar());
        entity.setEliminar(dto.getEliminar() != null && dto.getEliminar());
        entity.setValidar(dto.getValidar() != null && dto.getValidar());
        entity.setExportar(dto.getExportar() != null && dto.getExportar());
        return entity;
    }
}
package pe.edu.unas.ctic.diagti.administrador.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.dto.CatalogoDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;

@Component
public class CatalogoMapper {

    public CatalogoDTO toDTO(CatalogoEntity entity) {
        if (entity == null) return null;
        CatalogoDTO dto = new CatalogoDTO();
        dto.setCodigo(entity.getCodigo());
        dto.setNombre(entity.getValor());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado() ? "Activo" : "Inactivo");
        dto.setOrden(entity.getOrden());
        return dto;
    }

    public CatalogoEntity toEntity(CatalogoDTO dto, String tipoCatalogo) {
        CatalogoEntity entity = new CatalogoEntity();
        entity.setTipoCatalogo(tipoCatalogo);
        entity.setCodigo(dto.getCodigo());
        entity.setValor(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setEstado("Activo".equals(dto.getEstado()));
        entity.setOrden(dto.getOrden());
        return entity;
    }
}
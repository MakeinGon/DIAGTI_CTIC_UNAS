package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import pe.edu.unas.ctic.diagti.desarrollador.dto.ArquitecturaDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ArquitecturaEntity;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ArquitecturaMapper {
    
    ArquitecturaDTO toDto(ArquitecturaEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    ArquitecturaEntity toEntity(ArquitecturaDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    void updateEntity(ArquitecturaDTO dto, @MappingTarget ArquitecturaEntity entity);
}
package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import pe.edu.unas.ctic.diagti.desarrollador.dto.InfraestructuraDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.InfraestructuraEntity;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface InfraestructuraMapper {
    
    InfraestructuraDTO toDto(InfraestructuraEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    InfraestructuraEntity toEntity(InfraestructuraDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    void updateEntity(InfraestructuraDTO dto, @MappingTarget InfraestructuraEntity entity);
}
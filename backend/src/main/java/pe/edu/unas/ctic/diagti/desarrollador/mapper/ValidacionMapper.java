package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import pe.edu.unas.ctic.diagti.desarrollador.dto.ValidacionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ValidacionMapper {
    
    ValidacionDTO toDto(ValidacionEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaValidacion", ignore = true)
    @Mapping(target = "fechaSubsanacion", ignore = true)
    @Mapping(target = "esUltima", constant = "true")
    ValidacionEntity toEntity(ValidacionDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaValidacion", ignore = true)
    @Mapping(target = "fechaSubsanacion", ignore = true)
    @Mapping(target = "esUltima", ignore = true)
    void updateEntity(ValidacionDTO dto, @MappingTarget ValidacionEntity entity);
}
package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import pe.edu.unas.ctic.diagti.desarrollador.dto.IntegracionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.IntegracionEntity;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface IntegracionMapper {
    
    @Mapping(target = "sistemaOrigen", source = "sistemaOrigen")
    @Mapping(target = "sistemaDestino", source = "sistemaDestino")
    IntegracionDTO toDto(IntegracionEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    @Mapping(target = "eliminado", constant = "false")
    IntegracionEntity toEntity(IntegracionDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    @Mapping(target = "eliminado", ignore = true)
    void updateEntity(IntegracionDTO dto, @MappingTarget IntegracionEntity entity);
}
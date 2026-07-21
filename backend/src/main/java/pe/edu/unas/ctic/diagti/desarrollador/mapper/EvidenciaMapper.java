package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EvidenciaDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.EvidenciaEntity;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EvidenciaMapper {
    
    EvidenciaDTO toDto(EvidenciaEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCarga", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "eliminado", constant = "false")
    @Mapping(target = "estado", constant = "ACTIVO")
    EvidenciaEntity toEntity(EvidenciaDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCarga", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "eliminado", ignore = true)
    @Mapping(target = "estado", ignore = true)
    void updateEntity(EvidenciaDTO dto, @MappingTarget EvidenciaEntity entity);
}
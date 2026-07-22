package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import pe.edu.unas.ctic.diagti.desarrollador.dto.ValidacionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ValidacionMapper {

    ValidacionMapper INSTANCE = Mappers.getMapper(ValidacionMapper.class);

    // Mapear de Entity a DTO - SOLO LOS CAMPOS QUE EXISTEN EN EL DTO
    @Mapping(source = "id", target = "id")
    @Mapping(source = "fechaValidacion", target = "fechaValidacion")
    @Mapping(source = "observacion", target = "observacion")
    @Mapping(source = "comentarioSubsanacion", target = "comentarioSubsanacion")
    @Mapping(source = "estadoValidacion", target = "estadoValidacion")
    @Mapping(source = "validador", target = "validador")
    @Mapping(source = "esUltima", target = "esUltima")
    // El DTO no tiene sistemaId, así que lo ignoramos
    ValidacionDTO toDTO(ValidacionEntity entity);

    // Mapear de DTO a Entity - SOLO LOS CAMPOS QUE EXISTEN EN LA ENTITY
    @Mapping(source = "id", target = "id")
    @Mapping(source = "fechaValidacion", target = "fechaValidacion")
    @Mapping(source = "observacion", target = "observacion")
    @Mapping(source = "comentarioSubsanacion", target = "comentarioSubsanacion")
    @Mapping(source = "estadoValidacion", target = "estadoValidacion")
    @Mapping(source = "validador", target = "validador")
    @Mapping(source = "esUltima", target = "esUltima")
    // El DTO no tiene sistemaId, así que lo ignoramos
    ValidacionEntity toEntity(ValidacionDTO dto);

    List<ValidacionDTO> toDTOList(List<ValidacionEntity> entities);
}
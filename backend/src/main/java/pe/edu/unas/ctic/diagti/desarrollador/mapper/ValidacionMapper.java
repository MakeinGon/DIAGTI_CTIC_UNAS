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

    @Mapping(source = "sistemaId", target = "sistemaId")
    ValidacionDTO toDTO(ValidacionEntity entity);

    @Mapping(source = "sistemaId", target = "sistemaId")
    @Mapping(target = "sistema", ignore = true)
    ValidacionEntity toEntity(ValidacionDTO dto);

    List<ValidacionDTO> toDTOList(List<ValidacionEntity> entities);
}

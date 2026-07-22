package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaCompletoDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {ArquitecturaMapper.class, InfraestructuraMapper.class, 
                SeguridadMapper.class, EvidenciaMapper.class, 
                ValidacionMapper.class, IntegracionMapper.class})
public interface SistemaMapper {
    
    @Mapping(target = "urls", ignore = true)
    SistemaCompletoDTO toCompletoDto(SistemaEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", constant = "BORRADOR")
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "eliminado", constant = "false")
    @Mapping(target = "nivelRiesgo", ignore = true)
    @Mapping(target = "puntajeRiesgo", ignore = true)
    @Mapping(target = "usuarioCreador", ignore = true)
    @Mapping(target = "usuarioModificador", ignore = true)
    @Mapping(target = "arquitectura", ignore = true)
    @Mapping(target = "infraestructura", ignore = true)
    @Mapping(target = "seguridad", ignore = true)
    @Mapping(target = "evidencias", ignore = true)
    @Mapping(target = "validaciones", ignore = true)
    @Mapping(target = "integraciones", ignore = true)
    SistemaEntity toEntity(RegistrarSistemaRequestDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "eliminado", ignore = true)
    @Mapping(target = "nivelRiesgo", ignore = true)
    @Mapping(target = "puntajeRiesgo", ignore = true)
    @Mapping(target = "usuarioCreador", ignore = true)
    @Mapping(target = "usuarioModificador", ignore = true)
    @Mapping(target = "arquitectura", ignore = true)
    @Mapping(target = "infraestructura", ignore = true)
    @Mapping(target = "seguridad", ignore = true)
    @Mapping(target = "evidencias", ignore = true)
    @Mapping(target = "validaciones", ignore = true)
    @Mapping(target = "integraciones", ignore = true)
    void updateEntity(RegistrarSistemaRequestDTO dto, @MappingTarget SistemaEntity entity);
}
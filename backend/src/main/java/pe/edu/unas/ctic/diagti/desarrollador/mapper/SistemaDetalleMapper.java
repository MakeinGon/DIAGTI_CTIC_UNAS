package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import pe.edu.unas.ctic.diagti.desarrollador.dto.ArquitecturaDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EvidenciaDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.InfraestructuraDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.IntegracionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SeguridadDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ArquitecturaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.EvidenciaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.InfraestructuraEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.IntegracionEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SeguridadEntity;

/**
 * Centraliza el mapeo de las secciones técnicas de un sistema.
 *
 * <p>Antes existía una interfaz MapStruct por cada sección. Los métodos se
 * mantienen equivalentes, pero agrupados en un único componente que utilizan
 * los servicios de registro y edición.</p>
 */
@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SistemaDetalleMapper {

    ArquitecturaDTO arquitecturaToDto(ArquitecturaEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    ArquitecturaEntity arquitecturaToEntity(ArquitecturaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    void actualizarArquitectura(ArquitecturaDTO dto, @MappingTarget ArquitecturaEntity entity);

    InfraestructuraDTO infraestructuraToDto(InfraestructuraEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    InfraestructuraEntity infraestructuraToEntity(InfraestructuraDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    void actualizarInfraestructura(InfraestructuraDTO dto, @MappingTarget InfraestructuraEntity entity);

    SeguridadDTO seguridadToDto(SeguridadEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    SeguridadEntity seguridadToEntity(SeguridadDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    void actualizarSeguridad(SeguridadDTO dto, @MappingTarget SeguridadEntity entity);

    @Mapping(target = "sistemaOrigen", source = "sistemaOrigen")
    @Mapping(target = "sistemaDestino", source = "sistemaDestino")
    IntegracionDTO integracionToDto(IntegracionEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    @Mapping(target = "eliminado", constant = "false")
    IntegracionEntity integracionToEntity(IntegracionDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    @Mapping(target = "eliminado", ignore = true)
    void actualizarIntegracion(IntegracionDTO dto, @MappingTarget IntegracionEntity entity);

    EvidenciaDTO evidenciaToDto(EvidenciaEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCarga", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "eliminado", constant = "false")
    @Mapping(target = "estado", constant = "ACTIVO")
    EvidenciaEntity evidenciaToEntity(EvidenciaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sistema", ignore = true)
    @Mapping(target = "fechaCarga", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "eliminado", ignore = true)
    @Mapping(target = "estado", ignore = true)
    void actualizarEvidencia(EvidenciaDTO dto, @MappingTarget EvidenciaEntity entity);
}

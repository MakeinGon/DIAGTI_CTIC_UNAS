package pe.edu.unas.ctic.diagti.desarrollador.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.desarrollador.dto.DesarrolloFlujoDTO;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;

import java.util.Collections;
import java.util.Map;

@Component
public class DesarrolloFlujoMapper {
    private final ObjectMapper objectMapper;

    public DesarrolloFlujoMapper(ObjectMapper objectMapper) { this.objectMapper = objectMapper; }

    public DesarrolloFlujoDTO toDto(RegistroArea entity) {
        DesarrolloFlujoDTO dto = new DesarrolloFlujoDTO();
        dto.setId(entity.getId());
        dto.setCodigoSistema(entity.getCodigoSistema());
        dto.setNombreSistema(entity.getNombreSistema());
        dto.setAreaUsuaria(entity.getAreaUsuaria());
        dto.setResponsable(entity.getResponsable());
        dto.setUsuarioOrigen(entity.getUsuarioOrigen());
        dto.setEstado(entity.getEstado());
        dto.setDatos(leerDatos(entity.getDatosJson()));
        dto.setComentarioRevision(entity.getComentarioRevision());
        dto.setObservacionesJson(entity.getObservacionesJson());
        dto.setRevisadoPor(entity.getRevisadoPor());
        dto.setUsuarioRevisor(entity.getUsuarioRevisor());
        dto.setFechaEnvio(entity.getFechaEnvio());
        dto.setFechaRevision(entity.getFechaRevision());
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setFechaActualizacion(entity.getFechaActualizacion());
        return dto;
    }

    private Map<String, Object> leerDatos(String json) {
        try { return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {}); }
        catch (Exception ignored) { return Collections.emptyMap(); }
    }
}

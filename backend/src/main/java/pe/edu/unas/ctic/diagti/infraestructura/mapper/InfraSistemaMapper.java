package pe.edu.unas.ctic.diagti.infraestructura.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDTO;

import java.util.Collections;
import java.util.Map;

@Component
public class InfraSistemaMapper {
    private final ObjectMapper objectMapper;
    public InfraSistemaMapper(ObjectMapper objectMapper) { this.objectMapper = objectMapper; }

    public InfraSistemaDTO desdeAsignacion(SolicitudValidacion desarrollo, RegistroArea infraestructura) {
        InfraSistemaDTO dto = new InfraSistemaDTO();
        dto.setCodigoSistema(desarrollo.getCodigoSistema());
        dto.setNombreSistema(desarrollo.getNombreSistema());
        dto.setAreaUsuaria(desarrollo.getAreaUsuaria());
        dto.setResponsableDesarrollo(desarrollo.getResponsable());
        dto.setDatosDesarrollo(leer(desarrollo.getDatosJson()));
        dto.setFechaEnvioDesarrollo(desarrollo.getFechaEnvio());
        if (infraestructura == null) {
            dto.setEstado("NUEVO");
            dto.setDatosInfraestructura(Collections.emptyMap());
            return dto;
        }
        dto.setIdRegistro(infraestructura.getId());
        dto.setResponsableInfraestructura(infraestructura.getResponsable());
        dto.setUsuarioInfraestructura(infraestructura.getUsuarioOrigen());
        dto.setEstado(infraestructura.getEstado());
        dto.setDatosInfraestructura(leer(infraestructura.getDatosJson()));
        dto.setComentarioRevision(infraestructura.getComentarioRevision());
        dto.setObservacionesJson(infraestructura.getObservacionesJson());
        dto.setRevisadoPor(infraestructura.getRevisadoPor());
        dto.setFechaEnvioInfraestructura(infraestructura.getFechaEnvio());
        dto.setFechaRevision(infraestructura.getFechaRevision());
        dto.setFechaActualizacion(infraestructura.getFechaActualizacion());
        return dto;
    }

    public InfraSistemaDTO desdeRegistro(RegistroArea registro) {
        SolicitudValidacion base = new SolicitudValidacion();
        base.setCodigoSistema(registro.getCodigoSistema());
        base.setNombreSistema(registro.getNombreSistema());
        base.setAreaUsuaria(registro.getAreaUsuaria());
        base.setResponsable(registro.getResponsable());
        base.setDatosJson("{}");
        return desdeAsignacion(base, registro);
    }

    public Map<String, Object> leer(String json) {
        try { return objectMapper.readValue(json == null ? "{}" : json, new TypeReference<Map<String, Object>>() {}); }
        catch (Exception ignored) { return Collections.emptyMap(); }
    }
}

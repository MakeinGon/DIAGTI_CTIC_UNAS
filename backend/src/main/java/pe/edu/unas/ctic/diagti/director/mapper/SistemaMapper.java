package pe.edu.unas.ctic.diagti.director.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.director.dto.SistemaResumenDTO;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;

import java.util.Comparator;

@Component
public class SistemaMapper {

    public SistemaResumenDTO toResumenDTO(SistemaEntity entity) {
        if (entity == null) return null;
        SistemaResumenDTO dto = new SistemaResumenDTO();
        dto.setCodigo(entity.getCodigoUnico());
        dto.setNombre(entity.getNombre());
        dto.setArea(entity.getAreaUsuarioNombre());
        // Tipo: podrías obtenerlo de catálogos, por ahora placeholder
        dto.setTipo("No especificado");
        // Exposición: podrías obtenerla de infraestructura
        dto.setExposicion("No registrada");
        dto.setValidacion(entity.getEstadoValidacion().toLowerCase());
        dto.setCriticidad(entity.getCriticidadNombre().toLowerCase());

        // Alerta: primera observación pendiente (si existe)
        if (entity.getObservaciones() != null && !entity.getObservaciones().isEmpty()) {
            ObservacionEntity obs = entity.getObservaciones().stream()
                    .filter(o -> "PENDIENTE".equalsIgnoreCase(o.getEstadoObservacion()))
                    .findFirst()
                    .orElse(null);
            if (obs != null) {
                String desc = obs.getDescripcion();
                dto.setAlerta(desc.length() > 100 ? desc.substring(0, 100) + "..." : desc);
            } else {
                dto.setAlerta("Sin observaciones pendientes");
            }
        } else {
            dto.setAlerta("Sin observaciones");
        }

        dto.setDetalle(entity.getDescripcion());
        dto.setRecomendacion("Revisar estado de validación y observaciones.");
        return dto;
    }
}
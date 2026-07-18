package pe.edu.unas.ctic.diagti.director.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.dto.SistemaResumenDTO;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;

@Component
@RequiredArgsConstructor
public class SistemaMapper {

    private final CatalogoRepository catalogoRepository;

    /**
     * Obtiene el nombre del área desde el catálogo usando el id_area_usuario
     */
    private String getAreaNombre(SistemaEntity entity) {
        if (entity == null || entity.getIdAreaUsuario() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(entity.getIdAreaUsuario())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    /**
     * Obtiene el nombre de la criticidad desde el catálogo usando el id_criticidad
     * NOTA: Esto devuelve "Académico", "Financiero", "RRHH", etc.
     */
    private String getCriticidadNombre(SistemaEntity entity) {
        if (entity == null || entity.getIdCriticidad() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(entity.getIdCriticidad())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    public SistemaResumenDTO toResumenDTO(SistemaEntity entity) {
        if (entity == null) return null;
        
        SistemaResumenDTO dto = new SistemaResumenDTO();
        dto.setCodigo(entity.getCodigoUnico());
        dto.setNombre(entity.getNombre());
        dto.setArea(getAreaNombre(entity));
        dto.setTipo("No especificado");
        dto.setExposicion("No registrada");
        dto.setValidacion(entity.getEstadoValidacion().toLowerCase());
        // Usar getCriticidadNombre() para obtener el nombre real de la criticidad
        dto.setCriticidad(getCriticidadNombre(entity).toLowerCase());

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
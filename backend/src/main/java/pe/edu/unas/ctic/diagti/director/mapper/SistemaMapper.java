package pe.edu.unas.ctic.diagti.director.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.director.dto.SistemaResumenDTO;
import pe.edu.unas.ctic.diagti.director.entity.InfraestructuraEntity;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;
import pe.edu.unas.ctic.diagti.director.support.DirectorEstados;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SistemaMapper {

    private final DirectorCatalogHelper catalogHelper;

    public SistemaResumenDTO toResumenDTO(SistemaEntity entity, List<InfraestructuraEntity> infraRows) {
        if (entity == null) {
            return null;
        }

        SistemaResumenDTO dto = new SistemaResumenDTO();
        dto.setSistemaId(entity.getIdSistema());
        dto.setCodigo(DirectorTexto.safe(entity.getCodigoUnico()));
        dto.setNombre(DirectorTexto.safe(entity.getNombre()));
        dto.setArea(catalogHelper.valorCatalogo(entity.getIdAreaUsuario()));
        dto.setTipo(catalogHelper.valorCatalogo(entity.getIdTipoAplicativo()));
        dto.setExposicion(extraerExposicion(infraRows));
        dto.setValidacion(DirectorEstados.normalizarEstadoSistema(entity.getEstadoValidacion()).toLowerCase());
        dto.setCriticidad(DirectorTexto.normalize(catalogHelper.valorCatalogo(entity.getIdCriticidad())));
        dto.setDetalle(DirectorTexto.safe(entity.getDescripcion()));
        dto.setCantidadObservaciones(entity.getObservaciones() == null ? 0 : entity.getObservaciones().size());
        dto.setResultadoInfraestructura(dto.getExposicion());

        if (entity.getObservaciones() != null && !entity.getObservaciones().isEmpty()) {
            ObservacionEntity obs = entity.getObservaciones().stream()
                    .filter(o -> DirectorEstados.esObservacionAbierta(o.getEstadoObservacion()))
                    .findFirst()
                    .orElse(null);
            if (obs != null) {
                String desc = DirectorTexto.safe(obs.getDescripcion());
                dto.setAlerta(desc.length() > 100 ? desc.substring(0, 100) + "..." : desc);
            } else {
                dto.setAlerta("Sin observaciones pendientes");
            }
        } else {
            dto.setAlerta("Sin observaciones");
        }

        String estado = DirectorEstados.normalizarEstadoSistema(entity.getEstadoValidacion());
        if (DirectorEstados.OBSERVADO.equals(estado)) {
            dto.setRecomendacion("Priorizar revisión de observaciones y subsanación.");
        } else if (DirectorEstados.VALIDADO.equals(estado)) {
            dto.setRecomendacion("Mantener seguimiento periódico y evidencias actualizadas.");
        } else {
            dto.setRecomendacion("Revisar estado de validación y completar información pendiente.");
        }
        return dto;
    }

    private String extraerExposicion(List<InfraestructuraEntity> infraRows) {
        if (infraRows == null || infraRows.isEmpty()) {
            return "Sin evaluación de infraestructura";
        }
        String raw = DirectorTexto.safe(infraRows.get(0).getCapacidadRecursos());
        if (raw.isEmpty()) {
            return "Sin evaluación de infraestructura";
        }
        if (raw.contains("\"estadoEvaluacion\"")) {
            int idx = raw.indexOf("\"estadoEvaluacion\"");
            int colon = raw.indexOf(':', idx);
            if (colon > 0) {
                String fragment = raw.substring(colon + 1).replace("\"", " ").trim();
                String[] parts = fragment.split("[,}]");
                if (parts.length > 0 && !parts[0].isBlank()) {
                    return parts[0].trim();
                }
            }
        }
        return raw.length() > 80 ? raw.substring(0, 80) + "..." : raw;
    }
}

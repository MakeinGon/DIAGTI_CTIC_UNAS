package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfraSistemaDetalleDTO {
    private Long sistemaId;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String area;
    private String criticidad;
    private String estadoSistema;
    private String estadoSistemaUi;
    private String nivelRiesgo;
    private String responsableTecnico;
    private String responsableFuncional;
    private String estadoValidacion;
    private String resultadoValidacion;
    private Long idValidacion;
    private String fechaCreacion;
    private String fechaActualizacion;

    private InfraEvaluacionDTO evaluacion;

    @Builder.Default
    private Map<String, Object> arquitectura = new HashMap<>();
    @Builder.Default
    private Map<String, Object> seguridad = new HashMap<>();
    @Builder.Default
    private List<Map<String, Object>> integraciones = new ArrayList<>();
    @Builder.Default
    private List<InfraEvidenciaDTO> evidencias = new ArrayList<>();
    @Builder.Default
    private List<ObservacionValidacionDTO> observaciones = new ArrayList<>();
}

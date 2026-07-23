package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.unas.ctic.diagti.infraestructura.support.InfraEvaluacionPayload;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfraEvaluacionDTO {
    private Long idInfraestructura;
    private Long sistemaId;
    private String estadoRegistro;
    private String resultado;
    private String fechaEvaluacion;
    private String fechaCreacion;
    private InfraEvaluacionPayload datos;
    @Builder.Default
    private List<InfraEvidenciaDTO> evidencias = new ArrayList<>();
}

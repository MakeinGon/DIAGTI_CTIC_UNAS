package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.Data;
import pe.edu.unas.ctic.diagti.infraestructura.support.InfraEvaluacionPayload;

import java.util.ArrayList;
import java.util.List;

@Data
public class InfraEvaluacionRequestDTO {
    private String username;
    /** BORRADOR | ENVIADO */
    private String estadoRegistro;
    private String resultado;
    private InfraEvaluacionPayload datos;
    private List<InfraEvidenciaDTO> evidencias = new ArrayList<>();
}

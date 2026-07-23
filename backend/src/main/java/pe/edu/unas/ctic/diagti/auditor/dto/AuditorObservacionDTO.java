package pe.edu.unas.ctic.diagti.auditor.dto;

import lombok.Data;

@Data
public class AuditorObservacionDTO {
    private Long observacionId;
    private Long sistemaId;
    private Long validacionId;
    private String origen;
    private String descripcion;
    private String estado;
    private String fechaCreacion;
    private String respuestaSubsanacion;
    private String fechaAtencion;
    private String resultadoRevision;
}

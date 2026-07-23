package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class ObservacionConsolidadaDTO {
    private Long observacionId;
    private Long sistemaId;
    private String codigoSistema;
    private String nombreSistema;
    private String descripcion;
    private String origen;
    private String estado;
    private String fecha;
    private String respuestaSubsanacion;
    private String resultadoRevision;
}

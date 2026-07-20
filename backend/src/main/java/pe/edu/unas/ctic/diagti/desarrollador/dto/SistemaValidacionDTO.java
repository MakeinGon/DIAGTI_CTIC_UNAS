package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;

@Data
public class SistemaValidacionDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String estado;
    private Integer completitud;
    private String area;
    private String riesgo;
    private Boolean puedeEnviar;
    private Integer evidenciasFaltantes;
    private String mensajeCompletitud;
}
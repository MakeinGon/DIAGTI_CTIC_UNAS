package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class SistemaResumenDTO {
    private Long sistemaId;
    private String codigo;
    private String nombre;
    private String area;
    private String tipo;
    private String exposicion;
    private String validacion;
    private String criticidad;
    private String alerta;
    private String detalle;
    private String recomendacion;
    private Integer cantidadObservaciones;
    private String resultadoInfraestructura;
}

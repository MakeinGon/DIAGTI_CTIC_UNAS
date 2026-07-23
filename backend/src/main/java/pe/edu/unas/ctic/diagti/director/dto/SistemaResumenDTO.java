package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class SistemaResumenDTO {
    private String codigo;
    private String nombre;
    private String area;          // nombre del área (de catálogo)
    private String tipo;          // tipo de aplicativo
    private String exposicion;    // se puede obtener de infraestructura
    private String validacion;    // "validado", "observado", "pendiente"
    private String criticidad;    // "critica", "alta", "media", "baja"
    private String alerta;        // resumen de la observación principal
    private String detalle;       // descripción del sistema
    private String recomendacion;
}
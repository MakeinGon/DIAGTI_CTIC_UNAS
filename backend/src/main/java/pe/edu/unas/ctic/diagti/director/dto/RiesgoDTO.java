package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class RiesgoDTO {
    private String codigo;
    private String titulo;
    private String area;
    private String categoria;
    private String nivel;         // "critico", "advertencia", "controlado"
    private String estado;        // "abierto", "mitigacion", "controlado"
    private String etapa;
    private String responsable;
    private String detectado;     // fecha en formato yyyy-MM-dd
    private String recomendacion;
    private Boolean vulnerabilidad;
    private Boolean cuelloBotella;
}
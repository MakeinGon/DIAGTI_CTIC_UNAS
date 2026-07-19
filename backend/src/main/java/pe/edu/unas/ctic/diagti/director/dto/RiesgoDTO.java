package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class RiesgoDTO {
    private String id;
    private String codigo;
    private String titulo;
    private String area;
    private String categoria;
    private String nivel;         // "critico", "advertencia", "controlado" (para el badge)
    private String nivelTexto;    // "Bajo", "Medio", "Alto", "Crítico" (para mostrar en la tabla) ← NUEVO
    private String estado;        // "abierto", "mitigacion", "controlado"
    private String etapa;
    private String responsable;
    private String detectado;
    private String recomendacion;
    private Boolean vulnerabilidad;
    private Boolean cuelloBotella;
    private Integer probability;
    private Integer impact;
    private String period;
}
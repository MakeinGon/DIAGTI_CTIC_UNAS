package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class CriticidadDTO {
    private String nivel;    // "critica", "alta", "media", "baja"
    private Integer cantidad;
    private String color;
}
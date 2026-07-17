package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class ResumenValidacionDTO {
    private String estado;   // "validado", "observado", "pendiente"
    private Integer cantidad;
    private String color;    // opcional para frontend
}
package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class ReporteValidacionDTO {
    private String codigo;
    private String nombre;
    private String estadoValidacion;
    private String fechaValidacion;
    private String area;
}
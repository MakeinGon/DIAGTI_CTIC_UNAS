package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class ReporteInventarioDTO {
    private String codigo;
    private String nombre;
    private String tipo;
    private String area;
    private String criticidad;
    private String estadoValidacion;
    private String estadoOperativo;
}
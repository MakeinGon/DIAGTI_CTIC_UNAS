package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class SistemaListDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String area;
    private String responsable;
    private String estado;
    private String criticidad;
    private String criticidadNombre;
    private String tipo;
    private String fechaActualizacion;
}
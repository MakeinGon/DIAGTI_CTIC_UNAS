package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class CatalogoDTO {
    private String codigo;
    private String nombre;
    private String descripcion;
    private String estado; // "Activo" o "Inactivo"
    private Integer orden;
}
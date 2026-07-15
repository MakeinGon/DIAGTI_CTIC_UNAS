package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class CatalogoDTO {
    private String codigo;
    private String nombre;      // se mapea a 'valor'
    private String descripcion;
    private String estado;      // "Activo" o "Inactivo"
    private Integer orden;
}
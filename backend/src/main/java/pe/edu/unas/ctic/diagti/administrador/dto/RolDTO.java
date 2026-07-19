package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class RolDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private String estado;
    private Integer cantidadUsuarios;
}
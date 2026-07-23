package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class CatalogoDTO {
    /** Tipo de catálogo (ej. AREA_USUARIO). Útil en listado global. */
    private String tipo;
    private String codigo;
    private String nombre;      // se mapea a 'valor'
    private String descripcion;
    private String estado;      // "Activo" o "Inactivo"
    private Integer orden;
}
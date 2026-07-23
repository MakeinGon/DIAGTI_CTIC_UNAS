package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class PermisoDTO {
    private String modulo;
    private Boolean ver;
    private Boolean crear;
    private Boolean editar;
    private Boolean eliminar;
    private Boolean validar;
    private Boolean exportar;
}
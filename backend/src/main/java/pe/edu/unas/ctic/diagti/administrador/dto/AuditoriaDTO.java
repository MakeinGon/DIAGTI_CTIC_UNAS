package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class AuditoriaDTO {
    private Long id;
    private String usuario;
    private String modulo;
    private String accion;
    private String descripcion;
    private String fecha;
}
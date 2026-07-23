package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class ActividadRecienteDTO {
    private Long id;
    private String modulo;
    private String accion;
    private String descripcion;
    private String fecha;
}

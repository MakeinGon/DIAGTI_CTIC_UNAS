package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class SistemaInventarioDTO {
    private Long sistemaId;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String area;
    private String criticidad;
    private String estado;
    private String responsableTecnico;
    private String responsableFuncional;
    private String estadoValidacion;
    private Integer cantidadObservaciones;
    private String resultadoInfraestructura;
    private String fechaCreacion;
    private String fechaActualizacion;
}

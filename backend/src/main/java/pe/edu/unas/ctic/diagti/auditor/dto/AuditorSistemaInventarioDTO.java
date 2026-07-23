package pe.edu.unas.ctic.diagti.auditor.dto;

import lombok.Data;

@Data
public class AuditorSistemaInventarioDTO {
    private Long sistemaId;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String area;
    private String tipo;
    private String criticidad;
    private String estado;
    private String responsableTecnico;
    private String responsableFuncional;
    private String estadoValidacion;
    private Integer cantidadObservaciones;
    private String nivelRiesgo;
    private Boolean sistemaPendiente;
    private Boolean contratoVigente;
    private String fechaCreacion;
    private String fechaActualizacion;
}

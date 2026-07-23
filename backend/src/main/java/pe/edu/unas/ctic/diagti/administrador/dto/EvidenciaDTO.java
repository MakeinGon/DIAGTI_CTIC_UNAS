package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class EvidenciaDTO {
    private Long id;
    private String sistema;
    private String modulo;
    private String responsable;
    private String tipo;
    private String estado;
    private String fecha;
    private String archivo;
    private String descripcion;
}
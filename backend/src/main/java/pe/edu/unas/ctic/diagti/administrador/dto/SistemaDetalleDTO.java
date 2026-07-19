package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;
import java.util.List;

@Data
public class SistemaDetalleDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String area;
    private String responsable;
    private String estado;
    private String criticidad;
    private String criticidadNombre;
    private String tipo;
    private List<String> tecnologias;
    private Boolean heredado;
    private String fechaActualizacion;
    private List<EvidenciaSimpleDTO> evidencias;  // ← Usa la clase importada
}
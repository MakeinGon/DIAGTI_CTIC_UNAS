package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
public class SistemaDetalleDirectorDTO {
    private Long sistemaId;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String area;
    private String tipo;
    private String criticidad;
    private String estado;
    private String estadoValidacion;
    private String responsableTecnico;
    private String responsableFuncional;
    private String nivelRiesgo;
    private Boolean esLegacy;
    private Boolean contratoVigente;
    private String fechaCreacion;
    private String fechaActualizacion;
    private String resultadoInfraestructura;
    private Integer cantidadObservaciones;

    private List<Map<String, Object>> arquitectura = new ArrayList<>();
    private List<Map<String, Object>> infraestructura = new ArrayList<>();
    private List<Map<String, Object>> seguridad = new ArrayList<>();
    private List<Map<String, Object>> integraciones = new ArrayList<>();
    private List<Map<String, Object>> evidencias = new ArrayList<>();
    private List<Map<String, Object>> validaciones = new ArrayList<>();
    private List<ObservacionConsolidadaDTO> observaciones = new ArrayList<>();
    private List<ActividadRecienteDTO> auditoria = new ArrayList<>();
}

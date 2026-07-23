package pe.edu.unas.ctic.diagti.auditor.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
public class AuditorSistemaDetalleDTO {
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
    private String desarrolladorNombre;
    private String formaAdquisicion;
    private Integer anoAdquisicion;
    private Boolean contratoVigente;
    private String fechaVencimientoSoporte;
    private String nivelRiesgo;
    private String prioridadMigracion;
    private Boolean sistemaPendiente;
    private String fechaCreacion;
    private String fechaActualizacion;
    private Integer cantidadObservaciones;
    private String resultadoInfraestructura;

    private List<Map<String, Object>> arquitectura = new ArrayList<>();
    private List<Map<String, Object>> infraestructura = new ArrayList<>();
    private List<Map<String, Object>> seguridad = new ArrayList<>();
    private List<Map<String, Object>> integraciones = new ArrayList<>();
    private List<Map<String, Object>> evidencias = new ArrayList<>();
    private List<Map<String, Object>> validaciones = new ArrayList<>();
    private List<AuditorObservacionDTO> observaciones = new ArrayList<>();
    private List<AuditorAuditoriaResponseDTO> auditoria = new ArrayList<>();
}

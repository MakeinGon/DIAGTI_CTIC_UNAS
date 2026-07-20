
package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SistemaCompletoDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String tipoAplicativo;
    private String areaUsuaria;
    private String responsableFuncional;
    private String responsableTecnico;
    private String estado;
    private String criticidad;
    private Integer anioDesarrollo;
    private String formaAdquisicion;
    private String empresaDesarrolladora;
    private Boolean contratoVigente;
    private LocalDateTime fechaVencimientoSoporte;
    private String observaciones;
    private String nivelRiesgo;
    private Integer puntajeRiesgo;
    private Boolean esLegacy;
    
    // Arquitectura
    private ArquitecturaDTO arquitectura;
    
    // Infraestructura
    private InfraestructuraDTO infraestructura;
    
    // Seguridad
    private SeguridadDTO seguridad;
    
    // Integraciones
    private List<IntegracionDTO> integraciones;
    
    // Evidencias
    private List<EvidenciaDTO> evidencias;
    
    // URLs (como tipo especial de evidencia)
    private List<UrlDTO> urls;
    
    // Auditoría
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String usuarioCreador;
    private String usuarioModificador;
    
    @Data
    public static class UrlDTO {
        private Long id;
        private String url;
        private String descripcion;
        private LocalDateTime fechaCreacion;
    }
}
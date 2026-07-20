package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDesarrolloDTO {
    private EstadisticasDTO estadisticas;
    private List<ActividadDTO> actividadReciente;
    private List<RiesgoCriticoDTO> riesgosCriticos;
    private List<SistemaResumenDTO> sistemasRecientes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstadisticasDTO {
        private Long totalSistemas;
        private Long sistemasBorrador;
        private Long sistemasEnviados;
        private Long sistemasObservados;
        private Long sistemasValidados;
        private Long sistemasLegacy;
        private Long sistemasCriticos;
        private Long evidenciasCargadas;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActividadDTO {
        private Long id;
        private String nombreSistema;
        private String accion;
        private String estado;
        private LocalDateTime fecha;
        private String usuario;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiesgoCriticoDTO {
        private Long id;
        private String codigo;
        private String nombre;
        private String nivelRiesgo;
        private Integer puntaje;
        private String criticidad;
        private String responsableTecnico;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SistemaResumenDTO {
        private Long id;
        private String codigo;
        private String nombre;
        private String estado;
        private String nivelRiesgo;
        private LocalDateTime fechaActualizacion;
    }
}
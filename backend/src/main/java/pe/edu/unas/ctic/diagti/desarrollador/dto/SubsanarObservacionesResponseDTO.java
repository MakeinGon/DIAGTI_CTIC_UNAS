package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SubsanarObservacionesResponseDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String estado;
    private LocalDateTime fechaSubsanacion;
    private boolean exito;
    private String mensaje;
    private List<ObservacionDTO> observaciones;
    private DatosSistemaDTO datosSistema;
    
    @Data
    public static class ObservacionDTO {
        private Long id;
        private String descripcion;
        private String tipo;
        private String estado;
        private String campoReferencia;
        private String sugerencia;
    }
    
    @Data
    public static class DatosSistemaDTO {
        private String motorBaseDatos;
        private String versionBaseDatos;
        private Boolean contratoAdjunto;
        private String repositorioGit;
        private List<String> seguridadChecks;
        private ArquitecturaDTO arquitectura;
        private InfraestructuraDTO infraestructura;
    }
}
package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubsanarObservacionesRequestDTO {
    private String comentarioGeneral;
    private List<ObservacionSubsanadaDTO> observacionesSubsanadas;
    
    // Datos actualizados
    private String motorBaseDatos;
    private String versionBaseDatos;
    private Boolean contratoAdjunto;
    private String repositorioGit;
    private List<String> seguridadChecks;
    private String observacionesAdicionales;
    
    @Data
    public static class ObservacionSubsanadaDTO {
        private Long id;
        private String respuesta;
        private Boolean subsanada;
    }
}
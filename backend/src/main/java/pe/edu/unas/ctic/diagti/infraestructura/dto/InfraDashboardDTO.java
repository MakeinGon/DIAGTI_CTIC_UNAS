package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfraDashboardDTO {
    
    private Estadisticas estadisticas;
    private List<Prioridad> prioridades;
    private List<Riesgo> riesgos;
    private List<Estado> estados;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Estadisticas {
        private int totalSistemas;
        private int pendientesRegistro;
        private int nuevos;
        private int borradores;
        private int observados;
        private int validados;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Prioridad {
        private String codigo;
        private String nombre;
        private String estado;
        private String detalle;
        private String accion;
        private String url;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Riesgo {
        private String nombre;
        private int cantidad;
        private String clase;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Estado {
        private String nombre;
        private int cantidad;
    }
}
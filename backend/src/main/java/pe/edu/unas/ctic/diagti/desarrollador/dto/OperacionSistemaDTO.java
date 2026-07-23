package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Respuestas de las operaciones que crean o modifican un sistema.
 *
 * <p>Se mantienen dos tipos porque cada operación devuelve una fecha distinta,
 * pero comparten un archivo para evitar DTO dispersos.</p>
 */
public final class OperacionSistemaDTO {
    private OperacionSistemaDTO() {
    }

    @Data
    public static class RegistroResponse {
        private Long id;
        private String codigo;
        private String nombre;
        private String estado;
        private String nivelRiesgo;
        private Integer puntajeRiesgo;
        private LocalDateTime fechaCreacion;
        private boolean exito;
        private String mensaje;
        private String errores;
    }

    @Data
    public static class EdicionResponse {
        private Long id;
        private String codigo;
        private String nombre;
        private String estado;
        private String nivelRiesgo;
        private Integer puntajeRiesgo;
        private LocalDateTime fechaActualizacion;
        private boolean exito;
        private String mensaje;
    }
}

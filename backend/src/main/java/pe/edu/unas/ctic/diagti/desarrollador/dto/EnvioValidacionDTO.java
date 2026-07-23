package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Contratos de entrada y salida para solicitar la validación técnica.
 *
 * <p>Las clases anidadas conservan exactamente las propiedades JSON usadas por
 * las pantallas; solo se reduce la cantidad de archivos Java.</p>
 */
public final class EnvioValidacionDTO {
    private EnvioValidacionDTO() {
    }

    @Data
    public static class Request {
        private Long sistemaId;
        private String comentario;
    }

    @Data
    public static class Response {
        private Long id;
        private String estado;
        private LocalDateTime fechaEnvio;
        private String mensaje;
        private boolean exito;
        private String observacionesPendientes;
    }
}

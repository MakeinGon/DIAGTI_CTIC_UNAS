package pe.edu.unas.ctic.diagti.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Manejador global de excepciones para toda la API.
 * Responde siempre { "message": "..." } porque el frontend
 * (roles-permisos, gestion-catalogos, etc.) lee err.message.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> manejarNoEncontrado(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(cuerpo(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo("Datos invalidos: " + errores));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> manejarIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo(ex.getMessage()));
    }

    // RolServiceImpl / PermisoServiceImpl lanzan RuntimeException para reglas
    // de negocio (nombre duplicado, rol no encontrado, etc). Se traducen a 400/409
    // con el mensaje real en vez de dejar pasar el error 500 generico de Spring.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarNegocio(RuntimeException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("no encontrad")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(cuerpo(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> manejarGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(cuerpo("Ocurrio un error inesperado: " + ex.getMessage()));
    }

    private Map<String, String> cuerpo(String mensaje) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", mensaje);
        return body;
    }
}

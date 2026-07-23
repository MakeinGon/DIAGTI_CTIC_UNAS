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

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, String>> manejarConflicto(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(cuerpo(ex.getMessage()));
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

    // Servicios de negocio que aún lanzan RuntimeException genérica.
    // Duplicados → 409; no encontrado → 404; resto → 400 (evita HTTP 500).
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarNegocio(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        HttpStatus status;
        if (msg.contains("no encontrad") || msg.contains("inexistent")) {
            status = HttpStatus.NOT_FOUND;
        } else if (msg.contains("ya registrad") || msg.contains("ya existe") || msg.contains("duplicad")) {
            status = HttpStatus.CONFLICT;
        } else {
            status = HttpStatus.BAD_REQUEST;
        }
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

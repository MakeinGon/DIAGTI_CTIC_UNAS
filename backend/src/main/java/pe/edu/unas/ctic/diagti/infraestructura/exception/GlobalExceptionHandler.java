package pe.edu.unas.ctic.diagti.infraestructura.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice(basePackages = "pe.edu.unas.ctic.diagti.infraestructura")
public class GlobalExceptionHandler {

    @ExceptionHandler(SistemaNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleSistemaNoEncontrado(SistemaNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(RegistroIncompletoException.class)
    public ResponseEntity<Map<String, Object>> handleRegistroIncompleto(RegistroIncompletoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage(), "pasosPendientes", ex.getPasosPendientes()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage() == null ? List.of() : ex.getMessage()));
    }
}

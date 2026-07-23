package pe.edu.unas.ctic.diagti.common.exception;

/**
 * Conflicto de negocio (duplicados, estados incompatibles).
 * Se traduce a HTTP 409 en {@link GlobalExceptionHandler}.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}

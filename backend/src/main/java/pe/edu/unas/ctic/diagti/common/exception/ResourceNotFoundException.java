package pe.edu.unas.ctic.diagti.common.exception;

/** Se lanza cuando se busca un recurso que no existe en la base de datos. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }
}

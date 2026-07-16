package pe.edu.unas.ctic.diagti.infraestructura.exception;

public class SistemaNoEncontradoException extends RuntimeException {
    public SistemaNoEncontradoException(String codigo) {
        super("No se encontró el sistema con código " + codigo);
    }
}

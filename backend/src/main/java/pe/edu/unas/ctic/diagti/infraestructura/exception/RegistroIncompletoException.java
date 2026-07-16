package pe.edu.unas.ctic.diagti.infraestructura.exception;

import java.util.List;

/**
 * Se lanza cuando se intenta enviar a validación un registro técnico que
 * no cumple los campos obligatorios de RF-09/RF-10/RF-11/RF-12/RF-14.
 * Es la contraparte en el servidor de la validación que ya hace
 * infraestructura.js en el cliente (pending()); sirve como respaldo por
 * RNF-05 (integridad de datos).
 */
public class RegistroIncompletoException extends RuntimeException {

    private final List<String> pasosPendientes;

    public RegistroIncompletoException(List<String> pasosPendientes) {
        super("Información incompleta en: " + String.join(", ", pasosPendientes));
        this.pasosPendientes = pasosPendientes;
    }

    public List<String> getPasosPendientes() {
        return pasosPendientes;
    }
}

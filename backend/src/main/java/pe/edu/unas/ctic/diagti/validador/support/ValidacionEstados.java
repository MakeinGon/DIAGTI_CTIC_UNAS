package pe.edu.unas.ctic.diagti.validador.support;

/**
 * Estados oficiales compartidos (BD en MAYÚSCULAS).
 * Origen: DataBase/init.sql + entidades existentes.
 */
public final class ValidacionEstados {

    private ValidacionEstados() {
    }

    // sistemas.estado_flujo
    public static final String SISTEMA_BORRADOR = "BORRADOR";
    public static final String SISTEMA_ENVIADO = "ENVIADO";
    public static final String SISTEMA_OBSERVADO = "OBSERVADO";
    public static final String SISTEMA_SUBSANADO = "SUBSANADO";
    public static final String SISTEMA_VALIDADO = "VALIDADO";
    public static final String SISTEMA_RECHAZADO = "RECHAZADO";

    // validaciones.estado_validacion
    public static final String VAL_PENDIENTE = "PENDIENTE";
    public static final String VAL_OBSERVADO = "OBSERVADO";
    public static final String VAL_SUBSANADO = "SUBSANADO";
    public static final String VAL_VALIDADO = "VALIDADO";
    public static final String VAL_RECHAZADO = "RECHAZADO";

    // observaciones.estado_observacion
    public static final String OBS_PENDIENTE = "PENDIENTE";
    public static final String OBS_EN_REVISION = "EN_REVISION";
    public static final String OBS_ATENDIDA = "ATENDIDA";
    public static final String OBS_RECHAZADA = "RECHAZADA";

    // Prefijos de área en descripcion (no existe columna area)
    public static final String AREA_VALIDACION = "VALIDACION";
    public static final String AREA_INFRAESTRUCTURA = "INFRAESTRUCTURA";
    public static final String AREA_FUNCIONAL = "FUNCIONAL";
    public static final String AREA_DESARROLLO = "DESARROLLO";

    public static String normalizar(String valor) {
        if (valor == null || valor.isBlank()) {
            return "";
        }
        return valor.trim().toUpperCase().replace(' ', '_');
    }

    public static String prefijoArea(String area) {
        String n = normalizar(area);
        if (n.isBlank()) {
            return AREA_VALIDACION;
        }
        if (n.contains("INFRA")) {
            return AREA_INFRAESTRUCTURA;
        }
        if (n.contains("FUNC")) {
            return AREA_FUNCIONAL;
        }
        if (n.contains("DESARR")) {
            return AREA_DESARROLLO;
        }
        return AREA_VALIDACION;
    }

    public static String conPrefijoArea(String area, String titulo, String detalle) {
        String pref = prefijoArea(area);
        String t = titulo == null ? "" : titulo.trim();
        String d = detalle == null ? "" : detalle.trim();
        if (!t.isBlank() && !d.isBlank()) {
            return "[" + pref + "] " + t + " — " + d;
        }
        if (!t.isBlank()) {
            return "[" + pref + "] " + t;
        }
        return "[" + pref + "] " + d;
    }

    public static String extraerArea(String descripcion) {
        if (descripcion == null || !descripcion.startsWith("[")) {
            return AREA_VALIDACION;
        }
        int end = descripcion.indexOf(']');
        if (end <= 1) {
            return AREA_VALIDACION;
        }
        return descripcion.substring(1, end).trim().toUpperCase();
    }
}

package pe.edu.unas.ctic.diagti.director.support;

import java.util.Locale;
import java.util.Set;

/**
 * Normalización de estados del flujo oficial sin alterar datos persistidos.
 */
public final class DirectorEstados {

    public static final String BORRADOR = "BORRADOR";
    public static final String PENDIENTE = "PENDIENTE";
    public static final String ENVIADO = "ENVIADO";
    public static final String EN_VALIDACION = "EN_VALIDACION";
    public static final String OBSERVADO = "OBSERVADO";
    public static final String SUBSANADO = "SUBSANADO";
    public static final String VALIDADO = "VALIDADO";
    public static final String RECHAZADO = "RECHAZADO";

    public static final String OBS_PENDIENTE = "PENDIENTE";
    public static final String OBS_EN_REVISION = "EN_REVISION";
    public static final String OBS_APROBADA = "APROBADA";
    public static final String OBS_RECHAZADA = "RECHAZADA";
    public static final String OBS_ATENDIDA = "ATENDIDA";

    public static final String ORIGEN_VALIDACION = "VALIDACION";
    public static final String ORIGEN_INFRAESTRUCTURA = "INFRAESTRUCTURA";
    public static final String ORIGEN_FUNCIONAL = "FUNCIONAL";
    public static final String ORIGEN_OTRO = "OTRO";

    private static final Set<String> ESTADOS_SISTEMA = Set.of(
            BORRADOR, PENDIENTE, ENVIADO, EN_VALIDACION, OBSERVADO, SUBSANADO, VALIDADO, RECHAZADO, "CERRADO");

    private DirectorEstados() {
    }

    public static String normalizarEstadoSistema(String raw) {
        String u = DirectorTexto.upper(raw);
        if (u.isEmpty()) {
            return PENDIENTE;
        }
        if ("EN VALIDACION".equals(u) || "EN-VALIDACION".equals(u)) {
            return EN_VALIDACION;
        }
        if (ESTADOS_SISTEMA.contains(u)) {
            return u;
        }
        return u;
    }

    public static String normalizarEstadoObservacion(String raw) {
        String u = DirectorTexto.upper(raw);
        if (u.isEmpty()) {
            return OBS_PENDIENTE;
        }
        if ("ATENDIDO".equals(u)) {
            return OBS_ATENDIDA;
        }
        if ("APROBADO".equals(u)) {
            return OBS_APROBADA;
        }
        if ("RECHAZADO".equals(u)) {
            return OBS_RECHAZADA;
        }
        if ("EN REVISION".equals(u) || "EN-REVISION".equals(u)) {
            return OBS_EN_REVISION;
        }
        return u;
    }

    public static boolean esPendienteFlujo(String estado) {
        String e = normalizarEstadoSistema(estado);
        return BORRADOR.equals(e) || PENDIENTE.equals(e) || ENVIADO.equals(e) || EN_VALIDACION.equals(e);
    }

    public static boolean esObservacionAbierta(String estado) {
        String e = normalizarEstadoObservacion(estado);
        return OBS_PENDIENTE.equals(e) || OBS_EN_REVISION.equals(e) || OBS_RECHAZADA.equals(e);
    }

    public static String origenDesdeDescripcion(String descripcion) {
        String d = DirectorTexto.safe(descripcion).toUpperCase(Locale.ROOT);
        if (d.startsWith("[VALIDACION]")) {
            return ORIGEN_VALIDACION;
        }
        if (d.startsWith("[INFRAESTRUCTURA]")) {
            return ORIGEN_INFRAESTRUCTURA;
        }
        if (d.startsWith("[FUNCIONAL]")) {
            return ORIGEN_FUNCIONAL;
        }
        return ORIGEN_OTRO;
    }
}

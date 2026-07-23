package pe.edu.unas.ctic.diagti.desarrollador.support;

import java.util.Locale;
import java.util.Map;

/**
 * Normaliza estados entre BD oficial (MAYÚSCULAS) y frontend Luis Lara (Title Case).
 */
public final class EstadoFlujoNormalizer {

    private static final Map<String, String> UI = Map.ofEntries(
            Map.entry("BORRADOR", "Borrador"),
            Map.entry("ENVIADO", "Enviado"),
            Map.entry("OBSERVADO", "Observado"),
            Map.entry("SUBSANADO", "Subsanado"),
            Map.entry("VALIDADO", "Validado"),
            Map.entry("RECHAZADO", "Rechazado"),
            Map.entry("CERRADO", "Cerrado"),
            Map.entry("PENDIENTE", "Pendiente")
    );

    private EstadoFlujoNormalizer() {
    }

    public static String toUi(String estadoBd) {
        if (estadoBd == null || estadoBd.isBlank()) {
            return "Borrador";
        }
        String key = estadoBd.trim().toUpperCase(Locale.ROOT);
        return UI.getOrDefault(key, capitalize(estadoBd.trim()));
    }

    public static String toBd(String estadoUiOrBd) {
        if (estadoUiOrBd == null || estadoUiOrBd.isBlank()) {
            return "BORRADOR";
        }
        return estadoUiOrBd.trim().toUpperCase(Locale.ROOT);
    }

    public static boolean matches(String estadoBd, String filtroUiOrBd) {
        if (filtroUiOrBd == null || filtroUiOrBd.isBlank()) {
            return true;
        }
        return toBd(estadoBd).equals(toBd(filtroUiOrBd));
    }

    private static String capitalize(String value) {
        if (value.isEmpty()) {
            return value;
        }
        String lower = value.toLowerCase(Locale.ROOT);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}

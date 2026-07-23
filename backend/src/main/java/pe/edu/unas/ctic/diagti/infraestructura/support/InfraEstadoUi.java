package pe.edu.unas.ctic.diagti.infraestructura.support;

import pe.edu.unas.ctic.diagti.desarrollador.support.EstadoFlujoNormalizer;
import pe.edu.unas.ctic.diagti.validador.support.ValidacionEstados;

/**
 * Traduce estados oficiales a etiquetas del UI de Infraestructura.
 */
public final class InfraEstadoUi {

    private InfraEstadoUi() {
    }

    public static String fromSistemaYEval(String estadoFlujo, boolean tieneInfra, String estadoRegistroEval) {
        String bd = ValidacionEstados.normalizar(estadoFlujo);
        String eval = ValidacionEstados.normalizar(estadoRegistroEval);

        if (!tieneInfra && (bd.isBlank() || "BORRADOR".equals(bd))) {
            return "Nuevo";
        }
        if ("BORRADOR".equals(eval) || (!tieneInfra && "BORRADOR".equals(bd))) {
            return "Borrador";
        }
        if ("SUBSANADO".equals(bd)) {
            return "Corregido";
        }
        return EstadoFlujoNormalizer.toUi(bd);
    }

    public static String riesgoUi(String nivelRiesgo) {
        if (nivelRiesgo == null || nivelRiesgo.isBlank()) {
            return "Medio";
        }
        String n = nivelRiesgo.trim().toLowerCase();
        return switch (n) {
            case "bajo", "baja" -> "Bajo";
            case "alto", "alta" -> "Alto";
            case "critico", "crítico", "critica", "crítica" -> "Crítico";
            default -> "Medio";
        };
    }
}

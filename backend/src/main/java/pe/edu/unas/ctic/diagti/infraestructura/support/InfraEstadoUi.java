package pe.edu.unas.ctic.diagti.infraestructura.support;

import pe.edu.unas.ctic.diagti.desarrollador.support.EstadoFlujoNormalizer;
import pe.edu.unas.ctic.diagti.validador.support.ValidacionEstados;

/**
 * Traduce estados oficiales a etiquetas del UI de Infraestructura.
 */
public final class InfraEstadoUi {

    private InfraEstadoUi() {
    }

    public static final String PENDIENTE_EVALUACION = "Pendiente de evaluación";

    public static String fromSistemaYEval(String estadoFlujo, boolean tieneInfra, String estadoRegistroEval) {
        String bd = ValidacionEstados.normalizar(estadoFlujo);
        String eval = ValidacionEstados.normalizar(estadoRegistroEval);

        // Sin fila en infraestructura: visible como pendiente (LEFT JOIN semántico).
        if (!tieneInfra) {
            return PENDIENTE_EVALUACION;
        }
        if ("BORRADOR".equals(eval) || "SIN_REGISTRO".equals(eval)) {
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

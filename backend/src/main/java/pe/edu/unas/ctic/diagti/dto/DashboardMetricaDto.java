package pe.edu.unas.ctic.diagti.dto;

public record DashboardMetricaDto(
        String id,
        String titulo,
        long valor,
        String descripcion,
        String nivelRiesgo,
        Double variacionPorcentual) {}

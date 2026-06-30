package pe.edu.unas.ctic.diagti.dto;

import java.util.List;

public record DashboardOverviewDto(
        List<DashboardMetricaDto> metricas,
        List<RiesgoDistribucionDto> riesgoDistribucion,
        List<CriticidadDistribucionDto> criticidadDistribucion,
        List<AuditoriaActividadDiariaDto> actividadAuditoria,
        int indiceRiesgoGlobal) {}

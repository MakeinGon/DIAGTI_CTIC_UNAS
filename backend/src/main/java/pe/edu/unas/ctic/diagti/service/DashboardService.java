package pe.edu.unas.ctic.diagti.service;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.dto.AuditoriaActividadDiariaDto;
import pe.edu.unas.ctic.diagti.dto.CriticidadDistribucionDto;
import pe.edu.unas.ctic.diagti.dto.DashboardMetricaDto;
import pe.edu.unas.ctic.diagti.dto.DashboardOverviewDto;
import pe.edu.unas.ctic.diagti.dto.RiesgoDistribucionDto;
import pe.edu.unas.ctic.diagti.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.repository.SistemaRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final SistemaRepository sistemaRepository;
    private final AuditoriaRepository auditoriaRepository;

    public DashboardOverviewDto obtenerOverview() {
        long totalSistemas = sistemaRepository.countActivos();
        long altoRiesgo = sistemaRepository.countByNivelRiesgo("ALTO");
        long medioRiesgo = sistemaRepository.countByNivelRiesgo("MEDIO");
        long bajoRiesgo = sistemaRepository.countByNivelRiesgo("BAJO");
        long legacy = sistemaRepository.countLegacy();
        long eventosHoy = auditoriaRepository.countEventosHoy();

        int indiceRiesgoGlobal = totalSistemas == 0
                ? 0
                : Math.round((altoRiesgo * 100f) / totalSistemas);

        List<RiesgoDistribucionDto> riesgoDistribucion = List.of(
                new RiesgoDistribucionDto("ALTO", altoRiesgo),
                new RiesgoDistribucionDto("MEDIO", medioRiesgo),
                new RiesgoDistribucionDto("BAJO", bajoRiesgo));

        List<CriticidadDistribucionDto> criticidadDistribucion = sistemaRepository.countByCriticidad().stream()
                .map(row -> new CriticidadDistribucionDto((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        List<AuditoriaActividadDiariaDto> actividadAuditoria = auditoriaRepository.findActividadUltimos7Dias().stream()
                .map(row -> new AuditoriaActividadDiariaDto((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        List<DashboardMetricaDto> metricas = new ArrayList<>();
        metricas.add(new DashboardMetricaDto(
                "total-sistemas",
                "Sistemas registrados",
                totalSistemas,
                "Inventario activo en DIAGTI",
                null,
                4.2));
        metricas.add(new DashboardMetricaDto(
                "alto-riesgo",
                "Sistemas en riesgo alto",
                altoRiesgo,
                "Calculado automáticamente según nivel_riesgo",
                "ALTO",
                -1.5));
        metricas.add(new DashboardMetricaDto(
                "legacy",
                "Sistemas legacy",
                legacy,
                "Requieren plan de migración prioritario",
                "MEDIO",
                null));
        metricas.add(new DashboardMetricaDto(
                "eventos-hoy",
                "Eventos de auditoría hoy",
                eventosHoy,
                "Acciones registradas en la bitácora",
                null,
                8.0));

        return new DashboardOverviewDto(
                metricas,
                riesgoDistribucion,
                criticidadDistribucion,
                actividadAuditoria,
                indiceRiesgoGlobal);
    }
}

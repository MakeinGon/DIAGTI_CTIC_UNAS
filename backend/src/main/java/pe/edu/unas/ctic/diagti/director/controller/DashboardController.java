package pe.edu.unas.ctic.diagti.director.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.director.dto.*;
import pe.edu.unas.ctic.diagti.director.service.DashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/director/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    public DashboardKpiDTO getKpis() {
        return dashboardService.obtenerKpis();
    }

    @GetMapping("/resumen-validacion")
    public List<ResumenValidacionDTO> getResumenValidacion() {
        return dashboardService.obtenerResumenValidacion();
    }

    @GetMapping("/criticidades")
    public List<CriticidadDTO> getCriticidades() {
        return dashboardService.obtenerCriticidades();
    }

    @GetMapping("/sistemas")
    public List<SistemaResumenDTO> getSistemas(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String criticidad,
            @RequestParam(required = false) String validacion,
            @RequestParam(required = false) String busqueda) {
        return dashboardService.obtenerSistemasFiltrados(area, criticidad, validacion, busqueda);
    }

    @GetMapping("/actividad-reciente")
    public List<ActividadRecienteDTO> getActividadReciente() {
        return dashboardService.obtenerActividadReciente();
    }

    @GetMapping("/observaciones")
    public List<ObservacionConsolidadaDTO> getObservaciones(
            @RequestParam(required = false) String origen,
            @RequestParam(required = false) String estado) {
        return dashboardService.obtenerObservacionesConsolidadas(origen, estado);
    }
}

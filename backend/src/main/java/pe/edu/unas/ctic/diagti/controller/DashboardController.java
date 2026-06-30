package pe.edu.unas.ctic.diagti.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unas.ctic.diagti.dto.DashboardOverviewDto;
import pe.edu.unas.ctic.diagti.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public DashboardOverviewDto obtenerOverview() {
        return dashboardService.obtenerOverview();
    }
}

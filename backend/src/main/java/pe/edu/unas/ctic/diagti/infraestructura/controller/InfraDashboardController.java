package pe.edu.unas.ctic.diagti.infraestructura.controller;

import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraDashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/infraestructura/dashboard")
@RequiredArgsConstructor
@Slf4j
public class InfraDashboardController {

    private final InfraDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<InfraDashboardDTO> getDashboard() {
        log.info("📊 GET /api/infraestructura/dashboard");
        InfraDashboardDTO data = dashboardService.getDashboardData();
        return ResponseEntity.ok(data);
    }
}
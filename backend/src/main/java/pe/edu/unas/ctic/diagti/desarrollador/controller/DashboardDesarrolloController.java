package pe.edu.unas.ctic.diagti.desarrollador.controller;

import pe.edu.unas.ctic.diagti.desarrollador.dto.DashboardDesarrolloDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DashboardDesarrolloService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/desarrollador/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardDesarrolloController {

    private final DashboardDesarrolloService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDesarrolloDTO> obtenerDashboard(
            @RequestParam(required = false) String usuario) {
        log.info("📊 GET /api/desarrollador/dashboard - usuario: {}", usuario);
        
        // Si no se proporciona usuario, usar uno por defecto
        if (usuario == null || usuario.isEmpty()) {
            usuario = "Carlos Rojas";
        }
        
        DashboardDesarrolloDTO dashboard = dashboardService.obtenerDashboard(usuario);
        return ResponseEntity.ok(dashboard);
    }
}
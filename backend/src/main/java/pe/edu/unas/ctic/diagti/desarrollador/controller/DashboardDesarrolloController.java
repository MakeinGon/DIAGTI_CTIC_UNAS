package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.DashboardDesarrolloDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DashboardDesarrolloService;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/desarrollador/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardDesarrolloController {

    private final DashboardDesarrolloService dashboardService;
    private final DesarrolladorInventarioService inventarioService;

    @GetMapping
    public ResponseEntity<DashboardDesarrolloDTO> obtenerDashboard(@RequestParam String username) {
        log.info("GET /api/desarrollador/dashboard username={}", username);
        return ResponseEntity.ok(dashboardService.obtenerDashboard(username));
    }

    /**
     * Listado en formato frontend para que el dashboard Luis Lara consuma un único contrato.
     */
    @GetMapping("/sistemas")
    public ResponseEntity<List<SistemaFrontendDTO>> listarSistemasDashboard(@RequestParam String username) {
        return ResponseEntity.ok(inventarioService.listarSistemasDelDesarrollador(username, Map.of()));
    }
}

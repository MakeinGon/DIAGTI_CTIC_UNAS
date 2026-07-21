package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.DashboardDesarrolloDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DashboardDesarrolloService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/desarrollador/dashboard")
@RequiredArgsConstructor

public class DashboardDesarrolloController {
    
    private final DashboardDesarrolloService dashboardService;
    
    @GetMapping
    public ResponseEntity<DashboardDesarrolloDTO> obtenerDashboard(
            @RequestParam(required = false) String usuario) {
        return ResponseEntity.ok(dashboardService.obtenerDashboard(usuario));
    }
    
    @GetMapping("/estadisticas")
    public ResponseEntity<DashboardDesarrolloDTO.EstadisticasDTO> obtenerEstadisticas(
            @RequestParam(required = false) String usuario) {
        return ResponseEntity.ok(dashboardService.obtenerEstadisticas(usuario));
    }
    
    @GetMapping("/actividad-reciente")
    public ResponseEntity<List<DashboardDesarrolloDTO.ActividadDTO>> obtenerActividadReciente(
            @RequestParam(required = false) String usuario,
            @RequestParam(defaultValue = "10") int limite) {
        return ResponseEntity.ok(dashboardService.obtenerActividadReciente(usuario, limite));
    }
    
    @GetMapping("/riesgos-criticos")
    public ResponseEntity<List<DashboardDesarrolloDTO.RiesgoCriticoDTO>> obtenerRiesgosCriticos(
            @RequestParam(required = false) String usuario) {
        return ResponseEntity.ok(dashboardService.obtenerRiesgosCriticos(usuario));
    }
}
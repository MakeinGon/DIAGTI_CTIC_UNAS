package pe.edu.unas.ctic.diagti.auditor.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorReporteResumenDTO;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorReportesService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditor")
@RequiredArgsConstructor
public class AuditorReportesController {

    private final AuditorReportesService reportesService;

    @GetMapping("/reportes/resumen")
    public ResponseEntity<AuditorReporteResumenDTO> resumen() {
        return ResponseEntity.ok(reportesService.obtenerResumen());
    }

    @GetMapping("/reportes/datos")
    public ResponseEntity<List<Map<String, Object>>> datos(@RequestParam(required = false) String tipo) {
        return ResponseEntity.ok(reportesService.obtenerDatos(tipo));
    }

    /**
     * Compatibilidad con el frontend histórico de reportes.
     */
    @PostMapping("/reporte")
    public ResponseEntity<List<Map<String, Object>>> reportePost(
            @RequestBody(required = false) Map<String, String> params) {
        String tipo = params == null ? null : params.get("tipo");
        return ResponseEntity.ok(reportesService.obtenerDatos(tipo));
    }

    @GetMapping("/kpis-reportes")
    public ResponseEntity<Map<String, Integer>> kpisReportes() {
        AuditorReporteResumenDTO resumen = reportesService.obtenerResumen();
        return ResponseEntity.ok(Map.of(
                "tablas", resumen.getTablas(),
                "sistemas", resumen.getTotalSistemas(),
                "auditoria", resumen.getTotalAuditoria(),
                "exportaciones", 0
        ));
    }
}

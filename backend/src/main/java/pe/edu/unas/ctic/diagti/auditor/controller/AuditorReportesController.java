package pe.edu.unas.ctic.diagti.auditor.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

// ✅ IMPORT CORRECTO
import pe.edu.unas.ctic.diagti.sistemas.model.Sistema;
import pe.edu.unas.ctic.diagti.sistemas.repository.ssSistemaRepository;
import pe.edu.unas.ctic.diagti.auditor.model.Auditoria;
import pe.edu.unas.ctic.diagti.auditor.repository.AuditorAuditoriaRepository;

import java.util.*;

@RestController
@RequestMapping("/auditor")
@CrossOrigin(origins = "*")
public class AuditorReportesController {

    @Autowired
    private ssSistemaRepository sistemaRepository;  // ✅ Nombre correcto

    @Autowired
    private AuditorAuditoriaRepository auditoriaRepository;

    @PostMapping("/reporte")
    public ResponseEntity<List<Map<String, Object>>> getReporte(@RequestBody(required = false) Map<String, String> params) {
        try {
            String tipo = params != null ? params.get("tipo") : null;
            System.out.println("📊 Generando reporte tipo: " + tipo);

            List<Map<String, Object>> datos = new ArrayList<>();

            if ("sistemas".equals(tipo)) {
                List<Sistema> sistemas = sistemaRepository.findAll();
                for (Sistema s : sistemas) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", s.getIdSistema());
                    item.put("codigo", s.getCodigoUnico());
                    item.put("nombre", s.getNombre());
                    item.put("descripcion", s.getDescripcion());
                    item.put("estado", s.getEstadoFlujo());
                    item.put("riesgo", s.getNivelRiesgo());
                    item.put("legacy", s.getEsLegacy());
                    item.put("actualizacion", s.getFechaActualizacion());
                    datos.add(item);
                }
            } else if ("auditoria".equals(tipo)) {
                List<Auditoria> auditorias = auditoriaRepository.findAll();
                for (Auditoria a : auditorias) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", a.getIdAuditoria());
                    item.put("modulo", a.getModulo());
                    item.put("accion", a.getAccion());
                    item.put("descripcion", a.getDescripcion());
                    item.put("fecha", a.getFechaEvento());
                    item.put("ip", a.getDireccionIp());
                    datos.add(item);
                }
            }

            return ResponseEntity.ok(datos);
        } catch (Exception e) {
            System.err.println("❌ ERROR en getReporte: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/kpis-reportes")
    public ResponseEntity<Map<String, Integer>> getKPIsReportes() {
        try {
            Map<String, Integer> kpis = new HashMap<>();
            kpis.put("tablas", 5);
            kpis.put("sistemas", (int) sistemaRepository.count());
            kpis.put("auditoria", (int) auditoriaRepository.count());
            kpis.put("exportaciones", 0);
            return ResponseEntity.ok(kpis);
        } catch (Exception e) {
            System.err.println("❌ ERROR en getKPIsReportes: " + e.getMessage());
            Map<String, Integer> kpis = new HashMap<>();
            kpis.put("tablas", 0);
            kpis.put("sistemas", 0);
            kpis.put("auditoria", 0);
            kpis.put("exportaciones", 0);
            return ResponseEntity.ok(kpis);
        }
    }
}
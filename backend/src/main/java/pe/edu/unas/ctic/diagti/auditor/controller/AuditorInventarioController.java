package pe.edu.unas.ctic.diagti.auditor.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import pe.edu.unas.ctic.diagti.sistemas.model.Sistema;
import pe.edu.unas.ctic.diagti.sistemas.repository.ssSistemaRepository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/auditor")
@CrossOrigin(origins = "*")
public class AuditorInventarioController {

    @Autowired
    private ssSistemaRepository sistemaRepository;

    @PostMapping("/inventario")
    public ResponseEntity<List<Sistema>> getInventario(@RequestBody(required = false) Map<String, Object> filtros) {
        try {
            System.out.println("🔍 === INICIO CONSULTA INVENTARIO ===");
            System.out.println("📋 Filtros recibidos: " + filtros);
            
            // ✅ PRUEBA 1: Contar registros en la tabla
            long total = sistemaRepository.count();
            System.out.println("📊 TOTAL DE REGISTROS EN LA TABLA: " + total);
            
            // ✅ PRUEBA 2: Traer todos sin filtros
            List<Sistema> sistemas = sistemaRepository.findAllOrderByIdDesc();
            System.out.println("✅ SISTEMAS ENCONTRADOS: " + sistemas.size());
            
            for (Sistema s : sistemas) {
                System.out.println("   - ID: " + s.getIdSistema() + " | Nombre: " + s.getNombre());
            }
            
            System.out.println("🔍 === FIN CONSULTA INVENTARIO ===");
            return ResponseEntity.ok(sistemas);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR en getInventario: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/inventario/kpis")
    public ResponseEntity<Map<String, Long>> getKPIsInventario() {
        try {
            Map<String, Long> kpis = new HashMap<>();
            kpis.put("total", sistemaRepository.count());
            kpis.put("legacy", sistemaRepository.countByEsLegacyTrue());
            kpis.put("riesgo", sistemaRepository.countByNivelRiesgoIn(List.of("ALTO", "CRITICO")));
            kpis.put("contrato", sistemaRepository.countByContratoVigenteTrue());
            
            System.out.println("📊 KPIs calculados: " + kpis);
            return ResponseEntity.ok(kpis);
        } catch (Exception e) {
            System.err.println("❌ ERROR en getKPIsInventario: " + e.getMessage());
            Map<String, Long> kpis = new HashMap<>();
            kpis.put("total", 0L);
            kpis.put("legacy", 0L);
            kpis.put("riesgo", 0L);
            kpis.put("contrato", 0L);
            return ResponseEntity.ok(kpis);
        }
    }
}
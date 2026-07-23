package pe.edu.unas.ctic.diagti.auditor.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorObservacionDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaInventarioDTO;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorInventarioService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditor")
@RequiredArgsConstructor
public class AuditorInventarioController {

    private final AuditorInventarioService inventarioService;

    @GetMapping("/inventario")
    public ResponseEntity<List<AuditorSistemaInventarioDTO>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String codigo,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String criticidad,
            @RequestParam(required = false) String busqueda) {
        String nombreFiltro = firstNonBlank(nombre, busqueda);
        return ResponseEntity.ok(inventarioService.listar(nombreFiltro, codigo, area, estado, criticidad));
    }

    /**
     * Compatibilidad con el frontend histórico (POST + body de filtros).
     */
    @PostMapping("/inventario")
    public ResponseEntity<List<AuditorSistemaInventarioDTO>> listarPost(
            @RequestBody(required = false) Map<String, Object> filtros) {
        Map<String, Object> f = filtros == null ? Map.of() : filtros;
        String search = asString(f.get("searchText"));
        String estado = asString(f.get("estado"));
        String criticidad = asString(f.getOrDefault("criticidad", f.get("riesgo")));
        String area = asString(f.get("area"));
        String codigo = asString(f.get("codigo"));
        return ResponseEntity.ok(inventarioService.listar(search, codigo, area, estado, criticidad));
    }

    @GetMapping("/inventario/kpis")
    public ResponseEntity<Map<String, Long>> kpis() {
        return ResponseEntity.ok(inventarioService.obtenerKpis());
    }

    @GetMapping("/inventario/{sistemaId}")
    public ResponseEntity<AuditorSistemaDetalleDTO> detalle(@PathVariable Long sistemaId) {
        return ResponseEntity.ok(inventarioService.obtenerDetalle(sistemaId));
    }

    @GetMapping("/observaciones")
    public ResponseEntity<List<AuditorObservacionDTO>> observaciones(
            @RequestParam(required = false) Long sistemaId,
            @RequestParam(required = false) String origen) {
        return ResponseEntity.ok(inventarioService.listarObservaciones(sistemaId, origen));
    }

    private static String asString(Object value) {
        if (value == null) {
            return null;
        }
        String s = String.valueOf(value).trim();
        return s.isEmpty() || "null".equalsIgnoreCase(s) ? null : s;
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }
}

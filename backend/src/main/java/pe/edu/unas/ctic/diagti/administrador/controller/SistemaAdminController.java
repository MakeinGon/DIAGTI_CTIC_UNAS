package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaAdminUpdateDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaListDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaResponsablesRequestDTO;
import pe.edu.unas.ctic.diagti.administrador.service.SistemaAdminService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/sistemas")
@RequiredArgsConstructor
public class SistemaAdminController {

    private final SistemaAdminService sistemaAdminService;

    @GetMapping
    public ResponseEntity<List<SistemaListDTO>> listarSistemas(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String responsable,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String criticidad,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        return ResponseEntity.ok(sistemaAdminService.listarSistemas(
                busqueda, area, responsable, estado, criticidad, tipo, fechaDesde, fechaHasta));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", sistemaAdminService.contarSistemas());
        stats.put("activos", sistemaAdminService.contarActivos());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SistemaDetalleDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(sistemaAdminService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SistemaDetalleDTO> actualizarAdministrativo(
            @PathVariable Long id,
            @RequestBody SistemaAdminUpdateDTO dto) {
        return ResponseEntity.ok(sistemaAdminService.actualizarAdministrativo(id, dto));
    }

    @PutMapping("/{id}/responsables")
    public ResponseEntity<SistemaDetalleDTO> asignarResponsables(
            @PathVariable Long id,
            @RequestBody SistemaResponsablesRequestDTO dto) {
        return ResponseEntity.ok(sistemaAdminService.asignarResponsables(id, dto));
    }
}

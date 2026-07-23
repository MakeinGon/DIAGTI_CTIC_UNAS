package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaStatsDTO;
import pe.edu.unas.ctic.diagti.administrador.service.AuditoriaService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/auditoria")
@RequiredArgsConstructor
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<AuditoriaDTO>> listarAuditoria(
            @RequestParam(required = false) String usuario,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        return ResponseEntity.ok(auditoriaService.listarAuditoria(usuario, modulo, fechaDesde, fechaHasta));
    }

    @GetMapping("/stats")
    public ResponseEntity<AuditoriaStatsDTO> getStats() {
        return ResponseEntity.ok(auditoriaService.obtenerStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditoriaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(auditoriaService.obtenerPorId(id));
    }
}

package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaStatsDTO;
import pe.edu.unas.ctic.diagti.administrador.service.EvidenciaService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/evidencias")
@RequiredArgsConstructor
public class EvidenciaController {

    private final EvidenciaService evidenciaService;

    @GetMapping
    public ResponseEntity<List<EvidenciaDTO>> listarEvidencias(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String responsable,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(evidenciaService.listarEvidencias(busqueda, modulo, responsable, estado));
    }

    @GetMapping("/stats")
    public ResponseEntity<EvidenciaStatsDTO> getStats() {
        return ResponseEntity.ok(evidenciaService.obtenerStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvidenciaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(evidenciaService.obtenerPorId(id));
    }
}

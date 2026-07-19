package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaStatsDTO;
import pe.edu.unas.ctic.diagti.administrador.service.AuditoriaService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/auditoria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public List<AuditoriaDTO> listarAuditoria(
            @RequestParam(required = false) String usuario,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        return auditoriaService.listarAuditoria(usuario, modulo, fechaDesde, fechaHasta);
    }

    @GetMapping("/stats")
    public AuditoriaStatsDTO getStats() {
        return auditoriaService.obtenerStats();
    }

    @GetMapping("/{id}")
    public AuditoriaDTO obtenerPorId(@PathVariable Long id) {
        return auditoriaService.obtenerPorId(id);
    }
}
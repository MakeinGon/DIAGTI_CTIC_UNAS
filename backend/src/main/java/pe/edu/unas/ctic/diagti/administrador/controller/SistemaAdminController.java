package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaListDTO;
import pe.edu.unas.ctic.diagti.administrador.service.SistemaAdminService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/sistemas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SistemaAdminController {

    private final SistemaAdminService sistemaAdminService;

    @GetMapping
    public List<SistemaListDTO> listarSistemas(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String responsable,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String criticidad,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        return sistemaAdminService.listarSistemas(busqueda, area, responsable, estado, criticidad, tipo, fechaDesde, fechaHasta);
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", sistemaAdminService.contarSistemas());
        stats.put("activos", sistemaAdminService.contarActivos());
        return stats;
    }

    @GetMapping("/{id}")
    public SistemaDetalleDTO obtenerPorId(@PathVariable Long id) {
        return sistemaAdminService.obtenerPorId(id);
    }
}
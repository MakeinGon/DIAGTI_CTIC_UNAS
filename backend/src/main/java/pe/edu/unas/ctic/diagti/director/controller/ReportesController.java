package pe.edu.unas.ctic.diagti.director.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import pe.edu.unas.ctic.diagti.director.service.ReportesService;

import java.util.List;

@RestController
@RequestMapping("/api/director/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportesController {

    private final ReportesService reportesService;

    @GetMapping("/inventario")
    public List<ReporteInventarioDTO> getInventario(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String criticidad) {
        return reportesService.obtenerInventario(area, criticidad);
    }

    @GetMapping("/validacion")
    public List<ReporteValidacionDTO> getValidacion(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String estado) {
        return reportesService.obtenerValidacion(area, estado);
    }
}
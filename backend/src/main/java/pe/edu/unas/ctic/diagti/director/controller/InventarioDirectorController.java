package pe.edu.unas.ctic.diagti.director.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.director.dto.SistemaDetalleDirectorDTO;
import pe.edu.unas.ctic.diagti.director.dto.SistemaInventarioDTO;
import pe.edu.unas.ctic.diagti.director.service.DirectorInventarioService;

import java.util.List;

@RestController
@RequestMapping("/api/director/inventario")
@RequiredArgsConstructor
public class InventarioDirectorController {

    private final DirectorInventarioService inventarioService;

    @GetMapping
    public List<SistemaInventarioDTO> listar(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String criticidad,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String busqueda) {
        return inventarioService.listar(area, criticidad, estado, busqueda);
    }

    @GetMapping("/{sistemaId}")
    public SistemaDetalleDirectorDTO detalle(@PathVariable Long sistemaId) {
        return inventarioService.obtenerDetalle(sistemaId);
    }
}

package pe.edu.unas.ctic.diagti.director.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.service.RiesgosService;

import java.util.List;

@RestController
@RequestMapping("/api/director/riesgos")
@RequiredArgsConstructor
public class RiesgosController {

    private final RiesgosService riesgosService;

    @GetMapping
    public List<RiesgoDTO> getRiesgos(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String nivel,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria) {
        return riesgosService.obtenerRiesgos(area, nivel, estado, categoria);
    }
}

package pe.edu.unas.ctic.diagti.infraestructura.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraHistorialDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraModuloService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/infraestructura/historial")
@RequiredArgsConstructor
public class InfraHistorialController {

    private final InfraestructuraModuloService service;

    @GetMapping
    public ResponseEntity<List<InfraHistorialDTO>> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String accion) {
        Map<String, String> filtros = new HashMap<>();
        if (q != null) filtros.put("q", q);
        if (accion != null) filtros.put("accion", accion);
        return ResponseEntity.ok(service.listarHistorial(filtros));
    }
}

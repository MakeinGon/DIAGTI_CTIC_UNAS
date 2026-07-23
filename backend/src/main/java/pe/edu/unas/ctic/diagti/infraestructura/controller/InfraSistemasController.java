package pe.edu.unas.ctic.diagti.infraestructura.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraSistemasService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/infraestructura/sistemas")
@CrossOrigin(origins = "*")
public class InfraSistemasController {
    private final InfraSistemasService service;
    public InfraSistemasController(InfraSistemasService service) { this.service = service; }

    @GetMapping
    public List<InfraSistemaDTO> listar(@RequestParam(required = false) String usuario) {
        return service.listar(usuario);
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<InfraSistemaDTO> obtener(@PathVariable String codigo) {
        try { return ResponseEntity.ok(service.obtener(codigo)); }
        catch (java.util.NoSuchElementException ex) { return ResponseEntity.notFound().build(); }
    }

    @GetMapping("/estadisticas")
    public Map<String, Long> estadisticas(@RequestParam(required = false) String usuario) {
        return service.estadisticas(usuario);
    }
}

package pe.edu.unas.ctic.diagti.desarrollador.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.DesarrolloFlujoDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolloFlujoService;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/desarrollador/flujo")
@CrossOrigin(origins = "*")
public class DesarrolloFlujoController {
    private final DesarrolloFlujoService service;

    public DesarrolloFlujoController(DesarrolloFlujoService service) { this.service = service; }

    @GetMapping("/sistemas")
    public List<DesarrolloFlujoDTO> listar(@RequestParam(required = false) String usuario) {
        return service.listar(usuario);
    }

    @GetMapping("/sistemas/{codigo}")
    public ResponseEntity<DesarrolloFlujoDTO> obtener(@PathVariable String codigo) {
        try { return ResponseEntity.ok(service.obtener(codigo)); }
        catch (java.util.NoSuchElementException ex) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping("/borradores")
    public DesarrolloFlujoDTO guardarBorrador(@Valid @RequestBody DesarrolloFlujoDTO.Request request)
            throws JsonProcessingException {
        return service.guardarBorrador(request);
    }

    @PostMapping("/correcciones")
    public DesarrolloFlujoDTO guardarCorreccion(@Valid @RequestBody DesarrolloFlujoDTO.Request request)
            throws JsonProcessingException {
        return service.guardarCorreccion(request);
    }

    @PostMapping("/enviar")
    public SolicitudValidacion enviar(@Valid @RequestBody DesarrolloFlujoDTO.Request request)
            throws JsonProcessingException {
        return service.enviar(request);
    }

    @GetMapping("/historial/{codigo}")
    public List<SolicitudValidacion> historial(@PathVariable String codigo) { return service.historial(codigo); }

    @GetMapping("/estadisticas")
    public Map<String, Long> estadisticas(@RequestParam(required = false) String usuario) {
        return service.estadisticas(usuario);
    }
}

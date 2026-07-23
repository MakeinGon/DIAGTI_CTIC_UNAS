package pe.edu.unas.ctic.diagti.flujo.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.flujo.dto.SolicitudValidacionRequest;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import pe.edu.unas.ctic.diagti.flujo.service.SolicitudValidacionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flujo-validacion")
public class SolicitudValidacionController {
    private final SolicitudValidacionService service;

    public SolicitudValidacionController(SolicitudValidacionService service) { this.service = service; }

    @PostMapping("/solicitudes")
    public ResponseEntity<SolicitudValidacion> crear(@Valid @RequestBody SolicitudValidacionRequest request)
            throws JsonProcessingException {
        return ResponseEntity.ok(service.crear(request));
    }

    @GetMapping("/pendientes")
    public List<SolicitudValidacion> pendientes() { return service.pendientes(); }

    @GetMapping("/origen/{areaOrigen}")
    public List<SolicitudValidacion> porOrigen(@PathVariable String areaOrigen) {
        return service.porOrigen(areaOrigen);
    }

    @GetMapping("/estado")
    public ResponseEntity<SolicitudValidacion> estadoActual(@RequestParam String areaOrigen,
                                                            @RequestParam String codigoSistema) {
        return service.estadoActual(areaOrigen, codigoSistema)
                .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/historial")
    public List<SolicitudValidacion> historial(@RequestParam(required = false) String areaOrigen,
                                               @RequestParam(required = false) String codigoSistema) {
        return service.historial(areaOrigen, codigoSistema);
    }

    @GetMapping("/solicitudes/{id}")
    public ResponseEntity<SolicitudValidacion> detalle(@PathVariable Long id) {
        return service.detalle(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/solicitudes/{id}/estado")
    public ResponseEntity<SolicitudValidacion> cambiarEstado(@PathVariable Long id,
                                                              @RequestBody Map<String, Object> body) {
        try {
            return service.cambiarEstado(id, body)
                    .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}

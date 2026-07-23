package pe.edu.unas.ctic.diagti.infraestructura.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvaluacionDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvaluacionRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaListDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraModuloService;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/infraestructura/sistemas")
@RequiredArgsConstructor
public class InfraSistemasController {

    private final InfraestructuraModuloService service;

    @GetMapping
    public ResponseEntity<List<InfraSistemaListDTO>> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String riesgo,
            @RequestParam(required = false) String pendientesEvaluacion) {
        Map<String, String> filtros = new HashMap<>();
        if (q != null) filtros.put("q", q);
        if (estado != null) filtros.put("estado", estado);
        if (riesgo != null) filtros.put("riesgo", riesgo);
        if (pendientesEvaluacion != null) filtros.put("pendientesEvaluacion", pendientesEvaluacion);
        return ResponseEntity.ok(service.listarSistemas(filtros));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InfraSistemaDetalleDTO> detalle(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.obtenerDetalle(id));
    }

    @PostMapping("/{id}/evaluacion")
    public ResponseEntity<InfraEvaluacionDTO> crearEvaluacion(
            @PathVariable("id") Long id,
            @RequestBody InfraEvaluacionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardarEvaluacion(id, request));
    }

    @PutMapping("/{id}/evaluacion")
    public ResponseEntity<InfraEvaluacionDTO> actualizarEvaluacion(
            @PathVariable("id") Long id,
            @RequestBody InfraEvaluacionRequestDTO request) {
        return ResponseEntity.ok(service.guardarEvaluacion(id, request));
    }

    @GetMapping("/{id}/observaciones")
    public ResponseEntity<List<ObservacionValidacionDTO>> observaciones(
            @PathVariable("id") Long id,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(service.listarObservaciones(id, estado));
    }

    @PostMapping("/{id}/observaciones")
    public ResponseEntity<ObservacionValidacionDTO> registrarObservacion(
            @PathVariable("id") Long id,
            @RequestBody ObservacionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrarObservacion(id, request));
    }
}

package pe.edu.unas.ctic.diagti.validador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.service.ValidadorService;

import java.util.Map;

/**
 * Compatibilidad con el frontend que publica en {@code POST /api/observaciones}.
 */
@RestController
@RequestMapping("/api/observaciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ObservacionesCompatController {

    private final ValidadorService validadorService;

    @PostMapping
    public ResponseEntity<ObservacionValidacionDTO> crear(@RequestBody ObservacionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(validadorService.registrarObservacion(request));
    }

    @GetMapping
    public ResponseEntity<?> listarPorSistema(
            @RequestParam(required = false) Long sistemaId,
            @RequestParam(required = false) Long idSistema,
            @RequestParam(required = false) String estado) {
        Long id = sistemaId != null ? sistemaId : idSistema;
        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "sistemaId es obligatorio"));
        }
        return ResponseEntity.ok(validadorService.listarObservacionesPorSistema(id, estado));
    }
}

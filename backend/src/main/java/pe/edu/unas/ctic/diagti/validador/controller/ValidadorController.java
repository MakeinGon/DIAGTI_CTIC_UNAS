package pe.edu.unas.ctic.diagti.validador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.validador.dto.DecisionValidacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.SistemaValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ValidadorDTO;
import pe.edu.unas.ctic.diagti.validador.entity.Validacion;
import pe.edu.unas.ctic.diagti.validador.service.ValidadorService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/validacion")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ValidadorController {

    private final ValidadorService validadorService;

    @GetMapping("/pendientes")
    public ResponseEntity<List<ValidadorDTO>> getPendientes() {
        return ResponseEntity.ok(validadorService.getPendientes());
    }

    @GetMapping("/subsanacion")
    public ResponseEntity<List<ValidadorDTO>> getEnSubsanacion() {
        return ResponseEntity.ok(validadorService.getEnSubsanacion());
    }

    @GetMapping({"/observados", "/observados/"})
    public ResponseEntity<List<ValidadorDTO>> getObservados() {
        return ResponseEntity.ok(validadorService.getEnSubsanacion());
    }

    @GetMapping("/validados")
    public ResponseEntity<List<ValidadorDTO>> getValidados() {
        return ResponseEntity.ok(validadorService.getValidados());
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Long>> getEstadisticas() {
        return ResponseEntity.ok(validadorService.getEstadisticas());
    }

    @GetMapping("/sistema/{idSistema}")
    public ResponseEntity<SistemaValidacionDTO> getDetalle(@PathVariable Long idSistema) {
        return ResponseEntity.ok(validadorService.getDetalleSistema(idSistema));
    }

    @PostMapping("/validar")
    public ResponseEntity<ValidadorDTO> validarSistema(@RequestBody DecisionValidacionRequestDTO request) {
        return ResponseEntity.ok(validadorService.validarSistema(request));
    }

    @PostMapping("/observar")
    public ResponseEntity<ValidadorDTO> observarSistema(@RequestBody DecisionValidacionRequestDTO request) {
        return ResponseEntity.ok(validadorService.observarSistema(request));
    }

    @PostMapping("/rechazar")
    public ResponseEntity<ValidadorDTO> rechazarSistema(@RequestBody DecisionValidacionRequestDTO request) {
        return ResponseEntity.ok(validadorService.rechazarSistema(request));
    }

    /** Compatibilidad con body legacy tipo entidad Validacion */
    @PostMapping("/validar-legacy")
    public ResponseEntity<ValidadorDTO> validarLegacy(@RequestBody Validacion validacion) {
        return ResponseEntity.ok(validadorService.validarSistema(validacion));
    }

    @PostMapping("/observaciones")
    public ResponseEntity<ObservacionValidacionDTO> registrarObservacion(@RequestBody ObservacionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(validadorService.registrarObservacion(request));
    }

    @GetMapping("/sistema/{idSistema}/observaciones")
    public ResponseEntity<List<ObservacionValidacionDTO>> listarObservaciones(
            @PathVariable Long idSistema,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(validadorService.listarObservacionesPorSistema(idSistema, estado));
    }

    @PostMapping("/observaciones/{id}/aprobar-subsanacion")
    public ResponseEntity<ObservacionValidacionDTO> aprobarSubsanacion(
            @PathVariable Long id,
            @RequestParam(required = false) String username) {
        return ResponseEntity.ok(validadorService.aprobarSubsanacion(id, username));
    }

    @PostMapping("/observaciones/{id}/rechazar-subsanacion")
    public ResponseEntity<ObservacionValidacionDTO> rechazarSubsanacion(
            @PathVariable Long id,
            @RequestParam(required = false) String username,
            @RequestBody(required = false) Map<String, String> body) {
        String comentario = body != null ? body.get("comentario") : null;
        return ResponseEntity.ok(validadorService.rechazarSubsanacion(id, username, comentario));
    }
}

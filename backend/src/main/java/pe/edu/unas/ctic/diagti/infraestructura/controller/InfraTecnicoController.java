package pe.edu.unas.ctic.diagti.infraestructura.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraModuloService;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;

import java.util.Map;

/**
 * Endpoints de revisión de observaciones de infraestructura (reutiliza ValidadorService).
 */
@RestController
@RequestMapping("/api/infraestructura")
@RequiredArgsConstructor
public class InfraTecnicoController {

    private final InfraestructuraModuloService service;

    @PostMapping("/observaciones/{id}/aprobar-subsanacion")
    public ResponseEntity<ObservacionValidacionDTO> aprobar(
            @PathVariable Long id,
            @RequestParam(required = false) String username) {
        return ResponseEntity.ok(service.aprobarSubsanacion(id, username));
    }

    @PostMapping("/observaciones/{id}/rechazar-subsanacion")
    public ResponseEntity<ObservacionValidacionDTO> rechazar(
            @PathVariable Long id,
            @RequestParam(required = false) String username,
            @RequestBody(required = false) Map<String, String> body) {
        String comentario = body != null ? body.get("comentario") : null;
        return ResponseEntity.ok(service.rechazarSubsanacion(id, username, comentario));
    }
}

package pe.edu.unas.ctic.diagti.infraestructura.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraTecnicoRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraTecnicoResponseDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraTecnicoService;

@RestController
@RequestMapping("/api/infraestructura/tecnico")
@CrossOrigin(origins = "*")
public class InfraTecnicoController {
    private final InfraTecnicoService service;
    public InfraTecnicoController(InfraTecnicoService service) { this.service = service; }

    @PostMapping("/borradores")
    public ResponseEntity<InfraTecnicoResponseDTO> guardarBorrador(
            @Valid @RequestBody InfraTecnicoRequestDTO request) throws JsonProcessingException {
        try { return ResponseEntity.ok(service.guardarBorrador(request)); }
        catch (IllegalStateException ex) { return ResponseEntity.badRequest().build(); }
    }

    @PostMapping("/correcciones")
    public ResponseEntity<InfraTecnicoResponseDTO> guardarCorreccion(
            @Valid @RequestBody InfraTecnicoRequestDTO request) throws JsonProcessingException {
        try { return ResponseEntity.ok(service.guardarCorreccion(request)); }
        catch (IllegalStateException ex) { return ResponseEntity.badRequest().build(); }
    }

    @PostMapping("/enviar")
    public ResponseEntity<InfraTecnicoResponseDTO> enviar(
            @Valid @RequestBody InfraTecnicoRequestDTO request) throws JsonProcessingException {
        try { return ResponseEntity.ok(service.enviar(request)); }
        catch (IllegalStateException ex) { return ResponseEntity.badRequest().build(); }
    }
}

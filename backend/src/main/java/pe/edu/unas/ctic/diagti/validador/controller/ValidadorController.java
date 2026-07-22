package pe.edu.unas.ctic.diagti.validador.controller;

import pe.edu.unas.ctic.diagti.validador.dto.ValidadorDTO;
import pe.edu.unas.ctic.diagti.validador.entity.Validacion;
import pe.edu.unas.ctic.diagti.validador.service.ValidadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/validacion")
@CrossOrigin(origins = "*")
public class ValidadorController {

    @Autowired
    private ValidadorService validadorService;

    @GetMapping("/pendientes")
    public ResponseEntity<List<ValidadorDTO>> getPendientes() {
        return ResponseEntity.ok(validadorService.getPendientes());
    }

    @GetMapping("/subsanacion")
    public ResponseEntity<List<ValidadorDTO>> getEnSubsanacion() {
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

    @PostMapping("/validar")
    public ResponseEntity<ValidadorDTO> validarSistema(@RequestBody Validacion validacion) {
        return ResponseEntity.ok(validadorService.validarSistema(validacion));
    }

    @PostMapping("/observar")
    public ResponseEntity<ValidadorDTO> observarSistema(@RequestBody Validacion validacion) {
        return ResponseEntity.ok(validadorService.observarSistema(validacion));
    }

    @PostMapping("/rechazar")
    public ResponseEntity<ValidadorDTO> rechazarSistema(@RequestBody Validacion validacion) {
        return ResponseEntity.ok(validadorService.rechazarSistema(validacion));
    }

    @GetMapping("/sistema/{idSistema}")
    public ResponseEntity<Validacion> getValidacionBySistema(@PathVariable Long idSistema) {
        Validacion validacion = validadorService.getValidacionBySistema(idSistema);
        if (validacion != null) {
            return ResponseEntity.ok(validacion);
        }
        return ResponseEntity.notFound().build();
    }
}
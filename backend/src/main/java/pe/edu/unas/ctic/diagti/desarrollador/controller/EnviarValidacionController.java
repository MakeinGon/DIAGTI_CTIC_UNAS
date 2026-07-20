package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EnviarValidacionRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EnviarValidacionResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaValidacionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.EnviarValidacionService;

import java.util.List;

@RestController
@RequestMapping("/api/desarrollador/validaciones")
@RequiredArgsConstructor

public class EnviarValidacionController {
    
    private final EnviarValidacionService enviarValidacionService;
    
    @GetMapping("/pendientes")
    public ResponseEntity<List<SistemaValidacionDTO>> obtenerSistemasPendientes() {
        return ResponseEntity.ok(enviarValidacionService.obtenerSistemasPendientes());
    }
    
    @PostMapping("/solicitar")
    public ResponseEntity<EnviarValidacionResponseDTO> solicitarValidacion(
            @RequestBody EnviarValidacionRequestDTO request) {
        return ResponseEntity.ok(enviarValidacionService.solicitarValidacion(request));
    }
    
    @GetMapping("/verificar/{id}")
    public ResponseEntity<SistemaValidacionDTO> verificarCompletitud(@PathVariable Long id) {
        return ResponseEntity.ok(enviarValidacionService.verificarCompletitud(id));
    }
}
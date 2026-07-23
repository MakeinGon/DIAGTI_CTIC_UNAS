package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SubsanarObservacionesRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SubsanarObservacionesResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaObservadoDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.SubsanarObservacionesService;

import java.util.List;

@RestController
@RequestMapping("/api/desarrollador/subsanar")
@RequiredArgsConstructor

public class SubsanarObservacionesController {
    
    private final SubsanarObservacionesService subsanarService;
    
    @GetMapping("/pendientes")
    public ResponseEntity<List<SistemaObservadoDTO>> obtenerSistemasObservados() {
        return ResponseEntity.ok(subsanarService.obtenerSistemasObservados());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SubsanarObservacionesResponseDTO> obtenerDetalleSubsanacion(@PathVariable Long id) {
        return ResponseEntity.ok(subsanarService.obtenerDetalleSubsanacion(id));
    }
    
    @PostMapping("/{id}/guardar")
    public ResponseEntity<SubsanarObservacionesResponseDTO> guardarSubsanacion(
            @PathVariable Long id,
            @RequestBody SubsanarObservacionesRequestDTO request) {
        return ResponseEntity.ok(subsanarService.guardarSubsanacion(id, request));
    }
    
    @PostMapping("/{id}/evidencias")
    public ResponseEntity<SubsanarObservacionesResponseDTO> subirEvidenciaSubsanacion(
            @PathVariable Long id,
            @RequestParam("tipo") String tipo,
            @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(subsanarService.subirEvidenciaSubsanacion(id, tipo, archivo));
    }
    
    @PostMapping("/{id}/reenviar")
    public ResponseEntity<SubsanarObservacionesResponseDTO> reenviarValidacion(@PathVariable Long id) {
        return ResponseEntity.ok(subsanarService.reenviarValidacion(id));
    }
}
//-
package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.HistorialSistemaDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.HistorialSistemaService;

@RestController
@RequestMapping("/api/desarrollador/historial")
@RequiredArgsConstructor
public class HistorialSistemaController {
    
    private final HistorialSistemaService historialService;
    
    @GetMapping("/{id}")
    public ResponseEntity<HistorialSistemaDTO> obtenerHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(historialService.obtenerHistorial(id));
    }
    
    @GetMapping("/{id}/resumen")
    public ResponseEntity<HistorialSistemaDTO.ResumenSistemaDTO> obtenerResumen(@PathVariable Long id) {
        return ResponseEntity.ok(historialService.obtenerResumen(id));
    }
}
//-
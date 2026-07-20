package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasFilterDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.MisSistemasService;

import java.util.List;

@RestController
@RequestMapping("/api/desarrollador/mis-sistemas")  // ✅ Verifica que esta ruta sea correcta
@RequiredArgsConstructor
public class MisSistemasController {
    
    private final MisSistemasService misSistemasService;
    
    @GetMapping
    public ResponseEntity<List<MisSistemasDTO>> listarMisSistemas(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String criticidad) {
        
        MisSistemasFilterDTO filtros = new MisSistemasFilterDTO();
        filtros.setEstado(estado);
        filtros.setBusqueda(busqueda);
        filtros.setArea(area);
        filtros.setTipo(tipo);
        filtros.setCriticidad(criticidad);
        
        return ResponseEntity.ok(misSistemasService.listarMisSistemas(filtros));
    }
}
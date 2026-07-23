package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;
import pe.edu.unas.ctic.diagti.desarrollador.service.impl.MisSistemasServiceImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/desarrollador/mis-sistemas")
@RequiredArgsConstructor
public class MisSistemasController {

    private final MisSistemasServiceImpl misSistemasService;
    private final DesarrolladorInventarioService inventarioService;

    @GetMapping
    public ResponseEntity<List<SistemaFrontendDTO>> listarMisSistemas(
            @RequestParam String username,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String criticidad) {

        Map<String, String> filtros = new HashMap<>();
        if (estado != null) filtros.put("estado", estado);
        if (busqueda != null) filtros.put("busqueda", busqueda);
        if (criticidad != null) filtros.put("riesgo", criticidad);

        return ResponseEntity.ok(inventarioService.listarSistemasDelDesarrollador(username, filtros));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SistemaFrontendDTO> obtener(
            @RequestParam String username,
            @PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.obtenerSistemaDelDesarrollador(username, id));
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<MisSistemasDTO.EstadisticasDTO> estadisticas(@RequestParam String username) {
        try {
            misSistemasService.setUsernameContexto(username);
            return ResponseEntity.ok(misSistemasService.obtenerEstadisticas());
        } finally {
            misSistemasService.clearUsernameContexto();
        }
    }
}

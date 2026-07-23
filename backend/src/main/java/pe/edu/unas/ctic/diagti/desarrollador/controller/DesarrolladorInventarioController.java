package pe.edu.unas.ctic.diagti.desarrollador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Endpoints alineados al frontend actual de desarrollo (Luis Lara).
 * Usa tablas oficiales: sistemas, observaciones, validaciones.
 */
@RestController
@RequestMapping("/api/desarrollador")
@RequiredArgsConstructor
public class DesarrolladorInventarioController {

    private final DesarrolladorInventarioService inventarioService;

    @GetMapping("/inventario")
    public ResponseEntity<List<SistemaFrontendDTO>> listarInventario(
            @RequestParam String username,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String riesgo,
            @RequestParam(required = false) String soloObservados) {

        Map<String, String> filtros = new HashMap<>();
        if (estado != null) filtros.put("estado", estado);
        if (busqueda != null) filtros.put("busqueda", busqueda);
        if (riesgo != null) filtros.put("riesgo", riesgo);
        if (soloObservados != null) filtros.put("soloObservados", soloObservados);

        return ResponseEntity.ok(inventarioService.listarSistemasDelDesarrollador(username, filtros));
    }

    @GetMapping("/inventario/{id}")
    public ResponseEntity<SistemaFrontendDTO> obtenerSistema(
            @RequestParam String username,
            @PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.obtenerSistemaDelDesarrollador(username, id));
    }

    @PostMapping("/inventario/{id}/enviar-validacion")
    public ResponseEntity<SistemaFrontendDTO> enviarValidacion(
            @RequestParam String username,
            @PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.enviarAValidacion(username, id));
    }

    @PostMapping("/inventario/{id}/subsanar")
    public ResponseEntity<SistemaFrontendDTO> subsanar(
            @RequestParam String username,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String respuesta = body != null ? body.get("respuesta") : null;
        return ResponseEntity.ok(inventarioService.marcarObservacionesAtendidas(username, id, respuesta));
    }

    @GetMapping("/observaciones/conteo")
    public ResponseEntity<Map<String, Long>> conteoObservaciones(@RequestParam String username) {
        return ResponseEntity.ok(inventarioService.contarObservaciones(username));
    }
}

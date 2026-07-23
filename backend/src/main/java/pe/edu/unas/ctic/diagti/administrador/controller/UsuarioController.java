package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.service.UsuarioService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService service;

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long rol,
            @RequestParam(required = false) Boolean estado,
            @RequestParam(required = false) String origen) {
        return ResponseEntity.ok(service.listar(search, rol, estado, origen));
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> crear(@RequestBody UsuarioDTO dto,
                                            @RequestParam Long rolId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(dto, rolId));
    }

    @PutMapping("/{dni}")
    public ResponseEntity<UsuarioDTO> actualizar(@PathVariable String dni,
                                                 @RequestBody UsuarioDTO dto,
                                                 @RequestParam Long rolId) {
        return ResponseEntity.ok(service.actualizar(dni, dto, rolId));
    }

    /**
     * Toggle activo/inactivo (boton .toggle de la tabla). No requiere rolId
     * ni el resto del formulario, solo el nuevo estado.
     */
    @PatchMapping("/{dni}/estado")
    public ResponseEntity<UsuarioDTO> cambiarEstado(@PathVariable String dni,
                                                     @RequestBody Map<String, Boolean> body) {
        Boolean estado = body.get("estado");
        if (estado == null) {
            throw new IllegalArgumentException("Falta el campo 'estado' en el cuerpo de la peticion");
        }
        return ResponseEntity.ok(service.cambiarEstado(dni, estado));
    }

    @DeleteMapping("/{dni}")
    public ResponseEntity<Void> eliminar(@PathVariable String dni) {
        service.eliminar(dni);
        return ResponseEntity.noContent().build();
    }
}

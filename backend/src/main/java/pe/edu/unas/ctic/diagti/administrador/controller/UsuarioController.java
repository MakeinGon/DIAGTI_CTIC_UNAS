package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.service.UsuarioService;

import java.util.List;

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

    @DeleteMapping("/{dni}")
    public ResponseEntity<Void> eliminar(@PathVariable String dni) {
        service.eliminar(dni);
        return ResponseEntity.noContent().build();
    }
}
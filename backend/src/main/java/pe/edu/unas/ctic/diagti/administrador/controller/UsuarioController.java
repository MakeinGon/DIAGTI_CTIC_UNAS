package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.RestablecerPasswordRequestDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.service.UsuarioService;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
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

    @GetMapping("/{dni}")
    public ResponseEntity<UsuarioDTO> obtener(@PathVariable String dni) {
        return ResponseEntity.ok(service.obtenerPorDni(dni));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody UsuarioDTO dto,
                                                     @RequestParam Long rolId) {
        UsuarioDTO creado = service.crear(dto, rolId);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Usuario creado correctamente");
        body.put("usuario", creado);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{dni}")
    public ResponseEntity<UsuarioDTO> actualizar(@PathVariable String dni,
                                                 @RequestBody UsuarioDTO dto,
                                                 @RequestParam(required = false) Long rolId) {
        return ResponseEntity.ok(service.actualizar(dni, dto, rolId));
    }

    @PostMapping("/{dni}/password")
    public ResponseEntity<Map<String, Object>> restablecerPassword(
            @PathVariable String dni,
            @RequestBody RestablecerPasswordRequestDTO request) {
        UsuarioDTO actualizado = service.restablecerPassword(dni, request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Contraseña restablecida correctamente");
        body.put("usuario", actualizado);
        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{dni}/estado")
    public ResponseEntity<UsuarioDTO> cambiarEstado(@PathVariable String dni,
                                                     @RequestBody Map<String, Boolean> body) {
        Boolean estado = body.get("estado");
        if (estado == null) {
            throw new IllegalArgumentException("Falta el campo 'estado' en el cuerpo de la peticion");
        }
        return ResponseEntity.ok(service.cambiarEstado(dni, estado));
    }

    /**
     * Soft-delete: desactiva el usuario. Conserva el verbo DELETE del contrato UI,
     * pero no elimina físicamente el registro.
     */
    @DeleteMapping("/{dni}")
    public ResponseEntity<UsuarioDTO> desactivar(@PathVariable String dni) {
        return ResponseEntity.ok(service.desactivar(dni));
    }

    @PostMapping("/{dni}/roles/{rolId}")
    public ResponseEntity<UsuarioDTO> asignarRol(@PathVariable String dni, @PathVariable Long rolId) {
        return ResponseEntity.ok(service.asignarRol(dni, rolId));
    }

    @DeleteMapping("/{dni}/roles/{rolId}")
    public ResponseEntity<UsuarioDTO> retirarRol(@PathVariable String dni, @PathVariable Long rolId) {
        return ResponseEntity.ok(service.retirarRol(dni, rolId));
    }
}

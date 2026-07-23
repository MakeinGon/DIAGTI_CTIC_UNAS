package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.PermisoDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.RolDTO;
import pe.edu.unas.ctic.diagti.administrador.service.PermisoService;
import pe.edu.unas.ctic.diagti.administrador.service.RolService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class RolPermisoController {

    private final RolService rolService;
    private final PermisoService permisoService;

    @GetMapping("/roles")
    public ResponseEntity<List<RolDTO>> listarRoles() {
        return ResponseEntity.ok(rolService.listar());
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<RolDTO> obtenerRol(@PathVariable Long id) {
        return ResponseEntity.ok(rolService.obtenerPorId(id));
    }

    @PostMapping("/roles")
    public ResponseEntity<RolDTO> crearRol(@RequestBody RolDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rolService.crear(dto));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<RolDTO> actualizarRol(@PathVariable Long id, @RequestBody RolDTO dto) {
        return ResponseEntity.ok(rolService.actualizar(id, dto));
    }

    /** Soft-delete: desactiva el rol sin borrarlo físicamente. */
    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> desactivarRol(@PathVariable Long id) {
        rolService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/permisos/{rolId}")
    public ResponseEntity<List<PermisoDTO>> obtenerPermisos(@PathVariable Long rolId) {
        return ResponseEntity.ok(permisoService.obtenerPorRol(rolId));
    }

    @PutMapping("/permisos/{rolId}")
    public ResponseEntity<Void> actualizarPermisos(@PathVariable Long rolId,
                                                   @RequestBody List<PermisoDTO> permisos) {
        permisoService.actualizarPermisos(rolId, permisos);
        return ResponseEntity.noContent().build();
    }
}

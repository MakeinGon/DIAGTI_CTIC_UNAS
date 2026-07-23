package pe.edu.unas.ctic.diagti.administrador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.dto.CatalogoDTO;
import pe.edu.unas.ctic.diagti.administrador.service.CatalogoService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/catalogos")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService service;

    /** Listado global: evita el 500 de recurso estático inexistente en la ruta base. */
    @GetMapping
    public ResponseEntity<List<CatalogoDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{tipo}")
    public ResponseEntity<List<CatalogoDTO>> listar(@PathVariable String tipo) {
        return ResponseEntity.ok(service.listarPorTipo(tipo));
    }

    @PostMapping("/{tipo}")
    public ResponseEntity<CatalogoDTO> crear(@PathVariable String tipo, @RequestBody CatalogoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(tipo, dto));
    }

    @PutMapping("/{tipo}/{codigo}")
    public ResponseEntity<CatalogoDTO> actualizar(@PathVariable String tipo,
                                                  @PathVariable String codigo,
                                                  @RequestBody CatalogoDTO dto) {
        return ResponseEntity.ok(service.actualizar(tipo, codigo, dto));
    }

    /** Soft-delete: desactiva el ítem sin borrarlo físicamente. */
    @DeleteMapping("/{tipo}/{codigo}")
    public ResponseEntity<Void> desactivar(@PathVariable String tipo, @PathVariable String codigo) {
        service.eliminar(tipo, codigo);
        return ResponseEntity.noContent().build();
    }
}

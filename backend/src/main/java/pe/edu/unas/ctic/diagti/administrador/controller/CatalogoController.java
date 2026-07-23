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
@CrossOrigin(origins = "*")
public class CatalogoController {

    private final CatalogoService service;

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

    @DeleteMapping("/{tipo}/{codigo}")
    public ResponseEntity<Void> eliminar(@PathVariable String tipo, @PathVariable String codigo) {
        service.eliminar(tipo, codigo);
        return ResponseEntity.noContent().build();
    }
}
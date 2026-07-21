package pe.edu.unas.ctic.diagti.validacion;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/validaciones")
public class ValidacionController {

    private final ValidacionRepository validacionRepository;

    public ValidacionController(ValidacionRepository validacionRepository) {
        this.validacionRepository = validacionRepository;
    }

    @PostMapping
    public ResponseEntity<Validacion> crearValidacion(@Valid @RequestBody Validacion validacion) {
        Validacion guardada = validacionRepository.save(validacion);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(guardada.getId())
                .toUri();

        return ResponseEntity.created(location).body(guardada);
    }
}

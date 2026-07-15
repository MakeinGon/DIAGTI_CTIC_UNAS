package pe.edu.unas.ctic.diagti.observaciones;

import java.net.URI;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/observaciones")
public class ObservacionController {

    private final ObservacionRepository observacionRepository;

    public ObservacionController(ObservacionRepository observacionRepository) {
        this.observacionRepository = observacionRepository;
    }

    @PostMapping
    public ResponseEntity<Observacion> crearObservacion(@Valid @RequestBody Observacion observacion) {
        if (observacion.getFechaRegistro() == null) {
            observacion.setFechaRegistro(LocalDateTime.now());
        }

        Observacion guardada = observacionRepository.save(observacion);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(guardada.getId())
                .toUri();

        return ResponseEntity.created(location).body(guardada);
    }
}

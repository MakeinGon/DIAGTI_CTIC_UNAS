package pe.edu.unas.ctic.diagti.sistemas;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sistemas")
public class SistemaController {

    private final SistemaRepository sistemaRepository;

    public SistemaController(SistemaRepository sistemaRepository) {
        this.sistemaRepository = sistemaRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sistema> obtenerSistema(@PathVariable Long id) {
        Optional<Sistema> sistema = sistemaRepository.findById(id);
        return sistema.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}

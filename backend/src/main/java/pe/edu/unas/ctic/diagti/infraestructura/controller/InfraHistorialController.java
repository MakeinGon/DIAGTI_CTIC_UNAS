package pe.edu.unas.ctic.diagti.infraestructura.controller;

import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraHistorialDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraHistorialService;

import java.util.List;

@RestController
@RequestMapping("/api/infraestructura/historial")
@CrossOrigin(origins = "*")
public class InfraHistorialController {
    private final InfraHistorialService service;
    public InfraHistorialController(InfraHistorialService service) { this.service = service; }

    @GetMapping("/{codigoSistema}")
    public List<InfraHistorialDTO> listar(@PathVariable String codigoSistema) {
        return service.listar(codigoSistema);
    }
}

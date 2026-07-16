package pe.edu.unas.ctic.diagti.infraestructura.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.RegistroTecnicoDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraService;

/**
 * Endpoints que alimentan el formulario de 4 pasos de infraestructura.html
 * (Infraestructura, Despliegue, Seguridad, Evidencias).
 */
@RestController
@RequestMapping("/api/infraestructura/registro")
@RequiredArgsConstructor
public class RegistroTecnicoController {

    private final InfraestructuraService infraestructuraService;

    @GetMapping("/{codigo}")
    public RegistroTecnicoDTO obtener(@PathVariable String codigo) {
        return infraestructuraService.obtenerRegistro(codigo);
    }

    @PostMapping("/{codigo}/borrador")
    public RegistroTecnicoDTO guardarBorrador(@PathVariable String codigo, @RequestBody RegistroTecnicoDTO dto) {
        return infraestructuraService.guardarBorrador(codigo, dto, dto.getUltimoPaso());
    }

    @PostMapping("/{codigo}/enviar")
    public RegistroTecnicoDTO enviar(@PathVariable String codigo, @RequestBody RegistroTecnicoDTO dto) {
        return infraestructuraService.enviarValidacion(codigo, dto);
    }
}

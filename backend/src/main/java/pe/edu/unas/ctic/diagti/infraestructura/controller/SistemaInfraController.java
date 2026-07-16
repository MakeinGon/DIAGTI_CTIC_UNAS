package pe.edu.unas.ctic.diagti.infraestructura.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.DashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.SistemaInfraDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.SubsanacionRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraService;

import java.util.List;

/**
 * Endpoints que alimentan dashboard.html y mis-sistemas.html.
 */
@RestController
@RequestMapping("/api/infraestructura")
@RequiredArgsConstructor
public class SistemaInfraController {

    private final InfraestructuraService infraestructuraService;

    @GetMapping("/sistemas")
    public List<SistemaInfraDTO> listarSistemas() {
        return infraestructuraService.listarSistemas();
    }

    @GetMapping("/dashboard")
    public DashboardDTO dashboard() {
        return infraestructuraService.dashboard();
    }

    @PostMapping("/sistemas/{codigo}/subsanar")
    public SistemaInfraDTO subsanar(@PathVariable String codigo, @RequestBody SubsanacionRequestDTO request) {
        return infraestructuraService.subsanar(codigo, request);
    }

    @PostMapping("/sistemas/{codigo}/reenviar")
    public SistemaInfraDTO reenviar(@PathVariable String codigo) {
        return infraestructuraService.reenviar(codigo);
    }
}

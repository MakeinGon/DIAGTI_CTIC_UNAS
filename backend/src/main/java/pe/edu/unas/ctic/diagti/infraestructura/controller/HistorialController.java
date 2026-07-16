package pe.edu.unas.ctic.diagti.infraestructura.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.infraestructura.dto.HistorialDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.HistorialService;

import java.time.LocalDate;
import java.util.List;

/**
 * Alimenta la pantalla historial.html (filtros por texto, sistema, acción,
 * estado y rango de fechas).
 */
@RestController
@RequestMapping("/api/infraestructura/historial")
@RequiredArgsConstructor
public class HistorialController {

    private final HistorialService historialService;

    @GetMapping
    public List<HistorialDTO> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sistema,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return historialService.listar(q, sistema, accion, estado, desde, hasta);
    }
}

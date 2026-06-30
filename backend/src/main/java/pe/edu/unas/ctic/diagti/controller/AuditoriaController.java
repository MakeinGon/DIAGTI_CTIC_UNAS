package pe.edu.unas.ctic.diagti.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unas.ctic.diagti.dto.AuditoriaCatalogosDto;
import pe.edu.unas.ctic.diagti.dto.AuditoriaLogDto;
import pe.edu.unas.ctic.diagti.service.AuditoriaService;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public Page<AuditoriaLogDto> listarBitacora(
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String busqueda,
            @PageableDefault(size = 20) Pageable pageable) {
        return auditoriaService.obtenerBitacora(modulo, accion, busqueda, pageable);
    }

    @GetMapping("/catalogos")
    public AuditoriaCatalogosDto obtenerCatalogos() {
        return auditoriaService.obtenerCatalogos();
    }
}

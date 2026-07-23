package pe.edu.unas.ctic.diagti.auditor.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorAuditoriaService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditor")
@RequiredArgsConstructor
public class AuditorAuditoriaController {

    private final AuditorAuditoriaService auditoriaService;

    @GetMapping("/auditoria")
    public ResponseEntity<List<AuditorAuditoriaResponseDTO>> getAuditoria(
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String usuario,
            @RequestParam(required = false) Long sistemaId,
            @RequestParam(required = false) String ipOrigen,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {
        AuditorAuditoriaRequestDTO request = new AuditorAuditoriaRequestDTO();
        request.setSearchText(searchText);
        request.setModulo(modulo);
        request.setAccion(accion);
        request.setUsuario(usuario);
        request.setSistemaId(sistemaId);
        request.setIpOrigen(ipOrigen);
        request.setFechaDesde(fechaDesde);
        request.setFechaHasta(fechaHasta);
        return ResponseEntity.ok(auditoriaService.getAuditoria(request));
    }

    @PostMapping("/auditoria")
    public ResponseEntity<List<AuditorAuditoriaResponseDTO>> getAuditoriaPost(
            @RequestBody(required = false) AuditorAuditoriaRequestDTO request) {
        return ResponseEntity.ok(auditoriaService.getAuditoria(request));
    }

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Long>> getKPIs() {
        return ResponseEntity.ok(auditoriaService.getKPIs());
    }

    @GetMapping("/auditoria/kpis")
    public ResponseEntity<Map<String, Long>> getKPIsAlias() {
        return ResponseEntity.ok(auditoriaService.getKPIs());
    }
}

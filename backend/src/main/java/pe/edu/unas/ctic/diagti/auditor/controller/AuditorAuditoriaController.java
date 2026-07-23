package pe.edu.unas.ctic.diagti.auditor.controller;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorAuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auditor")
@CrossOrigin(origins = "*")
public class AuditorAuditoriaController {

    @Autowired
    private AuditorAuditoriaService auditoriaService;

    @PostMapping("/auditoria")
    public ResponseEntity<List<AuditorAuditoriaResponseDTO>> getAuditoria(
            @RequestBody(required = false) AuditorAuditoriaRequestDTO request) {
        
        if (request == null) {
            request = new AuditorAuditoriaRequestDTO();
        }
        
        List<AuditorAuditoriaResponseDTO> resultado = auditoriaService.getAuditoria(request);
        System.out.println("📊 Auditoría: " + resultado.size() + " registros encontrados");
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Long>> getKPIs() {
        Map<String, Long> kpis = auditoriaService.getKPIs();
        System.out.println("📊 KPIs: " + kpis);
        return ResponseEntity.ok(kpis);
    }

    @PostMapping("/registrar")
    public ResponseEntity<Void> registrarEvento(
            @RequestParam(required = false) Long idUsuario,
            @RequestParam String modulo,
            @RequestParam String accion,
            @RequestParam String descripcion,
            HttpServletRequest request) {

        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        
        auditoriaService.registrarEvento(idUsuario, modulo, accion, descripcion, ip, userAgent);
        System.out.println("📝 Evento registrado: " + modulo + " - " + accion);
        return ResponseEntity.ok().build();
    }
}
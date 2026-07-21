package pe.edu.unas.ctic.diagti.auditor.controller;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.service.AuditoriaService;
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
    private AuditoriaService auditoriaService;
    
    @PostMapping("/auditoria")
    public ResponseEntity<List<AuditoriaResponseDTO>> getAuditoria(
            @RequestBody AuditoriaRequestDTO request) {
        
        List<AuditoriaResponseDTO> resultado = auditoriaService.getAuditoria(request);
        return ResponseEntity.ok(resultado);
    }
    
    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Long>> getKPIs() {
        Map<String, Long> kpis = auditoriaService.getKPIs();
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
        auditoriaService.registrarEvento(idUsuario, modulo, accion, descripcion, ip);
        
        return ResponseEntity.ok().build();
    }
}
package pe.edu.unas.ctic.diagti.auditor.service;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;

import java.util.List;
import java.util.Map;

public interface AuditorAuditoriaService {
    List<AuditorAuditoriaResponseDTO> getAuditoria(AuditorAuditoriaRequestDTO request);
    Map<String, Long> getKPIs();
    void registrarEvento(Long idUsuario, String modulo, String accion, String descripcion, String ip, String userAgent);
}
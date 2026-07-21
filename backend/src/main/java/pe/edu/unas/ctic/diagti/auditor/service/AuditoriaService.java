package pe.edu.unas.ctic.diagti.auditor.service;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditoriaResponseDTO;

import java.util.List;
import java.util.Map;

public interface AuditoriaService {
    List<AuditoriaResponseDTO> getAuditoria(AuditoriaRequestDTO request);
    Map<String, Long> getKPIs();
    void registrarEvento(Long idUsuario, String modulo, String accion, String descripcion, String ip);
}
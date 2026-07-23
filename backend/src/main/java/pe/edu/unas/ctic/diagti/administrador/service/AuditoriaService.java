package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaStatsDTO;
import java.util.List;

public interface AuditoriaService {
    List<AuditoriaDTO> listarAuditoria(String usuario, String modulo, String fechaDesde, String fechaHasta);
    AuditoriaDTO obtenerPorId(Long id);
    AuditoriaStatsDTO obtenerStats();
}
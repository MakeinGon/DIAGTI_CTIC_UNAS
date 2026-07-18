package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaStatsDTO;
import java.util.List;

public interface EvidenciaService {
    List<EvidenciaDTO> listarEvidencias(String busqueda, String modulo, String responsable, String estado);
    EvidenciaDTO obtenerPorId(Long id);
    EvidenciaStatsDTO obtenerStats();
}
package pe.edu.unas.ctic.diagti.desarrollador.service;

import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasFilterDTO;

import java.util.List;

public interface MisSistemasService {
    
    List<MisSistemasDTO> listarMisSistemas(MisSistemasFilterDTO filtros);
    
    MisSistemasDTO obtenerSistema(Long id);
    
    MisSistemasDTO.EstadisticasDTO obtenerEstadisticas();
}
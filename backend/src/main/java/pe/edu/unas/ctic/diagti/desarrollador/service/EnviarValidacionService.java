package pe.edu.unas.ctic.diagti.desarrollador.service;

import pe.edu.unas.ctic.diagti.desarrollador.dto.EnviarValidacionRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EnviarValidacionResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaValidacionDTO;

import java.util.List;

public interface EnviarValidacionService {
    
    List<SistemaValidacionDTO> obtenerSistemasPendientes();
    
    EnviarValidacionResponseDTO solicitarValidacion(EnviarValidacionRequestDTO request);
    
    SistemaValidacionDTO verificarCompletitud(Long id);
}
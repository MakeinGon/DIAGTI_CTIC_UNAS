package pe.edu.unas.ctic.diagti.desarrollador.service;

import pe.edu.unas.ctic.diagti.desarrollador.dto.HistorialSistemaDTO;

public interface HistorialSistemaService {
    
    HistorialSistemaDTO obtenerHistorial(Long id);
    
    HistorialSistemaDTO.ResumenSistemaDTO obtenerResumen(Long id);
}
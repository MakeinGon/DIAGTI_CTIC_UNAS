package pe.edu.unas.ctic.diagti.desarrollador.service;

import pe.edu.unas.ctic.diagti.desarrollador.dto.DashboardDesarrolloDTO;

import java.util.List;

public interface DashboardDesarrolloService {
    
    DashboardDesarrolloDTO obtenerDashboard(String usuario);
    
    DashboardDesarrolloDTO.EstadisticasDTO obtenerEstadisticas(String usuario);
    
    List<DashboardDesarrolloDTO.ActividadDTO> obtenerActividadReciente(String usuario, int limite);
    
    List<DashboardDesarrolloDTO.RiesgoCriticoDTO> obtenerRiesgosCriticos(String usuario);
}
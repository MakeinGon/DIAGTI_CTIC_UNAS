package pe.edu.unas.ctic.diagti.director.service;

import pe.edu.unas.ctic.diagti.director.dto.*;

import java.util.List;

public interface DashboardService {
    DashboardKpiDTO obtenerKpis();
    List<ResumenValidacionDTO> obtenerResumenValidacion();
    List<CriticidadDTO> obtenerCriticidades();
    List<SistemaResumenDTO> obtenerSistemasFiltrados(String area, String criticidad, String validacion, String busqueda);
}
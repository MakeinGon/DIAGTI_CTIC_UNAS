package pe.edu.unas.ctic.diagti.director.service;

import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteRiesgoDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import java.util.List;

public interface ReportesService {
    List<ReporteInventarioDTO> obtenerInventario(String area, String criticidad);
    List<ReporteValidacionDTO> obtenerValidacion(String area, String estado);
    List<ReporteRiesgoDTO> obtenerRiesgos(String area, String criticidad);
}
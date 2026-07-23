package pe.edu.unas.ctic.diagti.auditor.service;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditorReporteResumenDTO;

import java.util.List;
import java.util.Map;

public interface AuditorReportesService {
    AuditorReporteResumenDTO obtenerResumen();

    List<Map<String, Object>> obtenerDatos(String tipo);
}

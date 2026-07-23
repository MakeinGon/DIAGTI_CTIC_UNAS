package pe.edu.unas.ctic.diagti.auditor.service;

import pe.edu.unas.ctic.diagti.auditor.dto.AuditorObservacionDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaInventarioDTO;

import java.util.List;
import java.util.Map;

public interface AuditorInventarioService {
    List<AuditorSistemaInventarioDTO> listar(String nombre, String codigo, String area, String estado, String criticidad);

    AuditorSistemaDetalleDTO obtenerDetalle(Long sistemaId);

    Map<String, Long> obtenerKpis();

    List<AuditorObservacionDTO> listarObservaciones(Long sistemaId, String origen);
}

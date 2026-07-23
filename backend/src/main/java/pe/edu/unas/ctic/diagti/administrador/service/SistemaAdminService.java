package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.SistemaListDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaDetalleDTO;
import java.util.List;

public interface SistemaAdminService {
    List<SistemaListDTO> listarSistemas(String busqueda, String area, String responsable, String estado, String criticidad, String tipo, String fechaDesde, String fechaHasta);
    SistemaDetalleDTO obtenerPorId(Long id);
    Long contarSistemas();
    Long contarActivos();
}
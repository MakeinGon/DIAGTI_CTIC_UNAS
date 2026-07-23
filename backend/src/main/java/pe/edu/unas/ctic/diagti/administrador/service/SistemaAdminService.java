package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.SistemaAdminUpdateDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaListDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaResponsablesRequestDTO;

import java.util.List;

public interface SistemaAdminService {
    List<SistemaListDTO> listarSistemas(String busqueda, String area, String responsable,
                                        String estado, String criticidad, String tipo,
                                        String fechaDesde, String fechaHasta);
    SistemaDetalleDTO obtenerPorId(Long id);
    SistemaDetalleDTO actualizarAdministrativo(Long id, SistemaAdminUpdateDTO dto);
    SistemaDetalleDTO asignarResponsables(Long id, SistemaResponsablesRequestDTO dto);
    Long contarSistemas();
    Long contarActivos();
}

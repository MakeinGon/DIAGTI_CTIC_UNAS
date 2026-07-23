package pe.edu.unas.ctic.diagti.director.service;

import pe.edu.unas.ctic.diagti.director.dto.SistemaDetalleDirectorDTO;
import pe.edu.unas.ctic.diagti.director.dto.SistemaInventarioDTO;

import java.util.List;

public interface DirectorInventarioService {
    List<SistemaInventarioDTO> listar(String area, String criticidad, String estado, String busqueda);
    SistemaDetalleDirectorDTO obtenerDetalle(Long sistemaId);
}

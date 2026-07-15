package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.RolDTO;
import java.util.List;

public interface RolService {
    List<RolDTO> listar();
    RolDTO crear(RolDTO dto);
    RolDTO actualizar(Long id, RolDTO dto);
    void eliminar(Long id);
    RolDTO obtenerPorId(Long id);
}
package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.PermisoDTO;
import java.util.List;

public interface PermisoService {
    List<PermisoDTO> obtenerPorRol(Long rolId);
    void actualizarPermisos(Long rolId, List<PermisoDTO> permisos);
}
package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import java.util.List;

public interface UsuarioService {
    List<UsuarioDTO> listar(String search, Long rolId, Boolean estado, String origen);
    UsuarioDTO obtenerPorDni(String dni);
    UsuarioDTO crear(UsuarioDTO dto, Long rolId);
    UsuarioDTO actualizar(String dni, UsuarioDTO dto, Long rolId);
    UsuarioDTO cambiarEstado(String dni, boolean estado);
    /** Soft-delete: desactiva el usuario (no elimina físicamente). */
    UsuarioDTO desactivar(String dni);
    UsuarioDTO asignarRol(String dni, Long rolId);
    UsuarioDTO retirarRol(String dni, Long rolId);
}

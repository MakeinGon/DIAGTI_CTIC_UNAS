package pe.edu.unas.ctic.diagti.administrador.service;

import pe.edu.unas.ctic.diagti.administrador.dto.CatalogoDTO;
import java.util.List;

public interface CatalogoService {
    /** Todos los registros de la tabla oficial {@code catalogos}. */
    List<CatalogoDTO> listarTodos();
    List<CatalogoDTO> listarPorTipo(String tipo);
    CatalogoDTO crear(String tipo, CatalogoDTO dto);
    CatalogoDTO actualizar(String tipo, String codigo, CatalogoDTO dto);
    void eliminar(String tipo, String codigo);
}
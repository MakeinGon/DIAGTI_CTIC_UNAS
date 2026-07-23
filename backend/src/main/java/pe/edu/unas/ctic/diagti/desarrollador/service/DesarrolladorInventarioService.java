package pe.edu.unas.ctic.diagti.desarrollador.service;

import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;

import java.util.List;
import java.util.Map;

public interface DesarrolladorInventarioService {

    List<SistemaFrontendDTO> listarSistemasDelDesarrollador(String username, Map<String, String> filtros);

    SistemaFrontendDTO obtenerSistemaDelDesarrollador(String username, Long idSistema);

    SistemaFrontendDTO enviarAValidacion(String username, Long idSistema);

    SistemaFrontendDTO marcarObservacionesAtendidas(String username, Long idSistema, String respuesta);

    Map<String, Long> contarObservaciones(String username);

    RegistrarSistemaOficialResponseDTO registrarSistemaOficial(String username, RegistrarSistemaOficialRequestDTO request);
}

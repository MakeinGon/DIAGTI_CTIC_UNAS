package pe.edu.unas.ctic.diagti.infraestructura.service;

import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraDashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvaluacionDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvaluacionRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraHistorialDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaListDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;

import java.util.List;
import java.util.Map;

public interface InfraestructuraModuloService {

    InfraDashboardDTO getDashboard();

    List<InfraSistemaListDTO> listarSistemas(Map<String, String> filtros);

    InfraSistemaDetalleDTO obtenerDetalle(Long sistemaId);

    InfraEvaluacionDTO guardarEvaluacion(Long sistemaId, InfraEvaluacionRequestDTO request);

    List<ObservacionValidacionDTO> listarObservaciones(Long sistemaId, String estado);

    ObservacionValidacionDTO registrarObservacion(Long sistemaId, ObservacionRequestDTO request);

    ObservacionValidacionDTO aprobarSubsanacion(Long idObservacion, String username);

    ObservacionValidacionDTO rechazarSubsanacion(Long idObservacion, String username, String comentario);

    List<InfraHistorialDTO> listarHistorial(Map<String, String> filtros);
}

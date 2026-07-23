package pe.edu.unas.ctic.diagti.validador.service;

import pe.edu.unas.ctic.diagti.validador.dto.DecisionValidacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.SistemaValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ValidadorDTO;
import pe.edu.unas.ctic.diagti.validador.entity.Validacion;

import java.util.List;
import java.util.Map;

public interface ValidadorService {

    List<ValidadorDTO> getPendientes();

    List<ValidadorDTO> getEnSubsanacion();

    List<ValidadorDTO> getValidados();

    Map<String, Long> getEstadisticas();

    SistemaValidacionDTO getDetalleSistema(Long idSistema);

    ValidadorDTO validarSistema(DecisionValidacionRequestDTO request);

    ValidadorDTO observarSistema(DecisionValidacionRequestDTO request);

    ValidadorDTO rechazarSistema(DecisionValidacionRequestDTO request);

    ObservacionValidacionDTO registrarObservacion(ObservacionRequestDTO request);

    List<ObservacionValidacionDTO> listarObservacionesPorSistema(Long idSistema, String estado);

    ObservacionValidacionDTO aprobarSubsanacion(Long idObservacion, String username);

    ObservacionValidacionDTO rechazarSubsanacion(Long idObservacion, String username, String comentario);

    /** @deprecated Prefer getDetalleSistema */
    @Deprecated
    Validacion getValidacionBySistema(Long idSistema);

    /** Compatibilidad legacy con entidad en body */
    @Deprecated
    ValidadorDTO validarSistema(Validacion validacion);

    @Deprecated
    ValidadorDTO observarSistema(Validacion validacion);

    @Deprecated
    ValidadorDTO rechazarSistema(Validacion validacion);
}

package pe.edu.unas.ctic.diagti.validador.service;

import pe.edu.unas.ctic.diagti.validador.dto.ValidadorDTO;
import pe.edu.unas.ctic.diagti.validador.entity.Validacion;

import java.util.List;
import java.util.Map;

public interface ValidadorService {
    List<ValidadorDTO> getPendientes();
    List<ValidadorDTO> getEnSubsanacion();
    List<ValidadorDTO> getValidados();
    ValidadorDTO validarSistema(Validacion validacion);
    ValidadorDTO observarSistema(Validacion validacion);
    ValidadorDTO rechazarSistema(Validacion validacion);
    Map<String, Long> getEstadisticas();
    Validacion getValidacionBySistema(Long idSistema);
}
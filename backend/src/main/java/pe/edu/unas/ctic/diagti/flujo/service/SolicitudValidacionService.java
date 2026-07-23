package pe.edu.unas.ctic.diagti.flujo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import pe.edu.unas.ctic.diagti.flujo.dto.SolicitudValidacionRequest;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface SolicitudValidacionService {
    SolicitudValidacion crear(SolicitudValidacionRequest request) throws JsonProcessingException;
    List<SolicitudValidacion> pendientes();
    List<SolicitudValidacion> porOrigen(String areaOrigen);
    Optional<SolicitudValidacion> estadoActual(String areaOrigen, String codigoSistema);
    List<SolicitudValidacion> historial(String areaOrigen, String codigoSistema);
    Optional<SolicitudValidacion> detalle(Long id);
    Optional<SolicitudValidacion> cambiarEstado(Long id, Map<String, Object> body);
}

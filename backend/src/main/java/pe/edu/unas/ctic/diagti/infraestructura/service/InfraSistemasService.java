package pe.edu.unas.ctic.diagti.infraestructura.service;

import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDTO;
import java.util.List;
import java.util.Map;

public interface InfraSistemasService {
    List<InfraSistemaDTO> listar(String usuario);
    InfraSistemaDTO obtener(String codigo);
    Map<String, Long> estadisticas(String usuario);
}

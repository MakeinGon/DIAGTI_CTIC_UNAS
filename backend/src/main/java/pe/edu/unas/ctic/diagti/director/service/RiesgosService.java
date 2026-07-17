package pe.edu.unas.ctic.diagti.director.service;

import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import java.util.List;

public interface RiesgosService {
    List<RiesgoDTO> obtenerRiesgos(String area, String nivel, String estado);
}
package pe.edu.unas.ctic.diagti.infraestructura.service;

import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraHistorialDTO;
import java.util.List;

public interface InfraHistorialService {
    List<InfraHistorialDTO> listar(String codigoSistema);
}

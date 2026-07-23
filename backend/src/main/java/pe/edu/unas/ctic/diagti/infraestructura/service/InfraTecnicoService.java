package pe.edu.unas.ctic.diagti.infraestructura.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraTecnicoRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraTecnicoResponseDTO;

public interface InfraTecnicoService {
    InfraTecnicoResponseDTO guardarBorrador(InfraTecnicoRequestDTO request) throws JsonProcessingException;
    InfraTecnicoResponseDTO guardarCorreccion(InfraTecnicoRequestDTO request) throws JsonProcessingException;
    InfraTecnicoResponseDTO enviar(InfraTecnicoRequestDTO request) throws JsonProcessingException;
}

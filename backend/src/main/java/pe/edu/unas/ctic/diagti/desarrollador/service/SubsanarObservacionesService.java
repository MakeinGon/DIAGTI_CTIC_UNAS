package pe.edu.unas.ctic.diagti.desarrollador.service;

import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SubsanarObservacionesRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SubsanarObservacionesResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaObservadoDTO;

import java.util.List;

public interface SubsanarObservacionesService {
    
    List<SistemaObservadoDTO> obtenerSistemasObservados();
    
    SubsanarObservacionesResponseDTO obtenerDetalleSubsanacion(Long id);
    
    SubsanarObservacionesResponseDTO guardarSubsanacion(Long id, SubsanarObservacionesRequestDTO request);
    
    SubsanarObservacionesResponseDTO subirEvidenciaSubsanacion(Long id, String tipo, MultipartFile archivo);
    
    SubsanarObservacionesResponseDTO reenviarValidacion(Long id);
}
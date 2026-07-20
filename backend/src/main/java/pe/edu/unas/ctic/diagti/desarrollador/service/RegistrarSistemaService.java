package pe.edu.unas.ctic.diagti.desarrollador.service;

import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.controller.RegistrarSistemaController;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaResponseDTO;

public interface RegistrarSistemaService {
    
    RegistrarSistemaResponseDTO registrarSistema(RegistrarSistemaRequestDTO request);
    
    Boolean validarCodigo(String codigo);
    
    RegistrarSistemaResponseDTO subirEvidencia(Long id, String tipo, MultipartFile archivo);
    
    RegistrarSistemaResponseDTO agregarUrl(Long id, String url, String descripcion);
    
    RegistrarSistemaResponseDTO agregarIntegracion(Long id, RegistrarSistemaController.IntegracionRequest request);
}

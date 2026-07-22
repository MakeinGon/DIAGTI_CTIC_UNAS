
package pe.edu.unas.ctic.diagti.desarrollador.service;

import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EditarSistemaRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EditarSistemaResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaCompletoDTO;
import pe.edu.unas.ctic.diagti.desarrollador.controller.EditarSistemaController;

public interface EditarSistemaService {
    
    SistemaCompletoDTO obtenerDatosEdicion(Long id);
    
    EditarSistemaResponseDTO editarSistema(Long id, EditarSistemaRequestDTO request);
    
    EditarSistemaResponseDTO subirEvidencia(Long id, String tipo, MultipartFile archivo);
    
    void eliminarEvidencia(Long sistemaId, Long evidenciaId);
    
    EditarSistemaResponseDTO agregarUrl(Long id, String url, String descripcion);
    
    void eliminarUrl(Long sistemaId, Long urlId);
    
    EditarSistemaResponseDTO agregarIntegracion(Long id, EditarSistemaController.IntegracionRequest request);
    
    void eliminarIntegracion(Long sistemaId, Long integracionId);
    
    EditarSistemaResponseDTO enviarAValidacion(Long id);
}
package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasFilterDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.desarrollador.service.MisSistemasService;

import java.util.List;
import java.util.stream.Collectors;

@Service  // ✅ IMPORTANTE: Debe tener @Service
@RequiredArgsConstructor
public class MisSistemasServiceImpl implements MisSistemasService {
    
    private final SistemaRepository sistemaRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<MisSistemasDTO> listarMisSistemas(MisSistemasFilterDTO filtros) {
        String usuarioActual = obtenerUsuarioActual();
        
        List<SistemaEntity> sistemas = sistemaRepository
                .findByResponsableTecnicoAndEliminadoFalse(usuarioActual);
        
        // Aplicar filtros
        return sistemas.stream()
                .filter(s -> aplicarFiltros(s, filtros))
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public MisSistemasDTO obtenerSistema(Long id) {
        // Implementar...
        return null;
    }
    
    @Override
    @Transactional(readOnly = true)
    public MisSistemasDTO.EstadisticasDTO obtenerEstadisticas() {
        // Implementar...
        return null;
    }
    
    // ============================================================
    // MÉTODOS PRIVADOS
    // ============================================================
    
    private boolean aplicarFiltros(SistemaEntity sistema, MisSistemasFilterDTO filtros) {
        // Implementar filtros...
        return true;
    }
    
    private MisSistemasDTO convertirADTO(SistemaEntity sistema) {
        MisSistemasDTO dto = new MisSistemasDTO();
        dto.setId(sistema.getId());
        dto.setCodigo(sistema.getCodigo());
        dto.setNombre(sistema.getNombre());
        dto.setEstado(sistema.getEstado());
        dto.setTipoAplicativo(sistema.getTipoAplicativo());
        dto.setAreaUsuaria(sistema.getAreaUsuaria());
        dto.setNivelRiesgo(sistema.getNivelRiesgo());
        return dto;
    }
    
    private String obtenerUsuarioActual() {
        return "desarrollador1";
    }
}
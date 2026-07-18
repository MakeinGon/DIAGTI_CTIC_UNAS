package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaStatsDTO;
import pe.edu.unas.ctic.diagti.administrador.repository.EvidenciaRepository;
import pe.edu.unas.ctic.diagti.administrador.service.EvidenciaService;
import pe.edu.unas.ctic.diagti.director.entity.EvidenciaEntity;  // ← Import del director
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.SistemaRepository;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenciaServiceImpl implements EvidenciaService {

    private final EvidenciaRepository evidenciaRepository;
    private final SistemaRepository sistemaRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public List<EvidenciaDTO> listarEvidencias(String busqueda, String modulo, String responsable, String estado) {
        List<EvidenciaEntity> evidencias = evidenciaRepository.findAll();
        
        if (evidencias.isEmpty()) {
            return new ArrayList<>();
        }
        
        return evidencias.stream()
                .filter(e -> {
                    if (busqueda != null && !busqueda.isEmpty()) {
                        SistemaEntity sistema = sistemaRepository.findById(e.getIdSistema()).orElse(null);
                        String sistemaNombre = sistema != null ? sistema.getNombre() : "";
                        if (!sistemaNombre.toLowerCase().contains(busqueda.toLowerCase())) {
                            return false;
                        }
                    }
                    if (estado != null && !estado.isEmpty()) {
                        String estadoEvidencia = e.getEstadoEvidencia() != null ? e.getEstadoEvidencia() : "";
                        if (!estadoEvidencia.equalsIgnoreCase(estado)) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EvidenciaDTO obtenerPorId(Long id) {
        if (id == null) {
            return null;
        }
        return evidenciaRepository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public EvidenciaStatsDTO obtenerStats() {
        EvidenciaStatsDTO stats = new EvidenciaStatsDTO();
        stats.setTotal(evidenciaRepository.countTotal());
        
        List<Object[]> counts = evidenciaRepository.countByEstado();
        Long activa = 0L;
        Long inactiva = 0L;
        for (Object[] count : counts) {
            if (count.length >= 2) {
                String estado = (String) count[0];
                Long cantidad = (Long) count[1];
                if ("ACTIVA".equalsIgnoreCase(estado)) {
                    activa = cantidad;
                } else {
                    inactiva = cantidad;
                }
            }
        }
        stats.setActiva(activa);
        stats.setInactiva(inactiva);
        return stats;
    }

    private EvidenciaDTO toDTO(EvidenciaEntity entity) {
        EvidenciaDTO dto = new EvidenciaDTO();
        dto.setId(entity.getIdEvidencia());
        SistemaEntity sistema = sistemaRepository.findById(entity.getIdSistema()).orElse(null);
        dto.setSistema(sistema != null ? sistema.getNombre() : "Sistema eliminado");
        dto.setTipo(entity.getTipoEvidencia() != null ? entity.getTipoEvidencia() : "N/A");
        dto.setEstado(entity.getEstadoEvidencia() != null ? entity.getEstadoEvidencia() : "N/A");
        dto.setFecha(entity.getFechaCarga() != null ? entity.getFechaCarga().format(DATE_FORMAT) : "");
        dto.setArchivo(entity.getNombreArchivo() != null ? entity.getNombreArchivo() : 
                      (entity.getUrlEvidencia() != null ? entity.getUrlEvidencia() : "Sin archivo"));
        dto.setDescripcion(entity.getDescripcion() != null ? entity.getDescripcion() : "");
        return dto;
    }
}
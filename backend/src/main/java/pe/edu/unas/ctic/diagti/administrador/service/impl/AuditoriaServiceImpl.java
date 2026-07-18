package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaStatsDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.service.AuditoriaService;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public List<AuditoriaDTO> listarAuditoria(String usuario, String modulo, String fechaDesde, String fechaHasta) {
        List<AuditoriaEntity> registros = auditoriaRepository.findTop100ByOrderByFechaEventoDesc();
        
        return registros.stream()
                .filter(r -> {
                    if (usuario != null && !usuario.isEmpty()) {
                        String nombreUsuario = "Sistema";
                        if (r.getIdUsuario() != null) {
                            nombreUsuario = "Usuario-" + r.getIdUsuario();
                        }
                        if (!nombreUsuario.toLowerCase().contains(usuario.toLowerCase())) return false;
                    }
                    if (modulo != null && !modulo.isEmpty() && !r.getModulo().equals(modulo)) return false;
                    return true;
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AuditoriaDTO obtenerPorId(Long id) {
        return auditoriaRepository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public AuditoriaStatsDTO obtenerStats() {
        AuditoriaStatsDTO stats = new AuditoriaStatsDTO();
        stats.setTotalRegistros(auditoriaRepository.countTotal());
        stats.setModulosActivos(auditoriaRepository.countModulos());
        stats.setUsuariosActivos(auditoriaRepository.countUsuariosActivos());
        stats.setUltimaActualizacion(java.time.LocalDateTime.now().format(DATE_FORMAT));
        return stats;
    }

    private AuditoriaDTO toDTO(AuditoriaEntity entity) {
        AuditoriaDTO dto = new AuditoriaDTO();
        dto.setId(entity.getIdAuditoria());
        String nombreUsuario = "Sistema";
        if (entity.getIdUsuario() != null) {
            nombreUsuario = "Usuario-" + entity.getIdUsuario();
        }
        dto.setUsuario(nombreUsuario);
        dto.setModulo(entity.getModulo());
        dto.setAccion(entity.getAccion());
        dto.setDescripcion(entity.getDescripcion());
        dto.setFecha(entity.getFechaEvento() != null ? entity.getFechaEvento().format(DATE_FORMAT) : "");
        return dto;
    }
}
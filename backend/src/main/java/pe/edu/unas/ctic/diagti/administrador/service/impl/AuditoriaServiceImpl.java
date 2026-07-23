package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaStatsDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.AuditoriaService;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Transactional(readOnly = true)
    public List<AuditoriaDTO> listarAuditoria(String usuario, String modulo, String fechaDesde, String fechaHasta) {
        List<AuditoriaEntity> registros = auditoriaRepository.findTop100ByOrderByFechaEventoDesc();
        LocalDate desde = parseFecha(fechaDesde);
        LocalDate hasta = parseFecha(fechaHasta);

        return registros.stream()
                .filter(r -> {
                    if (usuario != null && !usuario.isEmpty()) {
                        String nombreUsuario = obtenerNombreUsuario(r.getIdUsuario());
                        if (!nombreUsuario.toLowerCase().contains(usuario.toLowerCase())) return false;
                    }
                    if (modulo != null && !modulo.isEmpty()
                            && (r.getModulo() == null || !r.getModulo().equalsIgnoreCase(modulo))) {
                        return false;
                    }
                    if (desde != null || hasta != null) {
                        if (r.getFechaEvento() == null) return false;
                        LocalDate fecha = r.getFechaEvento().toLocalDate();
                        if (desde != null && fecha.isBefore(desde)) return false;
                        if (hasta != null && fecha.isAfter(hasta)) return false;
                    }
                    return true;
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AuditoriaDTO obtenerPorId(Long id) {
        return auditoriaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de auditoría no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public AuditoriaStatsDTO obtenerStats() {
        AuditoriaStatsDTO stats = new AuditoriaStatsDTO();
        stats.setTotalRegistros(auditoriaRepository.countTotal());
        stats.setModulosActivos(auditoriaRepository.countModulos());
        stats.setUsuariosActivos(auditoriaRepository.countUsuariosActivos());
        stats.setUltimaActualizacion(java.time.LocalDateTime.now().format(DATE_FORMAT));
        return stats;
    }

    private LocalDate parseFecha(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return LocalDate.parse(valor);
        } catch (Exception e) {
            return null;
        }
    }

    private String obtenerNombreUsuario(Long idUsuario) {
        if (idUsuario == null) return "Sistema";
        return usuarioRepository.findById(idUsuario)
                .map(u -> ((u.getNombres() != null ? u.getNombres() : "") + " "
                        + (u.getApellidos() != null ? u.getApellidos() : "")).trim())
                .orElse("Usuario-" + idUsuario);
    }

    private AuditoriaDTO toDTO(AuditoriaEntity entity) {
        AuditoriaDTO dto = new AuditoriaDTO();
        dto.setId(entity.getIdAuditoria());
        dto.setUsuario(obtenerNombreUsuario(entity.getIdUsuario()));
        dto.setModulo(entity.getModulo());
        dto.setAccion(entity.getAccion());
        dto.setDescripcion(entity.getDescripcion());
        dto.setFecha(entity.getFechaEvento() != null ? entity.getFechaEvento().format(DATE_FORMAT) : "");
        return dto;
    }
}

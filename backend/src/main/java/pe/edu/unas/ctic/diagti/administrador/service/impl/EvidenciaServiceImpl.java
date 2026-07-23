package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaStatsDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AdministradorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.EvidenciaService;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;
import pe.edu.unas.ctic.diagti.director.entity.EvidenciaEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenciaServiceImpl implements EvidenciaService {

    private final AdministradorEvidenciaRepository evidenciaRepository;
    private final DirectorSistemaRepository sistemaRepository;
    private final CatalogoRepository catalogoRepository;
    private final UsuarioRepository usuarioRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional(readOnly = true)
    public List<EvidenciaDTO> listarEvidencias(String busqueda, String modulo, String responsable, String estado) {
        List<EvidenciaEntity> evidencias = evidenciaRepository.findAll();
        if (evidencias.isEmpty()) {
            return new ArrayList<>();
        }

        return evidencias.stream()
                .map(this::toDTO)
                .filter(dto -> {
                    if (busqueda != null && !busqueda.isEmpty()) {
                        String q = busqueda.toLowerCase();
                        boolean match = (dto.getSistema() != null && dto.getSistema().toLowerCase().contains(q))
                                || (dto.getModulo() != null && dto.getModulo().toLowerCase().contains(q))
                                || (dto.getResponsable() != null && dto.getResponsable().toLowerCase().contains(q))
                                || (dto.getTipo() != null && dto.getTipo().toLowerCase().contains(q))
                                || (dto.getArchivo() != null && dto.getArchivo().toLowerCase().contains(q));
                        if (!match) return false;
                    }
                    if (modulo != null && !modulo.isEmpty()
                            && (dto.getModulo() == null || !dto.getModulo().equalsIgnoreCase(modulo))) {
                        return false;
                    }
                    if (responsable != null && !responsable.isEmpty()
                            && (dto.getResponsable() == null || !dto.getResponsable().equalsIgnoreCase(responsable))) {
                        return false;
                    }
                    if (estado != null && !estado.isEmpty()
                            && (dto.getEstado() == null || !dto.getEstado().equalsIgnoreCase(estado))) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EvidenciaDTO obtenerPorId(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Evidencia no encontrada");
        }
        return evidenciaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Evidencia no encontrada"));
    }

    @Override
    @Transactional(readOnly = true)
    public EvidenciaStatsDTO obtenerStats() {
        EvidenciaStatsDTO stats = new EvidenciaStatsDTO();
        stats.setTotal(evidenciaRepository.countTotal());

        List<Object[]> counts = evidenciaRepository.countByEstado();
        Long activa = 0L;
        Long inactiva = 0L;
        Long pendiente = 0L;

        for (Object[] count : counts) {
            if (count.length >= 2) {
                String estadoVal = (String) count[0];
                Long cantidad = (Long) count[1];
                if ("ACTIVA".equalsIgnoreCase(estadoVal)) {
                    activa = cantidad;
                } else if ("INACTIVA".equalsIgnoreCase(estadoVal)) {
                    inactiva = cantidad;
                } else if ("PENDIENTE".equalsIgnoreCase(estadoVal)) {
                    pendiente = cantidad;
                }
            }
        }

        stats.setActiva(activa);
        stats.setInactiva(inactiva);
        stats.setPendiente(pendiente == 0 ? Math.max(0, stats.getTotal() - activa - inactiva) : pendiente);
        return stats;
    }

    private EvidenciaDTO toDTO(EvidenciaEntity entity) {
        EvidenciaDTO dto = new EvidenciaDTO();
        dto.setId(entity.getIdEvidencia());

        SistemaEntity sistema = sistemaRepository.findById(entity.getIdSistema()).orElse(null);
        dto.setSistema(sistema != null ? sistema.getNombre() : "Sistema no disponible");

        String modulo = "No definido";
        if (sistema != null && sistema.getIdAreaUsuario() != null) {
            CatalogoEntity area = catalogoRepository.findById(sistema.getIdAreaUsuario()).orElse(null);
            if (area != null) {
                modulo = area.getValor();
            }
        }
        dto.setModulo(modulo);

        String responsable = "Sin responsable";
        if (entity.getIdUsuarioCarga() != null) {
            UsuarioEntity usuario = usuarioRepository.findById(entity.getIdUsuarioCarga()).orElse(null);
            if (usuario != null) {
                responsable = ((usuario.getNombres() != null ? usuario.getNombres() : "") + " "
                        + (usuario.getApellidos() != null ? usuario.getApellidos() : "")).trim();
            }
        }
        dto.setResponsable(responsable);

        dto.setTipo(entity.getTipoEvidencia() != null ? entity.getTipoEvidencia() : "N/A");
        dto.setEstado(entity.getEstadoEvidencia() != null ? entity.getEstadoEvidencia() : "N/A");
        dto.setFecha(entity.getFechaCarga() != null ? entity.getFechaCarga().format(DATE_FORMAT) : "");
        dto.setArchivo(entity.getNombreArchivo() != null ? entity.getNombreArchivo()
                : (entity.getUrlEvidencia() != null ? entity.getUrlEvidencia() : "Sin archivo"));
        dto.setDescripcion(entity.getDescripcion() != null ? entity.getDescripcion() : "");
        return dto;
    }
}

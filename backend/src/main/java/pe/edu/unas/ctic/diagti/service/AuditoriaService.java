package pe.edu.unas.ctic.diagti.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.dto.AuditoriaCatalogosDto;
import pe.edu.unas.ctic.diagti.dto.AuditoriaLogDto;
import pe.edu.unas.ctic.diagti.entity.Auditoria;
import pe.edu.unas.ctic.diagti.entity.Usuario;
import pe.edu.unas.ctic.diagti.repository.AuditoriaRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;

    public Page<AuditoriaLogDto> obtenerBitacora(String modulo, String accion, String busqueda, Pageable pageable) {
        return auditoriaRepository
                .buscarConFiltros(modulo, accion, busqueda, pageable)
                .map(this::toDto);
    }

    public AuditoriaCatalogosDto obtenerCatalogos() {
        return new AuditoriaCatalogosDto(
                auditoriaRepository.findDistinctModulos(),
                auditoriaRepository.findDistinctAcciones());
    }

    private AuditoriaLogDto toDto(Auditoria auditoria) {
        Usuario usuario = auditoria.getUsuario();
        return new AuditoriaLogDto(
                auditoria.getIdAuditoria(),
                usuario != null ? usuario.getIdUsuario() : null,
                usuario != null ? usuario.getUsername() : "Sistema",
                auditoria.getModulo(),
                auditoria.getAccion(),
                auditoria.getDescripcion(),
                auditoria.getFechaEvento(),
                auditoria.getDireccionIp());
    }
}

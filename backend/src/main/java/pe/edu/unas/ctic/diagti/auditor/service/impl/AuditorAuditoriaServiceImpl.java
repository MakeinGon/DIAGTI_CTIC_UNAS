package pe.edu.unas.ctic.diagti.auditor.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.mapper.AuditorMapper;
import pe.edu.unas.ctic.diagti.auditor.repository.AuditorAuditoriaRepository;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorAuditoriaService;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditorAuditoriaServiceImpl implements AuditorAuditoriaService {

    private final AuditorAuditoriaRepository auditoriaRepository;
    private final LoginUsuarioRepository usuarioRepository;
    private final DirectorSistemaRepository sistemaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AuditorAuditoriaResponseDTO> getAuditoria(AuditorAuditoriaRequestDTO request) {
        if (request == null) {
            request = new AuditorAuditoriaRequestDTO();
        }

        LocalDateTime fechaDesde = request.getFechaDesde() == null
                ? null
                : request.getFechaDesde().atStartOfDay();
        LocalDateTime fechaHasta = request.getFechaHasta() == null
                ? null
                : request.getFechaHasta().atTime(LocalTime.MAX);

        String search = blankToNull(request.getSearchText());
        String modulo = blankToNull(request.getModulo());
        String accion = blankToNull(request.getAccion());
        String ip = blankToNull(request.getIpOrigen());
        String usuarioFiltro = blankToNull(request.getUsuario());

        Long sistemaIdFiltro = request.getSistemaId();
        String codigoSistema = null;
        if (sistemaIdFiltro != null) {
            codigoSistema = sistemaRepository.findActivoById(sistemaIdFiltro)
                    .map(SistemaEntity::getCodigoUnico)
                    .orElse("__NO_MATCH__");
        }

        Map<Long, Usuario> usuarios = usuarioRepository.findAll().stream()
                .collect(Collectors.toMap(Usuario::getIdUsuario, u -> u, (a, b) -> a));

        String finalCodigo = codigoSistema;
        Long finalSistemaId = sistemaIdFiltro;

        return auditoriaRepository.findAllOrderByFechaDesc().stream()
                .filter(a -> matchesText(search, a.getModulo(), a.getAccion(), a.getDescripcion(), a.getDireccionIp()))
                .filter(a -> modulo == null || modulo.equalsIgnoreCase(DirectorTexto.safe(a.getModulo())))
                .filter(a -> accion == null || accion.equalsIgnoreCase(DirectorTexto.safe(a.getAccion())))
                .filter(a -> ip == null || DirectorTexto.normalize(a.getDireccionIp()).contains(DirectorTexto.normalize(ip)))
                .filter(a -> fechaDesde == null || (a.getFechaEvento() != null && !a.getFechaEvento().isBefore(fechaDesde)))
                .filter(a -> fechaHasta == null || (a.getFechaEvento() != null && !a.getFechaEvento().isAfter(fechaHasta)))
                .map(a -> AuditorMapper.toResponseDTO(a, a.getIdUsuario() == null ? null : usuarios.get(a.getIdUsuario())))
                .filter(dto -> {
                    if (usuarioFiltro == null) {
                        return true;
                    }
                    return DirectorTexto.normalize(dto.getNombreUsuario()).contains(DirectorTexto.normalize(usuarioFiltro))
                            || DirectorTexto.normalize(dto.getCorreoUsuario()).contains(DirectorTexto.normalize(usuarioFiltro));
                })
                .filter(dto -> {
                    if (finalCodigo == null) {
                        return true;
                    }
                    String desc = DirectorTexto.safe(dto.getDescripcion());
                    return desc.contains(finalCodigo)
                            || desc.contains("sistema_id=" + finalSistemaId)
                            || desc.contains("id_sistema=" + finalSistemaId);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getKPIs() {
        Map<String, Long> kpis = new HashMap<>();
        kpis.put("total", auditoriaRepository.count());
        kpis.put("consultas", auditoriaRepository.countConsultas());
        kpis.put("intentosFallidos", auditoriaRepository.countIntentosFallidos());
        kpis.put("exportaciones", auditoriaRepository.countExportaciones());
        return kpis;
    }

    private static boolean matchesText(String search, String... fields) {
        if (search == null) {
            return true;
        }
        String q = DirectorTexto.normalize(search);
        for (String field : fields) {
            if (DirectorTexto.normalize(field).contains(q)) {
                return true;
            }
        }
        return false;
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

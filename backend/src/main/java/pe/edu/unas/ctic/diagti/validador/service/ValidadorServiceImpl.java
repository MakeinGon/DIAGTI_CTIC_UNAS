package pe.edu.unas.ctic.diagti.validador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.validador.dto.DecisionValidacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.SistemaValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ValidadorDTO;
import pe.edu.unas.ctic.diagti.validador.entity.Validacion;
import pe.edu.unas.ctic.diagti.validador.repository.ValidadorValidacionRepository;
import pe.edu.unas.ctic.diagti.validador.support.ValidacionEstados;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ValidadorServiceImpl implements ValidadorService {

    private final ValidadorValidacionRepository validacionRepository;
    private final DirectorSistemaRepository sistemaRepository;
    private final ObservacionRepository observacionRepository;
    private final LoginUsuarioRepository usuarioRepository;
    private final CatalogoRepository catalogoRepository;
    private final AuditoriaRepository auditoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ValidadorDTO> getPendientes() {
        return validacionRepository.findPendientes().stream().map(this::toListDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ValidadorDTO> getEnSubsanacion() {
        return validacionRepository.findEnSubsanacion().stream().map(this::toListDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ValidadorDTO> getValidados() {
        return validacionRepository.findValidados().stream().map(this::toListDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getEstadisticas() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pendientes", safeCount(ValidacionEstados.VAL_PENDIENTE)
                + safeCount(ValidacionEstados.VAL_SUBSANADO));
        stats.put("observados", safeCount(ValidacionEstados.VAL_OBSERVADO));
        stats.put("validados", safeCount(ValidacionEstados.VAL_VALIDADO));
        stats.put("rechazados", safeCount(ValidacionEstados.VAL_RECHAZADO));
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public SistemaValidacionDTO getDetalleSistema(Long idSistema) {
        SistemaEntity sistema = requireSistema(idSistema);
        Validacion validacion = obtenerActivaOUltima(idSistema);
        List<ObservacionEntity> obs = observacionRepository.findByIdSistema(idSistema);
        return toDetalleDto(sistema, validacion, obs);
    }

    @Override
    @Transactional
    public ValidadorDTO validarSistema(DecisionValidacionRequestDTO request) {
        Long idSistema = resolveSistemaId(request.getIdSistema(), request.getSistemaId());
        SistemaEntity sistema = requireSistema(idSistema);
        Validacion validacion = requireActiva(idSistema);

        long pendientes = observacionRepository.findByIdSistema(idSistema).stream()
                .filter(this::esObservacionAbierta)
                .count();
        if (pendientes > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede validar: existen observaciones pendientes o en revisión (" + pendientes + ")");
        }

        LocalDateTime ahora = LocalDateTime.now();
        validacion.setEstadoValidacion(ValidacionEstados.VAL_VALIDADO);
        validacion.setResultado("APROBADO");
        validacion.setObservacionGeneral(comentarioDe(request));
        validacion.setIdValidador(resolveUsuarioId(request.getIdValidador(), request.getUsername()));
        validacion.setFechaValidacion(ahora);
        validacion.setFechaActualizacion(ahora);
        validacionRepository.save(validacion);

        sistema.setEstadoFlujoSincronizado(ValidacionEstados.SISTEMA_VALIDADO);
        sistemaRepository.save(sistema);

        auditar(validacion.getIdValidador(), "Validación", "Sistema validado",
                "Sistema " + sistema.getCodigoUnico() + " marcado como VALIDADO.");
        return toListDto(validacion);
    }

    @Override
    @Transactional
    public ValidadorDTO observarSistema(DecisionValidacionRequestDTO request) {
        Long idSistema = resolveSistemaId(request.getIdSistema(), request.getSistemaId());
        SistemaEntity sistema = requireSistema(idSistema);
        Validacion validacion = requireActiva(idSistema);
        String comentario = comentarioDe(request);
        if (comentario == null || comentario.isBlank() || comentario.trim().length() < 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El comentario/observación es obligatorio (mínimo 5 caracteres)");
        }

        LocalDateTime ahora = LocalDateTime.now();
        validacion.setEstadoValidacion(ValidacionEstados.VAL_OBSERVADO);
        validacion.setResultado("OBSERVADO");
        validacion.setObservacionGeneral(comentario);
        validacion.setIdValidador(resolveUsuarioId(request.getIdValidador(), request.getUsername()));
        validacion.setFechaValidacion(ahora);
        validacion.setFechaActualizacion(ahora);
        validacionRepository.save(validacion);

        ObservacionEntity obs = new ObservacionEntity();
        obs.setIdSistema(idSistema);
        obs.setIdValidacion(validacion.getIdValidacion());
        obs.setDescripcion(ValidacionEstados.conPrefijoArea(ValidacionEstados.AREA_VALIDACION, "Observación", comentario));
        obs.setEstadoObservacion(ValidacionEstados.OBS_PENDIENTE);
        obs.setIdUsuarioObserva(validacion.getIdValidador());
        obs.setFechaObservacion(ahora);
        observacionRepository.save(obs);

        sistema.setEstadoFlujoSincronizado(ValidacionEstados.SISTEMA_OBSERVADO);
        sistemaRepository.save(sistema);

        auditar(validacion.getIdValidador(), "Validación", "Sistema observado",
                "Sistema " + sistema.getCodigoUnico() + " observado.");
        return toListDto(validacion);
    }

    @Override
    @Transactional
    public ValidadorDTO rechazarSistema(DecisionValidacionRequestDTO request) {
        Long idSistema = resolveSistemaId(request.getIdSistema(), request.getSistemaId());
        SistemaEntity sistema = requireSistema(idSistema);
        Validacion validacion = requireActiva(idSistema);

        LocalDateTime ahora = LocalDateTime.now();
        validacion.setEstadoValidacion(ValidacionEstados.VAL_RECHAZADO);
        validacion.setResultado("RECHAZADO");
        validacion.setObservacionGeneral(comentarioDe(request));
        validacion.setIdValidador(resolveUsuarioId(request.getIdValidador(), request.getUsername()));
        validacion.setFechaValidacion(ahora);
        validacion.setFechaActualizacion(ahora);
        validacionRepository.save(validacion);

        sistema.setEstadoFlujoSincronizado(ValidacionEstados.SISTEMA_RECHAZADO);
        sistemaRepository.save(sistema);

        auditar(validacion.getIdValidador(), "Validación", "Sistema rechazado",
                "Sistema " + sistema.getCodigoUnico() + " rechazado.");
        return toListDto(validacion);
    }

    @Override
    @Transactional
    public ObservacionValidacionDTO registrarObservacion(ObservacionRequestDTO request) {
        Long idSistema = resolveSistemaId(request.getIdSistema(), request.getSistemaId());
        SistemaEntity sistema = requireSistema(idSistema);
        Validacion validacion = requireActiva(idSistema);

        String detalle = request.getDescripcion() != null ? request.getDescripcion() : request.getDetalle();
        if ((detalle == null || detalle.isBlank()) && (request.getTitulo() == null || request.getTitulo().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La descripción de la observación es obligatoria");
        }

        LocalDateTime ahora = LocalDateTime.now();
        ObservacionEntity obs = new ObservacionEntity();
        obs.setIdSistema(idSistema);
        obs.setIdValidacion(request.getIdValidacion() != null ? request.getIdValidacion() : validacion.getIdValidacion());
        obs.setDescripcion(ValidacionEstados.conPrefijoArea(request.getArea(), request.getTitulo(), detalle));
        obs.setEstadoObservacion(ValidacionEstados.OBS_PENDIENTE);
        obs.setIdUsuarioObserva(resolveUsuarioId(request.getIdValidador(), request.getUsername()));
        obs.setFechaObservacion(ahora);
        observacionRepository.save(obs);

        validacion.setEstadoValidacion(ValidacionEstados.VAL_OBSERVADO);
        validacion.setResultado("OBSERVADO");
        validacion.setFechaActualizacion(ahora);
        validacionRepository.save(validacion);

        sistema.setEstadoFlujoSincronizado(ValidacionEstados.SISTEMA_OBSERVADO);
        sistemaRepository.save(sistema);

        auditar(obs.getIdUsuarioObserva(), "Validación", "Observación registrada",
                "Observación registrada para " + sistema.getCodigoUnico()
                        + " área " + ValidacionEstados.prefijoArea(request.getArea()));
        return toObsDto(obs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ObservacionValidacionDTO> listarObservacionesPorSistema(Long idSistema, String estado) {
        requireSistema(idSistema);
        return observacionRepository.findByIdSistema(idSistema).stream()
                .filter(o -> estado == null || estado.isBlank()
                        || ValidacionEstados.normalizar(estado).equals(ValidacionEstados.normalizar(o.getEstadoObservacion())))
                .map(this::toObsDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ObservacionValidacionDTO aprobarSubsanacion(Long idObservacion, String username) {
        ObservacionEntity obs = observacionRepository.findById(idObservacion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Observación no encontrada"));
        if (!ValidacionEstados.OBS_EN_REVISION.equalsIgnoreCase(obs.getEstadoObservacion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se pueden aprobar observaciones en estado EN_REVISION");
        }
        LocalDateTime ahora = LocalDateTime.now();
        obs.setEstadoObservacion(ValidacionEstados.OBS_ATENDIDA);
        obs.setFechaSubsanacion(ahora);
        observacionRepository.save(obs);

        Long idUsuario = resolveUsuarioId(null, username);
        auditar(idUsuario, "Validación", "Subsanación aprobada",
                "Observación " + idObservacion + " aprobada.");

        recalcularEstadoSiCorresponde(obs.getIdSistema(), idUsuario);
        return toObsDto(obs);
    }

    @Override
    @Transactional
    public ObservacionValidacionDTO rechazarSubsanacion(Long idObservacion, String username, String comentario) {
        ObservacionEntity obs = observacionRepository.findById(idObservacion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Observación no encontrada"));
        if (!ValidacionEstados.OBS_EN_REVISION.equalsIgnoreCase(obs.getEstadoObservacion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se pueden rechazar observaciones en estado EN_REVISION");
        }
        LocalDateTime ahora = LocalDateTime.now();
        String base = obs.getDescripcion() == null ? "" : obs.getDescripcion();
        if (comentario != null && !comentario.isBlank()) {
            obs.setDescripcion(base + " | Rechazo: " + comentario.trim());
        }
        obs.setEstadoObservacion(ValidacionEstados.OBS_PENDIENTE);
        obs.setRespuestaSubsanacion(null);
        obs.setFechaSubsanacion(null);
        observacionRepository.save(obs);

        SistemaEntity sistema = requireSistema(obs.getIdSistema());
        sistema.setEstadoFlujoSincronizado(ValidacionEstados.SISTEMA_OBSERVADO);
        sistemaRepository.save(sistema);

        Validacion validacion = requireActiva(obs.getIdSistema());
        validacion.setEstadoValidacion(ValidacionEstados.VAL_OBSERVADO);
        validacion.setFechaActualizacion(ahora);
        validacionRepository.save(validacion);

        Long idUsuario = resolveUsuarioId(null, username);
        auditar(idUsuario, "Validación", "Subsanación rechazada",
                "Observación " + idObservacion + " devuelta a PENDIENTE.");
        return toObsDto(obs);
    }

    @Override
    @Transactional(readOnly = true)
    public Validacion getValidacionBySistema(Long idSistema) {
        List<Validacion> list = validacionRepository.findBySistemaIdSistema(idSistema);
        if (list.isEmpty()) {
            return null;
        }
        Validacion v = list.get(0);
        sistemaRepository.findActivoById(idSistema).ifPresent(s -> v.setNombreSistema(s.getNombre()));
        return v;
    }

    @Override
    @Transactional
    public ValidadorDTO validarSistema(Validacion validacion) {
        DecisionValidacionRequestDTO req = new DecisionValidacionRequestDTO();
        req.setIdSistema(validacion.getIdSistema());
        req.setIdValidacion(validacion.getIdValidacion());
        req.setIdValidador(validacion.getIdValidador());
        req.setComentario(validacion.getObservacionGeneral());
        return validarSistema(req);
    }

    @Override
    @Transactional
    public ValidadorDTO observarSistema(Validacion validacion) {
        DecisionValidacionRequestDTO req = new DecisionValidacionRequestDTO();
        req.setIdSistema(validacion.getIdSistema());
        req.setIdValidacion(validacion.getIdValidacion());
        req.setIdValidador(validacion.getIdValidador());
        req.setComentario(validacion.getObservacionGeneral());
        return observarSistema(req);
    }

    @Override
    @Transactional
    public ValidadorDTO rechazarSistema(Validacion validacion) {
        DecisionValidacionRequestDTO req = new DecisionValidacionRequestDTO();
        req.setIdSistema(validacion.getIdSistema());
        req.setIdValidacion(validacion.getIdValidacion());
        req.setIdValidador(validacion.getIdValidador());
        req.setComentario(validacion.getObservacionGeneral());
        return rechazarSistema(req);
    }

    private void recalcularEstadoSiCorresponde(Long idSistema, Long idUsuario) {
        List<ObservacionEntity> obs = observacionRepository.findByIdSistema(idSistema);
        boolean hayAbiertas = obs.stream().anyMatch(this::esObservacionAbierta);
        if (hayAbiertas) {
            return;
        }
        // Todas cerradas: deja en SUBSANADO a la espera de decisión final explícita de validar
        SistemaEntity sistema = requireSistema(idSistema);
        if (!ValidacionEstados.SISTEMA_VALIDADO.equalsIgnoreCase(sistema.getEstadoFlujo())) {
            sistema.setEstadoFlujoSincronizado(ValidacionEstados.SISTEMA_SUBSANADO);
            sistemaRepository.save(sistema);
        }
        Validacion validacion = obtenerActivaOUltima(idSistema);
        if (validacion != null && !ValidacionEstados.VAL_VALIDADO.equalsIgnoreCase(validacion.getEstadoValidacion())) {
            validacion.setEstadoValidacion(ValidacionEstados.VAL_SUBSANADO);
            validacion.setFechaActualizacion(LocalDateTime.now());
            validacionRepository.save(validacion);
        }
        auditar(idUsuario, "Validación", "Observaciones cerradas",
                "Todas las observaciones del sistema " + idSistema + " fueron atendidas. Pendiente decisión final.");
    }

    private boolean esObservacionAbierta(ObservacionEntity o) {
        String e = o.getEstadoObservacion() == null ? ValidacionEstados.OBS_PENDIENTE : o.getEstadoObservacion();
        return ValidacionEstados.OBS_PENDIENTE.equalsIgnoreCase(e)
                || ValidacionEstados.OBS_EN_REVISION.equalsIgnoreCase(e)
                || ValidacionEstados.OBS_RECHAZADA.equalsIgnoreCase(e);
    }

    private SistemaEntity requireSistema(Long idSistema) {
        return sistemaRepository.findActivoById(idSistema)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sistema no encontrado"));
    }

    private Validacion requireActiva(Long idSistema) {
        List<Validacion> activas = validacionRepository.findActivasBySistema(idSistema);
        if (activas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No existe una validación activa (PENDIENTE/OBSERVADO/SUBSANADO) para el sistema");
        }
        return activas.get(0);
    }

    private Validacion obtenerActivaOUltima(Long idSistema) {
        List<Validacion> activas = validacionRepository.findActivasBySistema(idSistema);
        if (!activas.isEmpty()) {
            return activas.get(0);
        }
        List<Validacion> todas = validacionRepository.findBySistemaIdSistema(idSistema);
        return todas.isEmpty() ? null : todas.get(0);
    }

    private Long resolveSistemaId(Long idSistema, Long sistemaId) {
        Long id = idSistema != null ? idSistema : sistemaId;
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "idSistema es obligatorio");
        }
        return id;
    }

    private Long resolveUsuarioId(Long idUsuario, String username) {
        if (idUsuario != null) {
            return idUsuario;
        }
        if (username == null || username.isBlank()) {
            return null;
        }
        return usuarioRepository.findActiveUserWithRoles(username.trim())
                .map(Usuario::getIdUsuario)
                .orElse(null);
    }

    private String comentarioDe(DecisionValidacionRequestDTO request) {
        if (request.getComentario() != null && !request.getComentario().isBlank()) {
            return request.getComentario().trim();
        }
        return request.getObservacionGeneral();
    }

    private long safeCount(String estado) {
        Long c = validacionRepository.countByEstadoValidacion(estado);
        return c == null ? 0L : c;
    }

    private ValidadorDTO toListDto(Validacion validacion) {
        ValidadorDTO dto = new ValidadorDTO();
        dto.setIdValidacion(validacion.getIdValidacion());
        dto.setIdSistema(validacion.getIdSistema());
        dto.setIdValidador(validacion.getIdValidador());
        dto.setEstadoValidacion(validacion.getEstadoValidacion());
        dto.setResultado(validacion.getResultado());
        dto.setObservacionGeneral(validacion.getObservacionGeneral());
        dto.setFechaValidacion(validacion.getFechaValidacion());
        dto.setFechaSubsanacion(validacion.getFechaSubsanacion());
        dto.setFechaCreacion(validacion.getFechaCreacion());
        dto.setFechaActualizacion(validacion.getFechaActualizacion());
        dto.setFecha(validacion.getFechaCreacion() != null
                ? validacion.getFechaCreacion()
                : validacion.getFechaActualizacion());

        sistemaRepository.findActivoById(validacion.getIdSistema()).ifPresent(s -> {
            dto.setNombreSistema(s.getNombre());
            dto.setCodigo(s.getCodigoUnico());
            dto.setEstado(s.getEstadoFlujo());
            dto.setArea(catalogoValor(s.getIdAreaUsuario()));
            dto.setResponsableTecnico(nombreUsuario(s.getIdResponsableTecnico()));
        });
        if (validacion.getIdValidador() != null) {
            usuarioRepository.findById(validacion.getIdValidador()).ifPresent(u ->
                    dto.setNombreValidador((u.getNombres() + " " + u.getApellidos()).trim()));
        }
        return dto;
    }

    private SistemaValidacionDTO toDetalleDto(SistemaEntity sistema, Validacion validacion, List<ObservacionEntity> obs) {
        String area = catalogoValor(sistema.getIdAreaUsuario());
        String criticidad = catalogoValor(sistema.getIdCriticidad());
        String respTec = nombreUsuario(sistema.getIdResponsableTecnico());
        String respFun = nombreUsuario(sistema.getIdResponsableFuncional());
        int pendientes = (int) obs.stream().filter(this::esObservacionAbierta).count();

        return SistemaValidacionDTO.builder()
                .id(sistema.getIdSistema())
                .idSistema(sistema.getIdSistema())
                .idValidacion(validacion != null ? validacion.getIdValidacion() : null)
                .codigo(sistema.getCodigoUnico())
                .nombreSistema(sistema.getNombre())
                .nombre(sistema.getNombre())
                .area(area != null ? area : "")
                .responsableTecnico(respTec)
                .responsable(respTec)
                .responsableFuncional(respFun)
                .estado(sistema.getEstadoFlujo())
                .estadoValidacion(validacion != null ? validacion.getEstadoValidacion() : null)
                .criticidad(criticidad)
                .nivelRiesgo(sistema.getNivelRiesgo())
                .observacionGeneral(validacion != null ? validacion.getObservacionGeneral() : null)
                .nombreValidador(validacion != null && validacion.getIdValidador() != null
                        ? nombreUsuario(validacion.getIdValidador()) : null)
                .fechaCreacion(validacion != null ? validacion.getFechaCreacion() : sistema.getFechaCreacion())
                .fechaEnvio(validacion != null ? validacion.getFechaCreacion() : null)
                .fechaValidacion(validacion != null ? validacion.getFechaValidacion() : null)
                .descripcion(sistema.getDescripcion())
                .observacionesPendientes(pendientes)
                .observaciones(obs.stream().map(this::toObsDto).collect(Collectors.toList()))
                .build();
    }

    private ObservacionValidacionDTO toObsDto(ObservacionEntity obs) {
        String desc = obs.getDescripcion() == null ? "" : obs.getDescripcion();
        String area = ValidacionEstados.extraerArea(desc);
        String titulo = desc;
        int sep = desc.indexOf(" — ");
        if (desc.startsWith("[") && desc.contains("]")) {
            int end = desc.indexOf(']');
            titulo = end + 1 < desc.length() ? desc.substring(end + 1).trim() : desc;
            if (sep > 0) {
                titulo = desc.substring(end + 1, sep).replace("—", "").trim();
            }
        }
        return ObservacionValidacionDTO.builder()
                .id(obs.getIdObservacion())
                .idObservacion(obs.getIdObservacion())
                .idSistema(obs.getIdSistema())
                .idValidacion(obs.getIdValidacion())
                .area(area)
                .titulo(titulo)
                .descripcion(desc)
                .estado(obs.getEstadoObservacion())
                .estadoObservacion(obs.getEstadoObservacion())
                .respuestaSubsanacion(obs.getRespuestaSubsanacion())
                .idUsuarioObserva(obs.getIdUsuarioObserva())
                .idUsuarioSubsana(obs.getIdUsuarioSubsana())
                .fechaObservacion(obs.getFechaObservacion())
                .fechaCreacion(obs.getFechaObservacion())
                .fechaSubsanacion(obs.getFechaSubsanacion())
                .fechaAtencion(obs.getFechaSubsanacion())
                .build();
    }

    private String catalogoValor(Long id) {
        if (id == null) {
            return null;
        }
        return catalogoRepository.findById(id).map(CatalogoEntity::getValor).orElse(null);
    }

    private String nombreUsuario(Long id) {
        if (id == null) {
            return null;
        }
        return usuarioRepository.findById(id)
                .map(u -> (u.getNombres() + " " + u.getApellidos()).trim())
                .orElse(null);
    }

    private void auditar(Long idUsuario, String modulo, String accion, String descripcion) {
        try {
            AuditoriaEntity a = new AuditoriaEntity();
            a.setIdUsuario(idUsuario);
            a.setModulo(modulo);
            a.setAccion(accion);
            a.setDescripcion(descripcion);
            auditoriaRepository.save(a);
        } catch (Exception ignored) {
            // No debe revertir la operación principal
        }
    }
}

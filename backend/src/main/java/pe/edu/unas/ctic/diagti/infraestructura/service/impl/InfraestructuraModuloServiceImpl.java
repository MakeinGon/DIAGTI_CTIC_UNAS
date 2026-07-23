package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import pe.edu.unas.ctic.diagti.desarrollador.support.EstadoFlujoNormalizer;
import pe.edu.unas.ctic.diagti.director.entity.ArquitecturaEntity;
import pe.edu.unas.ctic.diagti.director.entity.EvidenciaEntity;
import pe.edu.unas.ctic.diagti.director.entity.InfraestructuraEntity;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorArquitecturaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorInfraestructuraRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorIntegracionRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraDashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvaluacionDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvaluacionRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvidenciaDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraHistorialDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaListDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraModuloService;
import pe.edu.unas.ctic.diagti.infraestructura.support.InfraEstadoUi;
import pe.edu.unas.ctic.diagti.infraestructura.support.InfraEvaluacionPayload;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.service.ValidadorService;
import pe.edu.unas.ctic.diagti.validador.support.ValidacionEstados;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InfraestructuraModuloServiceImpl implements InfraestructuraModuloService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final List<String> ESTADOS_UI = Arrays.asList(
            InfraEstadoUi.PENDIENTE_EVALUACION, "Borrador", "Enviado", "Observado", "Corregido", "Validado");
    private static final List<String> RIESGOS_UI = Arrays.asList("Bajo", "Medio", "Alto", "Crítico");

    private final DirectorSistemaRepository sistemaRepository;
    private final DirectorInfraestructuraRepository infraRepository;
    private final DirectorSeguridadRepository seguridadRepository;
    private final DirectorEvidenciaRepository evidenciaRepository;
    private final DirectorArquitecturaRepository arquitecturaRepository;
    private final DirectorIntegracionRepository integracionRepository;
    private final ObservacionRepository observacionRepository;
    private final ValidacionRepository validacionRepository;
    private final CatalogoRepository catalogoRepository;
    private final LoginUsuarioRepository usuarioRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final ValidadorService validadorService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public InfraDashboardDTO getDashboard() {
        List<SistemaEntity> sistemas = sistemasActivos();
        Map<Long, InfraestructuraEntity> infraMap = cargarInfraPorSistema(sistemas);
        Map<Long, List<ObservacionEntity>> obsMap = cargarObs(sistemas);

        List<InfraSistemaListDTO> listados = sistemas.stream()
                .map(s -> toListDto(s, infraMap.get(s.getIdSistema()), obsMap.getOrDefault(s.getIdSistema(), List.of())))
                .toList();

        int total = listados.size();
        int nuevos = (int) listados.stream()
                .filter(s -> InfraEstadoUi.PENDIENTE_EVALUACION.equals(s.getEstadoSistemaUi())
                        || "Nuevo".equals(s.getEstadoSistemaUi()))
                .count();
        int borradores = (int) listados.stream().filter(s -> "Borrador".equals(s.getEstadoSistemaUi())).count();
        int observados = (int) listados.stream().filter(s -> "Observado".equals(s.getEstadoSistemaUi())).count();
        int validados = (int) listados.stream().filter(s -> "Validado".equals(s.getEstadoSistemaUi())).count();

        InfraDashboardDTO.Estadisticas stats = new InfraDashboardDTO.Estadisticas(
                total, nuevos + borradores, nuevos, borradores, observados, validados);

        List<InfraDashboardDTO.Prioridad> prioridades = listados.stream()
                .filter(s -> List.of(InfraEstadoUi.PENDIENTE_EVALUACION, "Nuevo", "Borrador", "Observado", "Corregido")
                        .contains(s.getEstadoSistemaUi()))
                .sorted((a, b) -> Integer.compare(
                        prioridadRank(a.getEstadoSistemaUi()),
                        prioridadRank(b.getEstadoSistemaUi())))
                .limit(6)
                .map(this::toPrioridad)
                .collect(Collectors.toList());

        Map<String, Long> riesgoCount = listados.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getNivelRiesgo() == null ? "Medio" : s.getNivelRiesgo(),
                        Collectors.counting()));
        List<InfraDashboardDTO.Riesgo> riesgos = RIESGOS_UI.stream()
                .map(r -> new InfraDashboardDTO.Riesgo(r, riesgoCount.getOrDefault(r, 0L).intValue(), r.toLowerCase(Locale.ROOT)))
                .toList();

        Map<String, Long> estadoCount = listados.stream()
                .collect(Collectors.groupingBy(InfraSistemaListDTO::getEstadoSistemaUi, Collectors.counting()));
        List<InfraDashboardDTO.Estado> estados = ESTADOS_UI.stream()
                .map(e -> new InfraDashboardDTO.Estado(e, estadoCount.getOrDefault(e, 0L).intValue()))
                .toList();

        return new InfraDashboardDTO(stats, prioridades, riesgos, estados);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InfraSistemaListDTO> listarSistemas(Map<String, String> filtros) {
        List<SistemaEntity> sistemas = sistemasActivos();
        Map<Long, InfraestructuraEntity> infraMap = cargarInfraPorSistema(sistemas);
        Map<Long, List<ObservacionEntity>> obsMap = cargarObs(sistemas);

        String q = filtros == null ? null : filtros.get("q");
        String estado = filtros == null ? null : filtros.get("estado");
        String riesgo = filtros == null ? null : filtros.get("riesgo");
        String pendientes = filtros == null ? null : filtros.get("pendientesEvaluacion");

        return sistemas.stream()
                .map(s -> toListDto(s, infraMap.get(s.getIdSistema()), obsMap.getOrDefault(s.getIdSistema(), List.of())))
                .filter(dto -> aplicaFiltros(dto, q, estado, riesgo, pendientes))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InfraSistemaDetalleDTO obtenerDetalle(Long sistemaId) {
        SistemaEntity sistema = requireSistema(sistemaId);
        InfraestructuraEntity infra = primeraInfra(sistemaId);
        List<ObservacionEntity> obs = observacionRepository.findByIdSistema(sistemaId);
        List<ValidacionEntity> vals = validacionRepository.findByIdSistema(sistemaId);
        ValidacionEntity activa = vals.stream().findFirst().orElse(null);

        InfraEvaluacionPayload payload = parsePayload(infra);
        InfraEvaluacionDTO evaluacion = toEvaluacionDto(infra, payload, sistemaId);

        Map<String, Object> arquitectura = new HashMap<>();
        List<ArquitecturaEntity> arcs = arquitecturaRepository.findByIdSistema(sistemaId);
        if (!arcs.isEmpty()) {
            ArquitecturaEntity a = arcs.get(0);
            arquitectura.put("tipoArquitectura", a.getTipoArquitectura());
            arquitectura.put("patronArquitectonico", a.getPatronArquitectonico());
            arquitectura.put("descripcionTecnica", a.getDescripcionTecnica());
            arquitectura.put("observaciones", a.getObservaciones());
        }

        Map<String, Object> seguridad = new HashMap<>();
        List<SeguridadEntity> segs = seguridadRepository.findByIdSistema(sistemaId);
        if (!segs.isEmpty()) {
            SeguridadEntity s = segs.get(0);
            seguridad.put("tipoControl", s.getTipoControl());
            seguridad.put("mecanismoAutenticacion", s.getMecanismoAutenticacion());
        }
        if (payload != null) {
            seguridad.put("ssl", payload.getSsl());
            seguridad.put("mfa", payload.getMfa());
            seguridad.put("logs", payload.getLogs());
            seguridad.put("cifrado", payload.getCifrado());
            seguridad.put("restriccionIp", payload.getRestriccionIp());
            seguridad.put("sesiones", payload.getSesiones());
            if (payload.getAutenticacion() != null) {
                seguridad.putIfAbsent("mecanismoAutenticacion", payload.getAutenticacion());
            }
        }

        List<Map<String, Object>> integraciones = integracionRepository.findByIdSistemaOrigen(sistemaId).stream()
                .map(i -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("idIntegracion", i.getIdIntegracion());
                    m.put("idSistemaDestino", i.getIdSistemaDestino());
                    m.put("protocolo", i.getProtocolo());
                    m.put("metodoIntercambio", i.getMetodoIntercambio());
                    m.put("frecuencia", i.getFrecuencia());
                    m.put("estado", i.getEstado());
                    return m;
                })
                .collect(Collectors.toList());

        List<InfraEvidenciaDTO> evidencias = evidenciaRepository.findByIdSistema(sistemaId).stream()
                .map(this::toEvidenciaDto)
                .collect(Collectors.toList());

        List<ObservacionValidacionDTO> observaciones = obs.stream()
                .map(this::toObsDto)
                .collect(Collectors.toList());

        return InfraSistemaDetalleDTO.builder()
                .sistemaId(sistema.getIdSistema())
                .codigo(sistema.getCodigoUnico())
                .nombre(sistema.getNombre())
                .descripcion(sistema.getDescripcion() == null ? "" : sistema.getDescripcion())
                .area(catalogoNombre(sistema.getIdAreaUsuario()))
                .criticidad(catalogoNombre(sistema.getIdCriticidad()))
                .estadoSistema(ValidacionEstados.normalizar(sistema.getEstadoFlujo()))
                .estadoSistemaUi(InfraEstadoUi.fromSistemaYEval(
                        sistema.getEstadoFlujo(), infra != null,
                        payload != null ? payload.getEstadoRegistro() : null))
                .nivelRiesgo(InfraEstadoUi.riesgoUi(sistema.getNivelRiesgo()))
                .responsableTecnico(nombreUsuario(sistema.getIdResponsableTecnico()))
                .responsableFuncional(nombreUsuario(sistema.getIdResponsableFuncional()))
                .estadoValidacion(activa != null ? activa.getEstadoValidacion() : "")
                .resultadoValidacion(activa != null ? activa.getResultado() : "")
                .idValidacion(activa != null ? activa.getIdValidacion() : null)
                .fechaCreacion(format(sistema.getFechaCreacion()))
                .fechaActualizacion(format(sistema.getFechaActualizacion()))
                .evaluacion(evaluacion)
                .arquitectura(arquitectura)
                .seguridad(seguridad)
                .integraciones(integraciones)
                .evidencias(evidencias)
                .observaciones(observaciones)
                .build();
    }

    @Override
    @Transactional
    public InfraEvaluacionDTO guardarEvaluacion(Long sistemaId, InfraEvaluacionRequestDTO request) {
        if (request == null || request.getDatos() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los datos de evaluación son obligatorios");
        }
        SistemaEntity sistema = requireSistema(sistemaId);
        Usuario usuario = resolveUsuario(request.getUsername());

        String estadoRegistro = ValidacionEstados.normalizar(
                request.getEstadoRegistro() != null ? request.getEstadoRegistro() : "BORRADOR");
        if (!"BORRADOR".equals(estadoRegistro) && !"ENVIADO".equals(estadoRegistro)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "estadoRegistro debe ser BORRADOR o ENVIADO");
        }

        InfraEvaluacionPayload datos = request.getDatos();
        datos.setEstadoRegistro(estadoRegistro);
        if (request.getResultado() != null) {
            datos.setResultado(request.getResultado());
        }
        if (datos.getFechaEvaluacion() == null || datos.getFechaEvaluacion().isBlank()) {
            datos.setFechaEvaluacion(LocalDateTime.now().format(ISO));
        }

        InfraestructuraEntity infra = primeraInfra(sistemaId);
        if (infra == null) {
            infra = new InfraestructuraEntity();
            infra.setIdSistema(sistemaId);
            infra.setFechaCreacion(LocalDateTime.now());
        }
        infra.setCapacidadRecursos(serialize(datos));
        infraRepository.save(infra);

        upsertSeguridad(sistemaId, datos);
        reemplazarEvidencias(sistemaId, request.getEvidencias(), datos, usuario);

        if ("ENVIADO".equals(estadoRegistro)) {
            String actual = ValidacionEstados.normalizar(sistema.getEstadoFlujo());
            if (!"VALIDADO".equals(actual) && !"OBSERVADO".equals(actual) && !"SUBSANADO".equals(actual)) {
                sistema.setEstadoFlujoSincronizado(ValidacionEstados.SISTEMA_ENVIADO);
                sistema.setFechaActualizacion(LocalDateTime.now());
                sistemaRepository.save(sistema);
            }
            asegurarValidacionActiva(sistema);
        }

        auditar(usuario != null ? usuario.getIdUsuario() : null, "Evaluación",
                "Evaluación de infraestructura " + estadoRegistro.toLowerCase(Locale.ROOT)
                        + " para " + sistema.getCodigoUnico());

        return toEvaluacionDto(infra, datos, sistemaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ObservacionValidacionDTO> listarObservaciones(Long sistemaId, String estado) {
        requireSistema(sistemaId);
        return validadorService.listarObservacionesPorSistema(sistemaId, estado).stream()
                .filter(o -> {
                    String area = o.getArea() != null ? o.getArea() : ValidacionEstados.extraerArea(o.getDescripcion());
                    return ValidacionEstados.AREA_INFRAESTRUCTURA.equalsIgnoreCase(area)
                            || (o.getDescripcion() != null && o.getDescripcion().contains("[INFRAESTRUCTURA]"));
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ObservacionValidacionDTO registrarObservacion(Long sistemaId, ObservacionRequestDTO request) {
        requireSistema(sistemaId);
        if (request == null) {
            request = new ObservacionRequestDTO();
        }
        request.setIdSistema(sistemaId);
        request.setSistemaId(sistemaId);
        request.setArea(ValidacionEstados.AREA_INFRAESTRUCTURA);

        String desc = request.getDescripcion() != null ? request.getDescripcion() : request.getDetalle();
        if (desc != null && desc.trim().startsWith("[INFRAESTRUCTURA]")) {
            // Evita duplicar prefijo: ValidadorService también lo agrega vía area
            String sinPrefijo = desc.trim().substring("[INFRAESTRUCTURA]".length()).trim();
            request.setDescripcion(sinPrefijo);
            request.setDetalle(sinPrefijo);
        }
        return validadorService.registrarObservacion(request);
    }

    @Override
    @Transactional
    public ObservacionValidacionDTO aprobarSubsanacion(Long idObservacion, String username) {
        return validadorService.aprobarSubsanacion(idObservacion, username);
    }

    @Override
    @Transactional
    public ObservacionValidacionDTO rechazarSubsanacion(Long idObservacion, String username, String comentario) {
        return validadorService.rechazarSubsanacion(idObservacion, username, comentario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InfraHistorialDTO> listarHistorial(Map<String, String> filtros) {
        List<AuditoriaEntity> eventos = auditoriaRepository
                .findTop200ByModuloIgnoreCaseOrderByFechaEventoDesc("Infraestructura");
        if (eventos.isEmpty()) {
            eventos = auditoriaRepository.findTop100ByOrderByFechaEventoDesc().stream()
                    .filter(a -> a.getModulo() != null
                            && a.getModulo().toLowerCase(Locale.ROOT).contains("infra"))
                    .collect(Collectors.toList());
        }

        String q = filtros == null ? null : filtros.get("q");
        String accion = filtros == null ? null : filtros.get("accion");

        Map<Long, String> nombres = new HashMap<>();
        return eventos.stream()
                .filter(e -> q == null || q.isBlank()
                        || (e.getDescripcion() != null && e.getDescripcion().toLowerCase(Locale.ROOT).contains(q.toLowerCase(Locale.ROOT)))
                        || (e.getAccion() != null && e.getAccion().toLowerCase(Locale.ROOT).contains(q.toLowerCase(Locale.ROOT))))
                .filter(e -> accion == null || accion.isBlank()
                        || (e.getAccion() != null && e.getAccion().equalsIgnoreCase(accion)))
                .map(e -> {
                    String user = e.getIdUsuario() == null ? "Sistema"
                            : nombres.computeIfAbsent(e.getIdUsuario(), this::nombreUsuario);
                    return InfraHistorialDTO.builder()
                            .id(e.getIdAuditoria())
                            .date(format(e.getFechaEvento()))
                            .code("")
                            .name("")
                            .action(e.getAccion() == null ? "" : e.getAccion())
                            .detail(e.getDescripcion() == null ? "" : e.getDescripcion())
                            .user(user)
                            .state("")
                            .section(e.getModulo() == null ? "Infraestructura" : e.getModulo())
                            .before("")
                            .after("")
                            .sistemaId(null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ----------------- helpers -----------------

    private List<SistemaEntity> sistemasActivos() {
        return sistemaRepository.findAll().stream()
                .filter(s -> s.getFechaEliminacion() == null)
                .collect(Collectors.toList());
    }

    private SistemaEntity requireSistema(Long id) {
        return sistemaRepository.findActivoById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sistema no encontrado: " + id));
    }

    private Map<Long, InfraestructuraEntity> cargarInfraPorSistema(List<SistemaEntity> sistemas) {
        Map<Long, InfraestructuraEntity> map = new HashMap<>();
        for (SistemaEntity s : sistemas) {
            InfraestructuraEntity infra = primeraInfra(s.getIdSistema());
            if (infra != null) {
                map.put(s.getIdSistema(), infra);
            }
        }
        return map;
    }

    private InfraestructuraEntity primeraInfra(Long sistemaId) {
        List<InfraestructuraEntity> list = infraRepository.findByIdSistema(sistemaId);
        return list.isEmpty() ? null : list.get(0);
    }

    private Map<Long, List<ObservacionEntity>> cargarObs(List<SistemaEntity> sistemas) {
        List<Long> ids = sistemas.stream().map(SistemaEntity::getIdSistema).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return observacionRepository.findByIdSistemaIn(ids).stream()
                .collect(Collectors.groupingBy(ObservacionEntity::getIdSistema));
    }

    private InfraSistemaListDTO toListDto(SistemaEntity s, InfraestructuraEntity infra, List<ObservacionEntity> obs) {
        InfraEvaluacionPayload payload = parsePayload(infra);
        String estadoUi = InfraEstadoUi.fromSistemaYEval(
                s.getEstadoFlujo(), infra != null,
                payload != null ? payload.getEstadoRegistro() : null);
        ValidacionEntity val = validacionRepository.findByIdSistema(s.getIdSistema()).stream().findFirst().orElse(null);
        long pend = obs.stream()
                .filter(o -> {
                    String e = ValidacionEstados.normalizar(o.getEstadoObservacion());
                    return "PENDIENTE".equals(e) || "EN_REVISION".equals(e);
                })
                .count();

        return InfraSistemaListDTO.builder()
                .sistemaId(s.getIdSistema())
                .codigo(s.getCodigoUnico())
                .nombre(s.getNombre())
                .descripcion(s.getDescripcion() == null ? "" : s.getDescripcion())
                .area(catalogoNombre(s.getIdAreaUsuario()))
                .criticidad(catalogoNombre(s.getIdCriticidad()))
                .estadoSistema(ValidacionEstados.normalizar(s.getEstadoFlujo()))
                .estadoSistemaUi(estadoUi)
                .responsableTecnico(nombreUsuario(s.getIdResponsableTecnico()))
                .responsableFuncional(nombreUsuario(s.getIdResponsableFuncional()))
                .estadoValidacion(val != null ? val.getEstadoValidacion() : "")
                .estadoEvaluacionInfra(payload != null && payload.getEstadoRegistro() != null
                        ? payload.getEstadoRegistro()
                        : (infra == null ? "SIN_REGISTRO" : "REGISTRADO"))
                .plataforma(payload != null && payload.getPlataforma() != null && !payload.getPlataforma().isBlank()
                        ? payload.getPlataforma()
                        : (infra == null ? "Sin evaluar" : "Sin registrar"))
                .exposicion(payload != null && payload.getExposicion() != null && !payload.getExposicion().isBlank()
                        ? payload.getExposicion()
                        : (infra == null ? "Sin evaluar" : "Sin registrar"))
                .nivelRiesgo(InfraEstadoUi.riesgoUi(s.getNivelRiesgo()))
                .cantidadObservaciones(obs.size())
                .observacionesPendientes((int) pend)
                .fechaEnvio(format(s.getFechaActualizacion()))
                .fechaActualizacion(format(s.getFechaActualizacion()))
                .build();
    }

    private boolean aplicaFiltros(InfraSistemaListDTO dto, String q, String estado, String riesgo, String pendientes) {
        if (q != null && !q.isBlank()) {
            String qq = q.toLowerCase(Locale.ROOT);
            boolean ok = (dto.getCodigo() != null && dto.getCodigo().toLowerCase(Locale.ROOT).contains(qq))
                    || (dto.getNombre() != null && dto.getNombre().toLowerCase(Locale.ROOT).contains(qq));
            if (!ok) {
                return false;
            }
        }
        if (estado != null && !estado.isBlank()
                && !estado.equalsIgnoreCase(dto.getEstadoSistemaUi())
                && !EstadoFlujoNormalizer.matches(dto.getEstadoSistema(), estado)) {
            return false;
        }
        if (riesgo != null && !riesgo.isBlank()
                && !riesgo.equalsIgnoreCase(dto.getNivelRiesgo())) {
            return false;
        }
        if ("true".equalsIgnoreCase(pendientes)
                && !List.of(InfraEstadoUi.PENDIENTE_EVALUACION, "Nuevo", "Borrador")
                .contains(dto.getEstadoSistemaUi())) {
            return false;
        }
        return true;
    }

    private InfraDashboardDTO.Prioridad toPrioridad(InfraSistemaListDTO s) {
        String accion;
        String detalle;
        String url;
        switch (s.getEstadoSistemaUi()) {
            case InfraEstadoUi.PENDIENTE_EVALUACION, "Nuevo" -> {
                accion = "Registrar";
                detalle = "Aún no tiene registro técnico.";
                url = "infraestructura.html?sistemaId=" + s.getSistemaId();
            }
            case "Borrador" -> {
                accion = "Completar";
                detalle = "El registro está incompleto.";
                url = "infraestructura.html?sistemaId=" + s.getSistemaId();
            }
            case "Observado" -> {
                accion = "Subsanar";
                detalle = "Tiene observaciones pendientes.";
                url = "mis-sistemas.html?estado=Observado&sistemaId=" + s.getSistemaId();
            }
            case "Corregido" -> {
                accion = "Revisar";
                detalle = "Corrección lista para revisión.";
                url = "mis-sistemas.html?estado=Corregido&sistemaId=" + s.getSistemaId();
            }
            default -> {
                accion = "Ver";
                detalle = "Ver detalles del sistema.";
                url = "mis-sistemas.html?sistemaId=" + s.getSistemaId();
            }
        }
        return new InfraDashboardDTO.Prioridad(
                s.getCodigo(), s.getNombre(), s.getEstadoSistemaUi(), detalle, accion, url);
    }

    private int prioridadRank(String estadoUi) {
        return switch (estadoUi) {
            case "Observado" -> 0;
            case "Corregido" -> 1;
            case "Borrador" -> 2;
            case InfraEstadoUi.PENDIENTE_EVALUACION, "Nuevo" -> 3;
            default -> 9;
        };
    }

    private InfraEvaluacionDTO toEvaluacionDto(InfraestructuraEntity infra, InfraEvaluacionPayload payload, Long sistemaId) {
        if (infra == null) {
            return InfraEvaluacionDTO.builder()
                    .sistemaId(sistemaId)
                    .estadoRegistro("SIN_REGISTRO")
                    .resultado("")
                    .fechaEvaluacion("")
                    .fechaCreacion("")
                    .datos(new InfraEvaluacionPayload())
                    .evidencias(new ArrayList<>())
                    .build();
        }
        List<InfraEvidenciaDTO> evidencias = evidenciaRepository.findByIdSistema(sistemaId).stream()
                .map(this::toEvidenciaDto)
                .collect(Collectors.toList());
        return InfraEvaluacionDTO.builder()
                .idInfraestructura(infra.getIdInfraestructura())
                .sistemaId(sistemaId)
                .estadoRegistro(payload != null && payload.getEstadoRegistro() != null
                        ? payload.getEstadoRegistro() : "REGISTRADO")
                .resultado(payload != null && payload.getResultado() != null ? payload.getResultado() : "")
                .fechaEvaluacion(payload != null && payload.getFechaEvaluacion() != null
                        ? payload.getFechaEvaluacion() : format(infra.getFechaCreacion()))
                .fechaCreacion(format(infra.getFechaCreacion()))
                .datos(payload != null ? payload : new InfraEvaluacionPayload())
                .evidencias(evidencias)
                .build();
    }

    private InfraEvidenciaDTO toEvidenciaDto(EvidenciaEntity e) {
        return InfraEvidenciaDTO.builder()
                .idEvidencia(e.getIdEvidencia())
                .tipo(e.getTipoEvidencia())
                .nombre(e.getNombreArchivo() != null ? e.getNombreArchivo() : "")
                .archivo(e.getRutaArchivo() != null ? e.getRutaArchivo() : "")
                .url(e.getUrlEvidencia() != null ? e.getUrlEvidencia() : "")
                .descripcion(e.getDescripcion() != null ? e.getDescripcion() : "")
                .estado(e.getEstadoEvidencia() != null ? e.getEstadoEvidencia() : "ACTIVA")
                .fechaCarga(format(e.getFechaCarga()))
                .build();
    }

    private ObservacionValidacionDTO toObsDto(ObservacionEntity o) {
        return ObservacionValidacionDTO.builder()
                .id(o.getIdObservacion())
                .idObservacion(o.getIdObservacion())
                .idSistema(o.getIdSistema())
                .idValidacion(o.getIdValidacion())
                .area(ValidacionEstados.extraerArea(o.getDescripcion()))
                .descripcion(o.getDescripcion())
                .estado(o.getEstadoObservacion())
                .estadoObservacion(o.getEstadoObservacion())
                .respuestaSubsanacion(o.getRespuestaSubsanacion())
                .idUsuarioObserva(o.getIdUsuarioObserva())
                .idUsuarioSubsana(o.getIdUsuarioSubsana())
                .fechaObservacion(o.getFechaObservacion())
                .fechaCreacion(o.getFechaObservacion())
                .fechaSubsanacion(o.getFechaSubsanacion())
                .fechaAtencion(o.getFechaSubsanacion())
                .build();
    }

    private void upsertSeguridad(Long sistemaId, InfraEvaluacionPayload datos) {
        String tipo = firstNonBlank(datos.getSsl(), datos.getMfa(), "CONTROL_INFRA");
        String auth = firstNonBlank(datos.getAutenticacion(), "NO_ESPECIFICADO");
        List<SeguridadEntity> existing = seguridadRepository.findByIdSistema(sistemaId);
        SeguridadEntity seg = existing.isEmpty() ? new SeguridadEntity() : existing.get(0);
        seg.setIdSistema(sistemaId);
        seg.setTipoControl(truncate(tipo, 100));
        seg.setMecanismoAutenticacion(truncate(auth, 100));
        if (seg.getFechaCreacion() == null) {
            seg.setFechaCreacion(LocalDateTime.now());
        }
        seguridadRepository.save(seg);
    }

    private void reemplazarEvidencias(Long sistemaId, List<InfraEvidenciaDTO> evidencias,
                                      InfraEvaluacionPayload datos, Usuario usuario) {
        List<InfraEvidenciaDTO> items = new ArrayList<>();
        if (evidencias != null) {
            items.addAll(evidencias);
        } else if (datos.getEvidences() != null) {
            for (InfraEvaluacionPayload.EvidenciaItem e : datos.getEvidences()) {
                InfraEvidenciaDTO d = new InfraEvidenciaDTO();
                d.setTipo(e.getTipo());
                d.setNombre(e.getNombre());
                d.setArchivo(e.getArchivo());
                d.setUrl(e.getUrl());
                d.setDescripcion(e.getDescripcion());
                items.add(d);
            }
        }
        if (items.isEmpty()) {
            return;
        }
        List<EvidenciaEntity> actuales = evidenciaRepository.findByIdSistema(sistemaId);
        for (EvidenciaEntity e : actuales) {
            e.setEstadoEvidencia("INACTIVA");
            evidenciaRepository.save(e);
        }
        for (InfraEvidenciaDTO item : items) {
            if (item.getTipo() == null || item.getTipo().isBlank()) {
                continue;
            }
            EvidenciaEntity e = new EvidenciaEntity();
            e.setIdSistema(sistemaId);
            e.setTipoEvidencia(truncate(item.getTipo(), 100));
            e.setNombreArchivo(item.getNombre());
            e.setRutaArchivo(item.getArchivo());
            e.setUrlEvidencia(item.getUrl());
            e.setDescripcion(item.getDescripcion());
            e.setEstadoEvidencia("ACTIVA");
            e.setFechaCarga(LocalDateTime.now());
            e.setIdUsuarioCarga(usuario != null ? usuario.getIdUsuario() : null);
            evidenciaRepository.save(e);
        }
    }

    private void asegurarValidacionActiva(SistemaEntity sistema) {
        List<ValidacionEntity> existentes = validacionRepository.findByIdSistema(sistema.getIdSistema());
        boolean hayActiva = existentes.stream().anyMatch(v -> {
            String e = ValidacionEstados.normalizar(v.getEstadoValidacion());
            return "PENDIENTE".equals(e) || "OBSERVADO".equals(e) || "SUBSANADO".equals(e);
        });
        if (hayActiva) {
            return;
        }
        ValidacionEntity v = new ValidacionEntity();
        v.setIdSistema(sistema.getIdSistema());
        v.setEstadoValidacion(ValidacionEstados.VAL_PENDIENTE);
        v.setResultado("PENDIENTE");
        v.setObservacionGeneral("Registro técnico de infraestructura enviado a validación.");
        v.setFechaCreacion(LocalDateTime.now());
        v.setFechaActualizacion(LocalDateTime.now());
        validacionRepository.save(v);
    }

    private InfraEvaluacionPayload parsePayload(InfraestructuraEntity infra) {
        if (infra == null || infra.getCapacidadRecursos() == null || infra.getCapacidadRecursos().isBlank()) {
            return null;
        }
        String raw = infra.getCapacidadRecursos().trim();
        if (!raw.startsWith("{")) {
            InfraEvaluacionPayload p = new InfraEvaluacionPayload();
            p.setCapacidad(raw);
            p.setObservacionesInfra(raw);
            p.setEstadoRegistro("REGISTRADO");
            return p;
        }
        try {
            return objectMapper.readValue(raw, InfraEvaluacionPayload.class);
        } catch (JsonProcessingException e) {
            InfraEvaluacionPayload p = new InfraEvaluacionPayload();
            p.setObservacionesInfra(raw);
            p.setEstadoRegistro("REGISTRADO");
            return p;
        }
    }

    private String serialize(InfraEvaluacionPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo serializar la evaluación");
        }
    }

    private void auditar(Long idUsuario, String accion, String descripcion) {
        AuditoriaEntity a = new AuditoriaEntity();
        a.setIdUsuario(idUsuario);
        a.setModulo("Infraestructura");
        a.setAccion(accion);
        a.setDescripcion(descripcion);
        auditoriaRepository.save(a);
    }

    private Usuario resolveUsuario(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        return usuarioRepository.findActiveUserWithRoles(username).orElse(null);
    }

    private String nombreUsuario(Long id) {
        if (id == null) {
            return "";
        }
        Optional<Usuario> u = usuarioRepository.findById(id);
        return u.map(x -> (x.getNombres() + " " + x.getApellidos()).trim()).orElse("");
    }

    private String catalogoNombre(Long id) {
        if (id == null) {
            return "";
        }
        return catalogoRepository.findById(id).map(CatalogoEntity::getValor).orElse("");
    }

    private String format(LocalDateTime dt) {
        return dt == null ? "" : dt.format(ISO);
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v.trim();
            }
        }
        return "";
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}

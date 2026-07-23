package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

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
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;
import pe.edu.unas.ctic.diagti.desarrollador.support.DesarrolladorUsuarioResolver;
import pe.edu.unas.ctic.diagti.desarrollador.support.EstadoFlujoNormalizer;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DesarrolladorInventarioServiceImpl implements DesarrolladorInventarioService {

    private static final DateTimeFormatter FECHA_UI = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final DesarrolladorUsuarioResolver usuarioResolver;
    private final DirectorSistemaRepository sistemaRepository;
    private final ObservacionRepository observacionRepository;
    private final ValidacionRepository validacionRepository;
    private final CatalogoRepository catalogoRepository;
    private final LoginUsuarioRepository loginUsuarioRepository;
    private final AuditoriaRepository auditoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SistemaFrontendDTO> listarSistemasDelDesarrollador(String username, Map<String, String> filtros) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(username);
        List<SistemaEntity> sistemas = sistemaRepository.findActivosByResponsableTecnico(desarrollador.getIdUsuario());
        Map<Long, List<ObservacionEntity>> obsPorSistema = cargarObservaciones(sistemas);

        return sistemas.stream()
                .filter(s -> aplicaFiltros(s, filtros, obsPorSistema.getOrDefault(s.getIdSistema(), List.of())))
                .map(s -> toFrontend(s, desarrollador, obsPorSistema.getOrDefault(s.getIdSistema(), List.of())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SistemaFrontendDTO obtenerSistemaDelDesarrollador(String username, Long idSistema) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(username);
        SistemaEntity sistema = requireSistemaPropio(desarrollador.getIdUsuario(), idSistema);
        List<ObservacionEntity> observaciones = observacionRepository.findByIdSistema(sistema.getIdSistema());
        return toFrontend(sistema, desarrollador, observaciones);
    }

    @Override
    @Transactional
    public SistemaFrontendDTO enviarAValidacion(String username, Long idSistema) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(username);
        SistemaEntity sistema = requireSistemaPropio(desarrollador.getIdUsuario(), idSistema);

        String estadoActual = EstadoFlujoNormalizer.toBd(sistema.getEstadoFlujo());
        if ("VALIDADO".equals(estadoActual) || "ENVIADO".equals(estadoActual)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El sistema ya está en estado " + EstadoFlujoNormalizer.toUi(estadoActual));
        }

        List<ValidacionEntity> existentes = validacionRepository.findByIdSistema(sistema.getIdSistema());
        boolean hayActiva = existentes.stream().anyMatch(v -> {
            String e = v.getEstadoValidacion() == null ? "" : v.getEstadoValidacion().toUpperCase();
            return "PENDIENTE".equals(e) || "OBSERVADO".equals(e) || "SUBSANADO".equals(e);
        });
        if (hayActiva && !"SUBSANADO".equals(estadoActual) && !"OBSERVADO".equals(estadoActual) && !"BORRADOR".equals(estadoActual)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe una validación activa para este sistema");
        }

        sistema.setEstadoFlujo("ENVIADO");
        sistemaRepository.save(sistema);

        ValidacionEntity validacion = existentes.stream()
                .filter(v -> {
                    String e = v.getEstadoValidacion() == null ? "" : v.getEstadoValidacion().toUpperCase();
                    return "SUBSANADO".equals(e) || "OBSERVADO".equals(e) || "PENDIENTE".equals(e);
                })
                .findFirst()
                .orElseGet(ValidacionEntity::new);

        if (validacion.getIdValidacion() == null) {
            validacion.setIdSistema(sistema.getIdSistema());
            validacion.setFechaCreacion(LocalDateTime.now());
        }
        validacion.setEstadoValidacion("PENDIENTE");
        validacion.setResultado("PENDIENTE");
        validacion.setObservacionGeneral("Sistema enviado a validación por el área de desarrollo.");
        validacion.setFechaActualizacion(LocalDateTime.now());
        validacionRepository.save(validacion);

        registrarAuditoria(desarrollador.getIdUsuario(), "Desarrollo", "Enviar validación",
                "Sistema " + sistema.getCodigoUnico() + " enviado a validación.");

        List<ObservacionEntity> observaciones = observacionRepository.findByIdSistema(sistema.getIdSistema());
        return toFrontend(sistema, desarrollador, observaciones);
    }

    @Override
    @Transactional
    public SistemaFrontendDTO marcarObservacionesAtendidas(String username, Long idSistema, String respuesta) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(username);
        SistemaEntity sistema = requireSistemaPropio(desarrollador.getIdUsuario(), idSistema);

        List<ObservacionEntity> observaciones = observacionRepository.findByIdSistema(sistema.getIdSistema());
        LocalDateTime ahora = LocalDateTime.now();
        int respondidas = 0;
        for (ObservacionEntity obs : observaciones) {
            String estado = obs.getEstadoObservacion() == null ? "PENDIENTE" : obs.getEstadoObservacion();
            if ("PENDIENTE".equalsIgnoreCase(estado) || "RECHAZADA".equalsIgnoreCase(estado)) {
                // No cierra la observación: queda en revisión para Validación
                obs.setEstadoObservacion("EN_REVISION");
                obs.setRespuestaSubsanacion(respuesta != null && !respuesta.isBlank()
                        ? respuesta
                        : "Observación respondida por el desarrollador.");
                obs.setIdUsuarioSubsana(desarrollador.getIdUsuario());
                obs.setFechaSubsanacion(ahora);
                respondidas++;
            }
        }
        if (respondidas == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No hay observaciones pendientes para subsanar");
        }
        observacionRepository.saveAll(observaciones);

        sistema.setEstadoFlujo("SUBSANADO");
        sistemaRepository.save(sistema);

        List<ValidacionEntity> validaciones = validacionRepository.findByIdSistema(sistema.getIdSistema());
        for (ValidacionEntity v : validaciones) {
            if ("OBSERVADO".equalsIgnoreCase(v.getEstadoValidacion())
                    || "PENDIENTE".equalsIgnoreCase(v.getEstadoValidacion())) {
                v.setEstadoValidacion("SUBSANADO");
                v.setFechaSubsanacion(ahora);
                v.setFechaActualizacion(ahora);
            }
        }
        validacionRepository.saveAll(validaciones);

        registrarAuditoria(desarrollador.getIdUsuario(), "Desarrollo", "Subsanar observaciones",
                "Observaciones del sistema " + sistema.getCodigoUnico() + " enviadas a revisión (EN_REVISION).");

        return toFrontend(sistema, desarrollador, observacionRepository.findByIdSistema(sistema.getIdSistema()));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> contarObservaciones(String username) {
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(username);
        List<SistemaEntity> sistemas = sistemaRepository.findActivosByResponsableTecnico(desarrollador.getIdUsuario());
        List<Long> ids = sistemas.stream().map(SistemaEntity::getIdSistema).toList();

        Map<String, Long> conteo = new HashMap<>();
        if (ids.isEmpty()) {
            conteo.put("pendientes", 0L);
            conteo.put("atendidas", 0L);
            conteo.put("total", 0L);
            return conteo;
        }

        List<ObservacionEntity> todas = observacionRepository.findByIdSistemaIn(ids);
        long pendientes = todas.stream()
                .filter(o -> o.getEstadoObservacion() == null
                        || "PENDIENTE".equalsIgnoreCase(o.getEstadoObservacion())
                        || "OBSERVADO".equalsIgnoreCase(o.getEstadoObservacion()))
                .count();
        long atendidas = todas.stream()
                .filter(o -> o.getEstadoObservacion() != null
                        && ("ATENDIDA".equalsIgnoreCase(o.getEstadoObservacion())
                        || "SUBSANADA".equalsIgnoreCase(o.getEstadoObservacion())
                        || "CERRADA".equalsIgnoreCase(o.getEstadoObservacion())))
                .count();

        conteo.put("pendientes", pendientes);
        conteo.put("atendidas", atendidas);
        conteo.put("total", (long) todas.size());
        return conteo;
    }

    private SistemaEntity requireSistemaPropio(Long idResponsable, Long idSistema) {
        SistemaEntity sistema = sistemaRepository.findActivoById(idSistema)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sistema no encontrado"));

        if (!Objects.equals(sistema.getIdResponsableTecnico(), idResponsable)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado para consultar este sistema");
        }
        return sistema;
    }

    private Map<Long, List<ObservacionEntity>> cargarObservaciones(List<SistemaEntity> sistemas) {
        if (sistemas.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = sistemas.stream().map(SistemaEntity::getIdSistema).toList();
        return observacionRepository.findByIdSistemaIn(ids).stream()
                .collect(Collectors.groupingBy(ObservacionEntity::getIdSistema));
    }

    private boolean aplicaFiltros(SistemaEntity sistema, Map<String, String> filtros,
                                  List<ObservacionEntity> observaciones) {
        if (filtros == null || filtros.isEmpty()) {
            return true;
        }
        String estado = filtros.get("estado");
        if (estado != null && !estado.isBlank() && !EstadoFlujoNormalizer.matches(sistema.getEstadoFlujo(), estado)) {
            return false;
        }
        String busqueda = filtros.get("busqueda");
        if (busqueda != null && !busqueda.isBlank()) {
            String q = busqueda.toLowerCase(Locale.ROOT);
            boolean hit = (sistema.getNombre() != null && sistema.getNombre().toLowerCase(Locale.ROOT).contains(q))
                    || (sistema.getCodigoUnico() != null && sistema.getCodigoUnico().toLowerCase(Locale.ROOT).contains(q));
            if (!hit) {
                return false;
            }
        }
        String riesgo = filtros.get("riesgo");
        if (riesgo != null && !riesgo.isBlank()) {
            String actual = sistema.getNivelRiesgo() == null ? "" : sistema.getNivelRiesgo();
            if (!actual.equalsIgnoreCase(riesgo.trim())) {
                return false;
            }
        }
        String soloObservados = filtros.get("soloObservados");
        if ("true".equalsIgnoreCase(soloObservados)) {
            boolean tienePendientes = observaciones.stream().anyMatch(o ->
                    o.getEstadoObservacion() == null
                            || "PENDIENTE".equalsIgnoreCase(o.getEstadoObservacion()));
            if (!tienePendientes && !"OBSERVADO".equalsIgnoreCase(EstadoFlujoNormalizer.toBd(sistema.getEstadoFlujo()))) {
                return false;
            }
        }
        return true;
    }

    private SistemaFrontendDTO toFrontend(SistemaEntity sistema, Usuario desarrollador,
                                          List<ObservacionEntity> observaciones) {
        String tipo = catalogoValor(sistema.getIdTipoAplicativo());
        String area = catalogoValor(sistema.getIdAreaUsuario());
        String criticidad = catalogoValor(sistema.getIdCriticidad());

        String responsableFuncional = null;
        if (sistema.getIdResponsableFuncional() != null) {
            responsableFuncional = loginUsuarioRepository.findById(sistema.getIdResponsableFuncional())
                    .map(u -> (u.getNombres() + " " + u.getApellidos()).trim())
                    .orElse(null);
        }

        List<SistemaFrontendDTO.ObservacionFrontendDTO> obsUi = new ArrayList<>();
        for (ObservacionEntity obs : observaciones) {
            // El desarrollador solo ve observaciones aún no respondidas
            if (obs.getEstadoObservacion() != null
                    && !"PENDIENTE".equalsIgnoreCase(obs.getEstadoObservacion())
                    && !"RECHAZADA".equalsIgnoreCase(obs.getEstadoObservacion())) {
                continue;
            }
            obsUi.add(SistemaFrontendDTO.ObservacionFrontendDTO.builder()
                    .id(obs.getIdObservacion())
                    .campo("general")
                    .mensaje(obs.getDescripcion())
                    .estado(obs.getEstadoObservacion() != null ? obs.getEstadoObservacion() : "PENDIENTE")
                    .area("Validación")
                    .fechaCreacion(formatFecha(obs.getFechaObservacion()))
                    .fechaAtencion(formatFecha(obs.getFechaSubsanacion()))
                    .build());
        }

        String nombreResponsable = (desarrollador.getNombres() + " " + desarrollador.getApellidos()).trim();
        LocalDateTime fechaRef = sistema.getFechaActualizacion() != null
                ? sistema.getFechaActualizacion()
                : sistema.getFechaCreacion();

        return SistemaFrontendDTO.builder()
                .id(String.valueOf(sistema.getIdSistema()))
                .codigo(sistema.getCodigoUnico())
                .nombre(sistema.getNombre())
                .tipo(tipo != null ? tipo : "")
                .estado(EstadoFlujoNormalizer.toUi(sistema.getEstadoFlujo()))
                .criticidad(criticidad != null ? criticidad : "")
                .fecha(formatFecha(fechaRef))
                .area(area != null ? area : "")
                .responsableTecnico(nombreResponsable)
                .responsableFuncional(responsableFuncional)
                .descripcion(sistema.getDescripcion())
                .anioDesarrollo(sistema.getAnoAdquisicion() != null ? String.valueOf(sistema.getAnoAdquisicion()) : null)
                .adquisicion(sistema.getFormaAdquisicion())
                .empresa(sistema.getDesarrolladorNombre())
                .contrato(Boolean.TRUE.equals(sistema.getContratoVigente()) ? "Si" : "No")
                .fechaSoporte(sistema.getFechaVencimientoSoporte() != null
                        ? sistema.getFechaVencimientoSoporte().toString()
                        : null)
                .observaciones("")
                .arquitectura("")
                .motorBd("")
                .tieneIntegraciones(false)
                .riesgo(sistema.getNivelRiesgo())
                .evidencias(new ArrayList<>())
                .urls(new ArrayList<>())
                .observacionesValidador(obsUi)
                .build();
    }

    private String catalogoValor(Long idCatalogo) {
        if (idCatalogo == null) {
            return null;
        }
        return catalogoRepository.findById(idCatalogo).map(CatalogoEntity::getValor).orElse(null);
    }

    private String formatFecha(LocalDateTime fecha) {
        if (fecha == null) {
            return null;
        }
        return fecha.format(FECHA_UI);
    }

    private void registrarAuditoria(Long idUsuario, String modulo, String accion, String descripcion) {
        AuditoriaEntity auditoria = new AuditoriaEntity();
        auditoria.setIdUsuario(idUsuario);
        auditoria.setModulo(modulo);
        auditoria.setAccion(accion);
        auditoria.setDescripcion(descripcion);
        auditoriaRepository.save(auditoria);
    }
}

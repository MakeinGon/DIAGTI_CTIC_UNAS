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
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaOficialInsertRepository;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;
import pe.edu.unas.ctic.diagti.desarrollador.support.DesarrolladorUsuarioResolver;
import pe.edu.unas.ctic.diagti.desarrollador.support.EstadoFlujoNormalizer;
import pe.edu.unas.ctic.diagti.director.entity.ArquitecturaEntity;
import pe.edu.unas.ctic.diagti.director.entity.BaseDatosSistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.EvidenciaEntity;
import pe.edu.unas.ctic.diagti.director.entity.IntegracionEntity;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.BaseDatosSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorArquitecturaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorIntegracionRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
    private final SistemaOficialInsertRepository sistemaOficialInsertRepository;
    private final DirectorArquitecturaRepository arquitecturaRepository;
    private final BaseDatosSistemaRepository baseDatosSistemaRepository;
    private final DirectorIntegracionRepository integracionRepository;
    private final DirectorEvidenciaRepository evidenciaRepository;

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
        if ("RECHAZADO".equals(estadoActual)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede reenviar un sistema rechazado sin una transición explícita");
        }
        if ("OBSERVADO".equals(estadoActual)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Debe subsanar las observaciones antes de reenviar a validación");
        }

        boolean esReenvio = "SUBSANADO".equals(estadoActual);
        if (!esReenvio && !"BORRADOR".equals(estadoActual)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede enviar desde BORRADOR o reenviar desde SUBSANADO");
        }

        sistema.setEstadoFlujoSincronizado("ENVIADO");
        sistemaRepository.save(sistema);

        if (esReenvio) {
            reenviarValidacionSubsanada(
                    sistema.getIdSistema(),
                    "Sistema reenviado a validación tras subsanación.");
        } else {
            asegurarValidacionInicialPendiente(
                    sistema.getIdSistema(),
                    "Sistema enviado a validación por el área de desarrollo.");
        }

        registrarAuditoria(desarrollador.getIdUsuario(), "Desarrollo",
                esReenvio ? "Reenviar validación" : "Enviar validación",
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

        sistema.setEstadoFlujoSincronizado("SUBSANADO");
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
        CatalogoEntity tipoCat = catalogoEntity(sistema.getIdTipoAplicativo());
        CatalogoEntity areaCat = catalogoEntity(sistema.getIdAreaUsuario());
        CatalogoEntity criticidadCat = catalogoEntity(sistema.getIdCriticidad());
        String tipo = tipoCat != null ? tipoCat.getValor() : null;
        String area = areaCat != null ? areaCat.getValor() : null;
        String criticidad = criticidadCat != null ? criticidadCat.getValor() : null;

        String responsableFuncional = null;
        if (sistema.getIdResponsableFuncional() != null) {
            responsableFuncional = loginUsuarioRepository.findById(sistema.getIdResponsableFuncional())
                    .map(u -> (u.getNombres() + " " + u.getApellidos()).trim())
                    .orElse(null);
        }

        List<SistemaFrontendDTO.ObservacionFrontendDTO> obsUi = new ArrayList<>();
        for (ObservacionEntity obs : observaciones) {
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

        ArquitecturaEntity arq = arquitecturaRepository.findByIdSistema(sistema.getIdSistema()).stream()
                .findFirst().orElse(null);
        BaseDatosSistemaEntity bd = baseDatosSistemaRepository.findByIdSistema(sistema.getIdSistema()).orElse(null);
        List<IntegracionEntity> integs = integracionRepository.findByIdSistemaOrigen(sistema.getIdSistema());
        List<EvidenciaEntity> evids = evidenciaRepository.findByIdSistema(sistema.getIdSistema());

        List<Object> integracionesUi = new ArrayList<>();
        for (IntegracionEntity i : integs) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("destino", i.getSistemaDestinoNombre() != null ? i.getSistemaDestinoNombre() : "");
            m.put("protocolo", i.getProtocolo());
            m.put("metodo", i.getMetodoIntercambio());
            m.put("frecuencia", i.getFrecuencia());
            m.put("estado", i.getEstado());
            m.put("responsable", i.getResponsableNombre());
            m.put("descripcion", i.getDescripcion());
            integracionesUi.add(m);
        }

        List<Object> urlsUi = new ArrayList<>();
        List<Object> evidenciasUi = new ArrayList<>();
        for (EvidenciaEntity e : evids) {
            if (e.getUrlEvidencia() != null && !e.getUrlEvidencia().isBlank()) {
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("url", e.getUrlEvidencia());
                u.put("descripcion", e.getDescripcion());
                u.put("tipo", e.getTipoEvidencia());
                urlsUi.add(u);
            } else if (e.getNombreArchivo() != null) {
                Map<String, Object> a = new LinkedHashMap<>();
                a.put("tipo", e.getTipoEvidencia());
                a.put("nombre", e.getNombreArchivo());
                a.put("size", e.getTamanoArchivo());
                evidenciasUi.add(a);
            }
        }

        return SistemaFrontendDTO.builder()
                .id(String.valueOf(sistema.getIdSistema()))
                .codigo(sistema.getCodigoUnico())
                .nombre(sistema.getNombre())
                .tipo(tipo != null ? tipo : "")
                .tipoCodigo(tipoCat != null ? tipoCat.getCodigo() : null)
                .estado(EstadoFlujoNormalizer.toUi(sistema.getEstadoFlujo()))
                .criticidad(criticidad != null ? criticidad : "")
                .criticidadCodigo(criticidadCat != null ? criticidadCat.getCodigo() : null)
                .fecha(formatFecha(fechaRef))
                .area(area != null ? area : "")
                .areaCodigo(areaCat != null ? areaCat.getCodigo() : null)
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
                .observaciones(blankToNull(sistema.getObservacionesDesarrollo()) != null
                        ? sistema.getObservacionesDesarrollo() : "")
                .lenguaje(arq != null ? arq.getLenguajeProgramacion() : null)
                .versionLenguaje(arq != null ? arq.getVersionLenguaje() : null)
                .framework(arq != null ? arq.getFramework() : null)
                .versionFramework(arq != null ? arq.getVersionFramework() : null)
                .arquitectura(arq != null ? arq.getTipoArquitectura() : null)
                .patron(arq != null ? arq.getPatronArquitectonico() : null)
                .repositorio(arq != null ? arq.getRepositorio() : null)
                .tecnologias(arq != null ? arq.getTecnologiasComplementarias() : null)
                .motorBd(bd != null ? bd.getMotor() : null)
                .versionBd(bd != null ? bd.getVersionBd() : null)
                .tipoBd(bd != null ? bd.getTipoBd() : null)
                .servidor(bd != null ? bd.getServidor() : null)
                .esquema(bd != null ? bd.getEsquema() : null)
                .backup(bd == null || bd.getBackupActivo() == null ? null
                        : (Boolean.TRUE.equals(bd.getBackupActivo()) ? "Si" : "No"))
                .frecuencia(bd != null ? bd.getFrecuenciaBackup() : null)
                .cifrado(bd == null || bd.getCifrado() == null ? null
                        : (Boolean.TRUE.equals(bd.getCifrado()) ? "Si" : "No"))
                .responsableBd(bd != null ? bd.getResponsable() : null)
                .tieneIntegraciones(!integs.isEmpty() ? Boolean.TRUE
                        : (integs.isEmpty() ? Boolean.FALSE : Boolean.FALSE))
                .riesgo(sistema.getNivelRiesgo())
                .integraciones(integracionesUi)
                .evidencias(evidenciasUi)
                .urls(urlsUi)
                .observacionesValidador(obsUi)
                .archivosFisicosSoportados(Boolean.FALSE)
                .build();
    }

    private CatalogoEntity catalogoEntity(Long idCatalogo) {
        if (idCatalogo == null) {
            return null;
        }
        return catalogoRepository.findById(idCatalogo).orElse(null);
    }

    private String catalogoValor(Long idCatalogo) {
        CatalogoEntity c = catalogoEntity(idCatalogo);
        return c != null ? c.getValor() : null;
    }

    private String formatFecha(LocalDateTime fecha) {
        if (fecha == null) {
            return null;
        }
        return fecha.format(FECHA_UI);
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    @Override
    @Transactional
    public RegistrarSistemaOficialResponseDTO registrarSistemaOficial(
            String username, RegistrarSistemaOficialRequestDTO request) {

        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(username);

        String codigo = request.getCodigoUnico() == null ? "" : request.getCodigoUnico().trim().toUpperCase();
        String nombre = request.getNombre() == null ? "" : request.getNombre().trim();
        String descripcion = request.getDescripcion() == null ? "" : request.getDescripcion().trim();

        if (codigo.isBlank()) {
            throw new IllegalArgumentException("El código único es obligatorio");
        }
        if (nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (descripcion.isBlank()) {
            throw new IllegalArgumentException("La descripción es obligatoria");
        }
        if (request.getAnoAdquisicion() == null
                || request.getAnoAdquisicion() < 1990
                || request.getAnoAdquisicion() > LocalDate.now().getYear() + 1) {
            throw new IllegalArgumentException("El año de adquisición no es válido");
        }
        if (request.getFormaAdquisicion() == null || request.getFormaAdquisicion().isBlank()) {
            throw new IllegalArgumentException("La forma de adquisición es obligatoria");
        }
        if (request.getNivelRiesgo() == null || request.getNivelRiesgo().isBlank()) {
            throw new IllegalArgumentException("El nivel de riesgo es obligatorio");
        }
        if (request.getPrioridadMigracion() == null || request.getPrioridadMigracion().isBlank()) {
            throw new IllegalArgumentException("La prioridad de migración es obligatoria");
        }

        if (sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull(codigo).isPresent()) {
            throw new ConflictException("Ya existe un sistema con el código " + codigo);
        }

        CatalogoEntity area = requireCatalogoActivo("AREA_USUARIO", request.getAreaCodigo());
        CatalogoEntity tipo = requireCatalogoActivo("TIPO_APLICATIVO", request.getTipoCodigo());
        CatalogoEntity criticidad = requireCatalogoActivo("CRITICIDAD", request.getCriticidadCodigo());

        String estadoFlujo = EstadoFlujoNormalizer.toBd(request.getEstadoFlujo());
        if (estadoFlujo == null || estadoFlujo.isBlank()) {
            estadoFlujo = "BORRADOR";
        }
        if (!"BORRADOR".equals(estadoFlujo) && !"ENVIADO".equals(estadoFlujo)) {
            throw new IllegalArgumentException("estadoFlujo debe ser BORRADOR o ENVIADO");
        }

        LocalDate fechaSoporte = null;
        if (request.getFechaVencimientoSoporte() != null && !request.getFechaVencimientoSoporte().isBlank()) {
            try {
                fechaSoporte = LocalDate.parse(request.getFechaVencimientoSoporte().trim());
            } catch (DateTimeParseException ex) {
                throw new IllegalArgumentException("La fecha de vencimiento de soporte no es válida (yyyy-MM-dd)");
            }
        }

        Long nuevoId = sistemaOficialInsertRepository.insertar(
                codigo,
                nombre,
                descripcion,
                area.getIdCatalogo(),
                tipo.getIdCatalogo(),
                criticidad.getIdCatalogo(),
                area.getValor(),
                tipo.getValor(),
                request.getFormaAdquisicion().trim(),
                desarrollador.getIdUsuario(),
                request.getAnoAdquisicion(),
                request.getDesarrolladorNombre() != null ? request.getDesarrolladorNombre().trim() : null,
                request.getContratoVigente(),
                fechaSoporte,
                request.getEsLegacy(),
                estadoFlujo,
                request.getNivelRiesgo().trim().toUpperCase(Locale.ROOT),
                request.getPrioridadMigracion().trim().toUpperCase(Locale.ROOT)
        );

        SistemaEntity guardado = sistemaRepository.findActivoById(nuevoId)
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo recuperar el sistema registrado"));

        if (guardado.getIdResponsableFuncional() != null) {
            throw new IllegalStateException("El responsable funcional debe permanecer NULL");
        }

        if (request.getObservacionesDesarrollo() != null && !request.getObservacionesDesarrollo().isBlank()) {
            guardado.setObservacionesDesarrollo(request.getObservacionesDesarrollo().trim());
            sistemaRepository.save(guardado);
        }

        persistirArquitectura(nuevoId, request.getArquitectura());
        persistirBaseDatos(nuevoId, request.getBaseDatos());
        persistirIntegraciones(nuevoId, request.getIntegraciones());
        persistirEvidenciasUrl(nuevoId, desarrollador.getIdUsuario(), request.getEvidencias());

        asegurarValidacionInicial(nuevoId, estadoFlujo);

        registrarAuditoria(
                desarrollador.getIdUsuario(),
                "Desarrollo",
                "Registro",
                "Sistema registrado: " + codigo
        );

        SistemaFrontendDTO dto = toFrontend(guardado, desarrollador, List.of());
        return RegistrarSistemaOficialResponseDTO.builder()
                .success(true)
                .message("Sistema registrado correctamente")
                .sistema(dto)
                .build();
    }

    private void persistirArquitectura(Long idSistema, RegistrarSistemaOficialRequestDTO.ArquitecturaSeccionDTO arq) {
        if (arq == null) {
            return;
        }
        String tipo = blankToNull(arq.getTipoArquitectura());
        String lenguaje = blankToNull(arq.getLenguaje());
        String framework = blankToNull(arq.getFramework());
        String patron = blankToNull(arq.getPatron());
        String repo = blankToNull(arq.getRepositorioGit());
        String tech = blankToNull(arq.getTecnologiasComplementarias());
        String verLeng = blankToNull(arq.getVersionLenguaje());
        String verFw = blankToNull(arq.getVersionFramework());
        if (tipo == null && lenguaje == null && framework == null && patron == null
                && repo == null && tech == null) {
            return;
        }
        if (tipo == null) {
            throw new IllegalArgumentException("El tipo de arquitectura es obligatorio cuando se registra ficha técnica");
        }

        if (repo != null && !(repo.startsWith("http://") || repo.startsWith("https://") || repo.startsWith("git@"))) {
            throw new IllegalArgumentException("La URL del repositorio Git no es válida");
        }

        ArquitecturaEntity entity = arquitecturaRepository.findByIdSistema(idSistema).stream()
                .findFirst().orElseGet(ArquitecturaEntity::new);
        if (entity.getIdArquitectura() == null) {
            entity.setIdSistema(idSistema);
            entity.setFechaCreacion(LocalDateTime.now());
        }
        entity.setTipoArquitectura(tipo);
        entity.setPatronArquitectonico(patron);
        entity.setLenguajeProgramacion(lenguaje);
        entity.setVersionLenguaje(verLeng);
        entity.setFramework(framework);
        entity.setVersionFramework(verFw);
        entity.setRepositorio(repo);
        entity.setTecnologiasComplementarias(tech);
        entity.setObservaciones(blankToNull(arq.getObservaciones()));
        entity.setFechaActualizacion(LocalDateTime.now());
        arquitecturaRepository.save(entity);
    }

    private void persistirBaseDatos(Long idSistema, RegistrarSistemaOficialRequestDTO.BaseDatosSeccionDTO bd) {
        if (bd == null) {
            return;
        }
        String motor = blankToNull(bd.getMotor());
        if (motor == null
                && blankToNull(bd.getVersion()) == null
                && blankToNull(bd.getServidor()) == null
                && blankToNull(bd.getEsquema()) == null
                && blankToNull(bd.getResponsable()) == null
                && bd.getTieneBackup() == null
                && bd.getCifrado() == null) {
            return;
        }
        if (motor == null) {
            throw new IllegalArgumentException("El motor de base de datos es obligatorio cuando se registra BD");
        }

        BaseDatosSistemaEntity entity = baseDatosSistemaRepository.findByIdSistema(idSistema)
                .orElseGet(BaseDatosSistemaEntity::new);
        if (entity.getIdBaseDatos() == null) {
            entity.setIdSistema(idSistema);
            entity.setFechaCreacion(LocalDateTime.now());
        }
        entity.setMotor(motor);
        entity.setVersionBd(blankToNull(bd.getVersion()));
        entity.setTipoBd(blankToNull(bd.getTipo()));
        entity.setServidor(blankToNull(bd.getServidor()));
        entity.setEsquema(blankToNull(bd.getEsquema()));
        entity.setBackupActivo(bd.getTieneBackup());
        entity.setFrecuenciaBackup(blankToNull(bd.getFrecuenciaBackup()));
        entity.setCifrado(bd.getCifrado());
        entity.setResponsable(blankToNull(bd.getResponsable()));
        entity.setFechaActualizacion(LocalDateTime.now());
        baseDatosSistemaRepository.save(entity);
    }

    private void persistirIntegraciones(Long idSistema,
                                        RegistrarSistemaOficialRequestDTO.IntegracionesSeccionDTO seccion) {
        if (seccion == null) {
            return;
        }
        if (Boolean.FALSE.equals(seccion.getTieneIntegraciones())) {
            return;
        }
        if (seccion.getItems() == null || seccion.getItems().isEmpty()) {
            return;
        }
        for (RegistrarSistemaOficialRequestDTO.IntegracionItemDTO item : seccion.getItems()) {
            String destino = blankToNull(item.getDestino());
            if (destino == null) {
                destino = blankToNull(item.getSistemaExterno());
            }
            if (destino == null) {
                throw new IllegalArgumentException("Cada integración requiere sistema destino/externo");
            }
            IntegracionEntity e = new IntegracionEntity();
            e.setIdSistemaOrigen(idSistema);
            e.setIdSistemaDestino(idSistema);
            e.setSistemaDestinoNombre(destino);
            e.setProtocolo(blankToNull(item.getProtocolo()) != null ? item.getProtocolo()
                    : blankToNull(item.getTecnologia()));
            e.setMetodoIntercambio(blankToNull(item.getMetodo()));
            e.setFrecuencia(blankToNull(item.getFrecuencia()));
            e.setEstado(blankToNull(item.getEstado()) != null ? item.getEstado() : "Activo");
            e.setResponsableNombre(blankToNull(item.getResponsable()));
            e.setDescripcion(blankToNull(item.getDescripcion()));
            e.setFechaCreacion(LocalDateTime.now());
            integracionRepository.save(e);
        }
    }

    private void persistirEvidenciasUrl(Long idSistema, Long idUsuario,
                                        RegistrarSistemaOficialRequestDTO.EvidenciasSeccionDTO seccion) {
        if (seccion == null) {
            return;
        }
        if (seccion.getArchivos() != null && !seccion.getArchivos().isEmpty()) {
            // Almacenamiento físico aún no implementado: no bloquear registro, no persistir metadatos falsos.
        }
        if (seccion.getUrls() == null) {
            return;
        }
        for (RegistrarSistemaOficialRequestDTO.EvidenciaUrlDTO urlDto : seccion.getUrls()) {
            String url = blankToNull(urlDto.getUrl());
            if (url == null) {
                continue;
            }
            if (!(url.startsWith("http://") || url.startsWith("https://"))) {
                throw new IllegalArgumentException("URL de evidencia inválida: " + url);
            }
            EvidenciaEntity e = new EvidenciaEntity();
            e.setIdSistema(idSistema);
            e.setTipoEvidencia(blankToNull(urlDto.getTipo()) != null ? urlDto.getTipo() : "URL");
            e.setUrlEvidencia(url);
            e.setDescripcion(blankToNull(urlDto.getDescripcion()));
            e.setEstadoEvidencia("ACTIVA");
            e.setFechaCarga(LocalDateTime.now());
            e.setIdUsuarioCarga(idUsuario);
            evidenciaRepository.save(e);
        }
    }

    /**
     * Al registrar: BORRADOR no crea fila en {@code validaciones} (no entra a la cola).
     * ENVIADO asegura exactamente una validación PENDIENTE (envío inicial).
     */
    private void asegurarValidacionInicial(Long idSistema, String estadoFlujo) {
        if (!"ENVIADO".equals(estadoFlujo)) {
            return;
        }
        asegurarValidacionInicialPendiente(idSistema, "Sistema enviado a validación tras el registro.");
    }

    /**
     * Envío inicial: crea PENDIENTE o actualiza BORRADOR → PENDIENTE.
     * No toca OBSERVADO, SUBSANADO, VALIDADO ni RECHAZADO.
     */
    private void asegurarValidacionInicialPendiente(Long idSistema, String observacionGeneral) {
        List<ValidacionEntity> existentes = validacionRepository.findByIdSistema(idSistema);
        LocalDateTime ahora = LocalDateTime.now();

        if (existentes.stream().anyMatch(v -> {
            String e = upperEstado(v.getEstadoValidacion());
            return "VALIDADO".equals(e) || "RECHAZADO".equals(e)
                    || "OBSERVADO".equals(e) || "SUBSANADO".equals(e);
        })) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La validación existente no admite un envío inicial genérico");
        }

        Optional<ValidacionEntity> pendiente = existentes.stream()
                .filter(v -> "PENDIENTE".equals(upperEstado(v.getEstadoValidacion())))
                .findFirst();
        if (pendiente.isPresent()) {
            ValidacionEntity v = pendiente.get();
            if (v.getIdValidador() != null) {
                v.setIdValidador(null);
                v.setFechaActualizacion(ahora);
                validacionRepository.save(v);
            }
            return;
        }

        Optional<ValidacionEntity> borrador = existentes.stream()
                .filter(v -> "BORRADOR".equals(upperEstado(v.getEstadoValidacion())))
                .findFirst();
        if (borrador.isPresent()) {
            promoverAPendiente(borrador.get(), observacionGeneral, ahora);
            return;
        }

        crearValidacionPendiente(idSistema, observacionGeneral, ahora);
    }

    /**
     * Reenvío oficial tras subsanar: solo SUBSANADO → PENDIENTE.
     * OBSERVADO no se reabre aquí (primero debe pasar por subsanar).
     */
    private void reenviarValidacionSubsanada(Long idSistema, String observacionGeneral) {
        List<ValidacionEntity> existentes = validacionRepository.findByIdSistema(idSistema);
        LocalDateTime ahora = LocalDateTime.now();

        Optional<ValidacionEntity> finalizada = existentes.stream()
                .filter(v -> {
                    String e = upperEstado(v.getEstadoValidacion());
                    return "VALIDADO".equals(e) || "RECHAZADO".equals(e);
                })
                .findFirst();
        if (finalizada.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Existe una validación finalizada; no se puede reabrir sin transición explícita");
        }

        Optional<ValidacionEntity> subsanada = existentes.stream()
                .filter(v -> "SUBSANADO".equals(upperEstado(v.getEstadoValidacion())))
                .findFirst();
        if (subsanada.isPresent()) {
            promoverAPendiente(subsanada.get(), observacionGeneral, ahora);
            return;
        }

        Optional<ValidacionEntity> pendiente = existentes.stream()
                .filter(v -> "PENDIENTE".equals(upperEstado(v.getEstadoValidacion())))
                .findFirst();
        if (pendiente.isPresent()) {
            return;
        }

        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "No hay una validación SUBSANADO para reenviar");
    }

    private void promoverAPendiente(ValidacionEntity v, String observacionGeneral, LocalDateTime ahora) {
        v.setEstadoValidacion("PENDIENTE");
        v.setResultado("PENDIENTE");
        v.setIdValidador(null);
        if (observacionGeneral != null && !observacionGeneral.isBlank()) {
            v.setObservacionGeneral(observacionGeneral);
        }
        v.setFechaActualizacion(ahora);
        validacionRepository.save(v);
    }

    private void crearValidacionPendiente(Long idSistema, String observacionGeneral, LocalDateTime ahora) {
        ValidacionEntity creada = new ValidacionEntity();
        creada.setIdSistema(idSistema);
        creada.setIdValidador(null);
        creada.setEstadoValidacion("PENDIENTE");
        creada.setResultado("PENDIENTE");
        creada.setObservacionGeneral(observacionGeneral);
        creada.setFechaCreacion(ahora);
        creada.setFechaActualizacion(ahora);
        validacionRepository.save(creada);
    }

    private static String upperEstado(String raw) {
        return raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
    }

    private CatalogoEntity requireCatalogoActivo(String tipo, String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new IllegalArgumentException("Código de catálogo obligatorio para " + tipo);
        }
        String codigoNorm = codigo.trim().toUpperCase(Locale.ROOT);
        CatalogoEntity catalogo = catalogoRepository.findByTipoCatalogoAndCodigo(tipo, codigoNorm)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Catálogo inexistente: " + tipo + "/" + codigoNorm));
        if (!Boolean.TRUE.equals(catalogo.getEstado())) {
            throw new ResourceNotFoundException("Catálogo inactivo: " + tipo + "/" + codigoNorm);
        }
        return catalogo;
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

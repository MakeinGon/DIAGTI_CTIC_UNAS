package pe.edu.unas.ctic.diagti.infraestructura.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.infraestructura.dto.*;
import pe.edu.unas.ctic.diagti.infraestructura.entity.*;
import pe.edu.unas.ctic.diagti.infraestructura.exception.RegistroIncompletoException;
import pe.edu.unas.ctic.diagti.infraestructura.exception.SistemaNoEncontradoException;
import pe.edu.unas.ctic.diagti.infraestructura.repository.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Servicio principal del módulo de Infraestructura: registro técnico
 * (RF-09, RF-10, RF-11), controles de seguridad (RF-12), evidencias
 * (RF-14), flujo de envío/observación/subsanación (RF-16, RF-18, RF-19)
 * y los indicadores del dashboard (parte de RF-24, acotado a esta área).
 */
@Service
@RequiredArgsConstructor
public class InfraestructuraService {

    private static final List<String> ESTADOS = List.of("Nuevo", "Borrador", "Enviado", "Observado", "Corregido", "Validado");
    private static final List<String> RIESGOS = List.of("Bajo", "Medio", "Alto", "Crítico");
    private static final List<String> ORDEN_PRIORIDAD = List.of("Observado", "Corregido", "Borrador", "Nuevo");
    private static final DateTimeFormatter FECHA_CORTA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SistemaRepository sistemaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InfraestructuraRepository infraestructuraRepository;
    private final SeguridadRepository seguridadRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final ValidacionRepository validacionRepository;
    private final ObservacionRepository observacionRepository;
    private final HistorialService historialService;

    // ------------------------------------------------------------------
    // Consultas
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<SistemaInfraDTO> listarSistemas() {
        return sistemaRepository.findAll().stream()
                .map(this::toSistemaInfraDTO)
                .sorted(Comparator.comparing(SistemaInfraDTO::getCodigo))
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardDTO dashboard() {
        List<SistemaInfraDTO> sistemas = listarSistemas();

        Map<String, Long> porEstado = new LinkedHashMap<>();
        for (String estado : ESTADOS) {
            porEstado.put(estado, sistemas.stream().filter(s -> estado.equals(s.getEstado())).count());
        }
        Map<String, Long> porRiesgo = new LinkedHashMap<>();
        for (String riesgo : RIESGOS) {
            porRiesgo.put(riesgo, sistemas.stream().filter(s -> riesgo.equals(s.getRiesgo())).count());
        }

        long nuevos = porEstado.getOrDefault("Nuevo", 0L);
        long borradores = porEstado.getOrDefault("Borrador", 0L);
        long observados = porEstado.getOrDefault("Observado", 0L);
        long validados = porEstado.getOrDefault("Validado", 0L);

        List<SistemaInfraDTO> prioridades = sistemas.stream()
                .filter(s -> ORDEN_PRIORIDAD.contains(s.getEstado()))
                .sorted(Comparator.comparingInt(s -> ORDEN_PRIORIDAD.indexOf(s.getEstado())))
                .limit(6)
                .toList();

        return DashboardDTO.builder()
                .total(sistemas.size())
                .nuevos(nuevos)
                .borradores(borradores)
                .pendientes(nuevos + borradores)
                .observados(observados)
                .validados(validados)
                .porEstado(porEstado)
                .porRiesgo(porRiesgo)
                .prioridades(prioridades)
                .build();
    }

    @Transactional(readOnly = true)
    public RegistroTecnicoDTO obtenerRegistro(String codigo) {
        Sistema sistema = getSistemaOrThrow(codigo);
        Optional<Infraestructura> infraOpt = infraestructuraRepository.findBySistema_CodigoUnico(codigo);
        if (infraOpt.isEmpty()) {
            return RegistroTecnicoDTO.builder().estado("Nuevo").ultimoPaso(0).evidences(List.of()).build();
        }
        Infraestructura infra = infraOpt.get();
        Seguridad seguridad = seguridadRepository.findBySistema_CodigoUnico(codigo).orElse(null);
        List<EvidenciaDTO> evidencias = evidenciaRepository.findBySistema_CodigoUnicoAndContexto(codigo, "REGISTRO")
                .stream().map(this::toEvidenciaDTO).toList();
        return toRegistroDTO(infra, seguridad, evidencias);
    }

    // ------------------------------------------------------------------
    // Registro técnico: borrador / envío
    // ------------------------------------------------------------------

    @Transactional
    public RegistroTecnicoDTO guardarBorrador(String codigo, RegistroTecnicoDTO dto, Integer ultimoPaso) {
        Sistema sistema = getSistemaOrThrow(codigo);
        Infraestructura infra = infraestructuraRepository.findBySistema_CodigoUnico(codigo)
                .orElseGet(() -> nuevaInfraestructura(sistema));

        mapDtoToInfra(dto, infra);
        infra.setEstadoRegistro("Borrador");
        infra.setUltimoPaso(ultimoPaso == null ? 0 : ultimoPaso);
        infra.setIdUsuarioRegistro(resolveActorId());
        infraestructuraRepository.save(infra);

        mapDtoToSeguridad(dto, sistema);
        syncEvidenciasRegistro(sistema, dto.getEvidences());

        historialService.registrar(sistema, "Borrador", "Registro técnico",
                "Se guardó el avance del registro técnico.", "Borrador", null, "Borrador",
                HistorialService.USUARIO_ACTOR_DEFAULT);

        return obtenerRegistro(codigo);
    }

    @Transactional
    public RegistroTecnicoDTO enviarValidacion(String codigo, RegistroTecnicoDTO dto) {
        Sistema sistema = getSistemaOrThrow(codigo);
        validarCamposObligatorios(dto);

        Infraestructura infra = infraestructuraRepository.findBySistema_CodigoUnico(codigo)
                .orElseGet(() -> nuevaInfraestructura(sistema));
        mapDtoToInfra(dto, infra);
        infra.setEstadoRegistro("Enviado");
        infra.setUltimoPaso(3);
        infra.setIdUsuarioRegistro(resolveActorId());
        infraestructuraRepository.save(infra);

        mapDtoToSeguridad(dto, sistema);
        syncEvidenciasRegistro(sistema, dto.getEvidences());

        Validacion ultima = validacionRepository.findFirstBySistema_CodigoUnicoOrderByFechaCreacionDesc(codigo).orElse(null);
        if (ultima == null || !"PENDIENTE".equals(ultima.getEstadoValidacion())) {
            Validacion nueva = new Validacion();
            nueva.setSistema(sistema);
            nueva.setEstadoValidacion("PENDIENTE");
            validacionRepository.save(nueva);
        }

        historialService.registrar(sistema, "Envío", "Flujo de validación",
                "El registro técnico fue enviado al Validador CTIC.", "Enviado", null, "Enviado",
                HistorialService.USUARIO_ACTOR_DEFAULT);

        return obtenerRegistro(codigo);
    }

    // ------------------------------------------------------------------
    // Subsanación de observaciones
    // ------------------------------------------------------------------

    @Transactional
    public SistemaInfraDTO subsanar(String codigo, SubsanacionRequestDTO req) {
        Sistema sistema = getSistemaOrThrow(codigo);
        Infraestructura infra = infraestructuraRepository.findBySistema_CodigoUnico(codigo)
                .orElseThrow(() -> new IllegalStateException("El sistema no tiene un registro técnico observado."));

        if (!"Observado".equals(infra.getEstadoRegistro())) {
            throw new IllegalStateException("El sistema no está en estado Observado.");
        }
        if (req.getDescripcion() == null || req.getDescripcion().isBlank() || req.getEvidencias().isEmpty()) {
            throw new IllegalArgumentException("Ingrese la descripción general y agregue al menos una evidencia.");
        }

        Observacion obs = observacionRepository
                .findFirstBySistema_CodigoUnicoAndEstadoObservacionOrderByFechaObservacionDesc(codigo, "PENDIENTE")
                .orElseThrow(() -> new IllegalStateException("No se encontró una observación pendiente para este sistema."));

        obs.setRespuestaSubsanacion(req.getDescripcion());
        obs.setEstadoObservacion("SUBSANADA");
        obs.setFechaSubsanacion(LocalDateTime.now());
        obs.setIdUsuarioSubsana(resolveActorId());
        observacionRepository.save(obs);

        syncEvidenciasSubsanacion(sistema, obs.getIdObservacion(), req.getEvidencias());

        infra.setEstadoRegistro("Corregido");
        infraestructuraRepository.save(infra);

        historialService.registrar(sistema, "Subsanación", "Subsanación",
                "Se guardó la corrección de la observación y sus evidencias.", "Corregido", null,
                "Corregido", HistorialService.USUARIO_ACTOR_DEFAULT);

        return toSistemaInfraDTO(sistema);
    }

    @Transactional
    public SistemaInfraDTO reenviar(String codigo) {
        Sistema sistema = getSistemaOrThrow(codigo);
        Infraestructura infra = infraestructuraRepository.findBySistema_CodigoUnico(codigo)
                .orElseThrow(() -> new IllegalStateException("El sistema no tiene un registro técnico."));

        if (!"Corregido".equals(infra.getEstadoRegistro())) {
            throw new IllegalStateException("Solo se puede reenviar un sistema en estado Corregido.");
        }
        infra.setEstadoRegistro("Enviado");
        infraestructuraRepository.save(infra);

        Validacion ultima = validacionRepository.findFirstBySistema_CodigoUnicoOrderByFechaCreacionDesc(codigo).orElse(null);
        if (ultima != null) {
            ultima.setEstadoValidacion("PENDIENTE");
            ultima.setResultado(null);
            validacionRepository.save(ultima);
        } else {
            Validacion nueva = new Validacion();
            nueva.setSistema(sistema);
            nueva.setEstadoValidacion("PENDIENTE");
            validacionRepository.save(nueva);
        }

        historialService.registrar(sistema, "Envío", "Flujo de validación",
                "La corrección fue reenviada al Validador CTIC.", "Enviado", null, "Enviado",
                HistorialService.USUARIO_ACTOR_DEFAULT);

        return toSistemaInfraDTO(sistema);
    }

    // ------------------------------------------------------------------
    // Helpers privados
    // ------------------------------------------------------------------

    private Sistema getSistemaOrThrow(String codigo) {
        return sistemaRepository.findByCodigoUnico(codigo)
                .orElseThrow(() -> new SistemaNoEncontradoException(codigo));
    }

    private Infraestructura nuevaInfraestructura(Sistema sistema) {
        Infraestructura infra = new Infraestructura();
        infra.setSistema(sistema);
        return infra;
    }

    private Integer resolveActorId() {
        return usuarioRepository.findByUsername(HistorialService.USUARIO_ACTOR_DEFAULT)
                .map(Usuario::getIdUsuario).orElse(null);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private void validarCamposObligatorios(RegistroTecnicoDTO dto) {
        List<String> pendientes = new ArrayList<>();

        if (isBlank(dto.getPlataforma()) || isBlank(dto.getTipoServidor()) || isBlank(dto.getSistemaOperativo())
                || isBlank(dto.getVersionSO()) || isBlank(dto.getIpPrivada()) || isBlank(dto.getProxmox())
                || isBlank(dto.getBackup()) || isBlank(dto.getFrecuenciaBackup())) {
            pendientes.add("Infraestructura");
        }
        if (isBlank(dto.getAmbiente()) || isBlank(dto.getServidor()) || isBlank(dto.getPuerto())
                || isBlank(dto.getDominio()) || isBlank(dto.getServidorWeb()) || isBlank(dto.getProxy())
                || isBlank(dto.getDocker()) || isBlank(dto.getCompose()) || isBlank(dto.getExposicion())
                || isBlank(dto.getCicd())) {
            pendientes.add("Despliegue");
        }
        if (isBlank(dto.getSsl()) || isBlank(dto.getAutenticacion()) || isBlank(dto.getMfa())
                || isBlank(dto.getLogs()) || isBlank(dto.getCifrado()) || isBlank(dto.getRestriccionIp())
                || isBlank(dto.getSesiones())) {
            pendientes.add("Seguridad");
        }
        if (dto.getEvidences() == null || dto.getEvidences().isEmpty()) {
            pendientes.add("Evidencias");
        }
        if (!pendientes.isEmpty()) {
            throw new RegistroIncompletoException(pendientes);
        }
    }

    private void mapDtoToInfra(RegistroTecnicoDTO dto, Infraestructura infra) {
        infra.setPlataforma(dto.getPlataforma());
        infra.setTipoServidor(dto.getTipoServidor());
        infra.setSistemaOperativo(dto.getSistemaOperativo());
        infra.setVersionSo(dto.getVersionSO());
        infra.setIpPrivada(dto.getIpPrivada());
        infra.setProxmox(dto.getProxmox());
        infra.setBackup(dto.getBackup());
        infra.setFrecuenciaBackup(dto.getFrecuenciaBackup());
        infra.setObservacionesInfra(dto.getObservacionesInfra());

        infra.setAmbiente(dto.getAmbiente());
        infra.setServidor(dto.getServidor());
        infra.setPuerto(parseInt(dto.getPuerto()));
        infra.setDominio(dto.getDominio());
        infra.setServidorWeb(dto.getServidorWeb());
        infra.setProxyReverso(dto.getProxy());
        infra.setDocker(dto.getDocker());
        infra.setDockerCompose(dto.getCompose());
        infra.setExposicion(dto.getExposicion());
        infra.setCicd(dto.getCicd());
    }

    private void mapDtoToSeguridad(RegistroTecnicoDTO dto, Sistema sistema) {
        boolean vacio = isBlank(dto.getSsl()) && isBlank(dto.getAutenticacion()) && isBlank(dto.getMfa())
                && isBlank(dto.getLogs()) && isBlank(dto.getCifrado()) && isBlank(dto.getRestriccionIp())
                && isBlank(dto.getSesiones());
        if (vacio) {
            return; // el usuario aún no llegó al paso de Seguridad: no se crea fila vacía
        }
        Seguridad seguridad = seguridadRepository.findBySistema_CodigoUnico(sistema.getCodigoUnico())
                .orElseGet(() -> {
                    Seguridad nueva = new Seguridad();
                    nueva.setSistema(sistema);
                    return nueva;
                });
        seguridad.setSslTls(dto.getSsl());
        seguridad.setMetodoAutenticacion(dto.getAutenticacion());
        seguridad.setMecanismoAutenticacion(dto.getAutenticacion());
        seguridad.setMfa(dto.getMfa());
        seguridad.setLogs(dto.getLogs());
        seguridad.setCifrado(dto.getCifrado());
        seguridad.setRestriccionIp(dto.getRestriccionIp());
        seguridad.setControlSesiones(dto.getSesiones());
        seguridadRepository.save(seguridad);
    }

    private void syncEvidenciasRegistro(Sistema sistema, List<EvidenciaDTO> nuevas) {
        List<Evidencia> actuales = evidenciaRepository.findBySistema_CodigoUnicoAndContexto(sistema.getCodigoUnico(), "REGISTRO");
        evidenciaRepository.deleteAll(actuales);
        if (nuevas == null) return;
        Integer actorId = resolveActorId();
        for (EvidenciaDTO e : nuevas) {
            Evidencia ev = new Evidencia();
            ev.setSistema(sistema);
            ev.setTipoEvidencia(e.getTipo());
            ev.setNombre(e.getNombre());
            ev.setNombreArchivo(e.getArchivo());
            ev.setUrlEvidencia(e.getUrl());
            ev.setDescripcion(e.getDescripcion());
            ev.setContexto("REGISTRO");
            ev.setIdUsuarioCarga(actorId);
            evidenciaRepository.save(ev);
        }
    }

    private void syncEvidenciasSubsanacion(Sistema sistema, Integer idObservacion, List<EvidenciaDTO> nuevas) {
        List<Evidencia> actuales = evidenciaRepository.findByIdObservacion(idObservacion);
        evidenciaRepository.deleteAll(actuales);
        Integer actorId = resolveActorId();
        for (EvidenciaDTO e : nuevas) {
            Evidencia ev = new Evidencia();
            ev.setSistema(sistema);
            ev.setTipoEvidencia(e.getTipo());
            ev.setNombre(e.getNombre());
            ev.setNombreArchivo(e.getArchivo());
            ev.setUrlEvidencia(e.getUrl());
            ev.setDescripcion(e.getDescripcion());
            ev.setContexto("SUBSANACION");
            ev.setIdObservacion(idObservacion);
            ev.setIdUsuarioCarga(actorId);
            evidenciaRepository.save(ev);
        }
    }

    private Integer parseInt(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private SistemaInfraDTO toSistemaInfraDTO(Sistema sistema) {
        Optional<Infraestructura> infraOpt = infraestructuraRepository.findBySistema_IdSistema(sistema.getIdSistema());

        String estado = infraOpt.map(Infraestructura::getEstadoRegistro).orElse("Nuevo");
        String plataforma = infraOpt.map(Infraestructura::getPlataforma).filter(p -> !isBlank(p)).orElse("Sin registrar");
        String exposicion = infraOpt.map(Infraestructura::getExposicion).filter(p -> !isBlank(p)).orElse("Sin registrar");
        Integer ultimoPaso = infraOpt.map(Infraestructura::getUltimoPaso).orElse(0);

        String observacion = null;
        String observacionFecha = null;
        if ("Observado".equals(estado)) {
            Optional<Observacion> obs = observacionRepository
                    .findFirstBySistema_CodigoUnicoAndEstadoObservacionOrderByFechaObservacionDesc(
                            sistema.getCodigoUnico(), "PENDIENTE");
            if (obs.isPresent()) {
                observacion = obs.get().getDescripcion();
                observacionFecha = obs.get().getFechaObservacion() == null ? null
                        : obs.get().getFechaObservacion().format(FECHA_CORTA);
            }
        }

        return SistemaInfraDTO.builder()
                .codigo(sistema.getCodigoUnico())
                .nombre(sistema.getNombre())
                .plataforma(plataforma)
                .exposicion(exposicion)
                .estado(estado)
                .riesgo(sistema.getNivelRiesgo())
                .observacion(observacion)
                .observacionFecha(observacionFecha)
                .ultimoPaso(ultimoPaso)
                .build();
    }

    private EvidenciaDTO toEvidenciaDTO(Evidencia e) {
        return EvidenciaDTO.builder()
                .id(e.getIdEvidencia())
                .tipo(e.getTipoEvidencia())
                .nombre(e.getNombre())
                .archivo(e.getNombreArchivo())
                .url(e.getUrlEvidencia())
                .descripcion(e.getDescripcion())
                .build();
    }

    private RegistroTecnicoDTO toRegistroDTO(Infraestructura infra, Seguridad seguridad, List<EvidenciaDTO> evidencias) {
        return RegistroTecnicoDTO.builder()
                .plataforma(infra.getPlataforma())
                .tipoServidor(infra.getTipoServidor())
                .sistemaOperativo(infra.getSistemaOperativo())
                .versionSO(infra.getVersionSo())
                .ipPrivada(infra.getIpPrivada())
                .proxmox(infra.getProxmox())
                .backup(infra.getBackup())
                .frecuenciaBackup(infra.getFrecuenciaBackup())
                .observacionesInfra(infra.getObservacionesInfra())
                .ambiente(infra.getAmbiente())
                .servidor(infra.getServidor())
                .puerto(infra.getPuerto() == null ? null : String.valueOf(infra.getPuerto()))
                .dominio(infra.getDominio())
                .servidorWeb(infra.getServidorWeb())
                .proxy(infra.getProxyReverso())
                .docker(infra.getDocker())
                .compose(infra.getDockerCompose())
                .exposicion(infra.getExposicion())
                .cicd(infra.getCicd())
                .ssl(seguridad == null ? null : seguridad.getSslTls())
                .autenticacion(seguridad == null ? null : seguridad.getMetodoAutenticacion())
                .mfa(seguridad == null ? null : seguridad.getMfa())
                .logs(seguridad == null ? null : seguridad.getLogs())
                .cifrado(seguridad == null ? null : seguridad.getCifrado())
                .restriccionIp(seguridad == null ? null : seguridad.getRestriccionIp())
                .sesiones(seguridad == null ? null : seguridad.getControlSesiones())
                .evidences(evidencias)
                .estado(infra.getEstadoRegistro())
                .ultimoPaso(infra.getUltimoPaso())
                .build();
    }
}

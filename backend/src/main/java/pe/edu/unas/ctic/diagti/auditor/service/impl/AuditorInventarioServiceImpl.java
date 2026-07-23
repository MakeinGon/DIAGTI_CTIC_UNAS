package pe.edu.unas.ctic.diagti.auditor.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorObservacionDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaInventarioDTO;
import pe.edu.unas.ctic.diagti.auditor.mapper.AuditorMapper;
import pe.edu.unas.ctic.diagti.auditor.repository.AuditorAuditoriaRepository;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorInventarioService;
import pe.edu.unas.ctic.diagti.director.entity.*;
import pe.edu.unas.ctic.diagti.director.repository.*;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;
import pe.edu.unas.ctic.diagti.director.support.DirectorEstados;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditorInventarioServiceImpl implements AuditorInventarioService {

    private final DirectorSistemaRepository sistemaRepository;
    private final ObservacionRepository observacionRepository;
    private final ValidacionRepository validacionRepository;
    private final DirectorArquitecturaRepository arquitecturaRepository;
    private final DirectorInfraestructuraRepository infraestructuraRepository;
    private final DirectorSeguridadRepository seguridadRepository;
    private final DirectorIntegracionRepository integracionRepository;
    private final DirectorEvidenciaRepository evidenciaRepository;
    private final AuditorAuditoriaRepository auditoriaRepository;
    private final LoginUsuarioRepository usuarioRepository;
    private final DirectorCatalogHelper catalogHelper;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    @Transactional(readOnly = true)
    public List<AuditorSistemaInventarioDTO> listar(String nombre, String codigo, String area,
                                                    String estado, String criticidad) {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        if (sistemas == null || sistemas.isEmpty()) {
            return List.of();
        }
        sistemas.forEach(s -> Hibernate.initialize(s.getObservaciones()));

        return sistemas.stream()
                .filter(s -> matchesText(nombre, s.getNombre()))
                .filter(s -> matchesText(codigo, s.getCodigoUnico()))
                .filter(s -> DirectorTexto.matchesFilter(area, catalogHelper.valorCatalogo(s.getIdAreaUsuario())))
                .filter(s -> DirectorTexto.matchesFilter(estado, DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo())))
                .filter(s -> DirectorTexto.matchesFilter(criticidad, catalogHelper.valorCatalogo(s.getIdCriticidad())))
                .map(this::toInventario)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AuditorSistemaDetalleDTO obtenerDetalle(Long sistemaId) {
        SistemaEntity sistema = sistemaRepository.findActivoById(sistemaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sistema no encontrado"));

        Hibernate.initialize(sistema.getValidaciones());
        Hibernate.initialize(sistema.getObservaciones());

        AuditorSistemaDetalleDTO dto = new AuditorSistemaDetalleDTO();
        dto.setSistemaId(sistema.getIdSistema());
        dto.setCodigo(sistema.getCodigoUnico());
        dto.setNombre(sistema.getNombre());
        dto.setDescripcion(DirectorTexto.safe(sistema.getDescripcion()));
        dto.setArea(catalogHelper.valorCatalogo(sistema.getIdAreaUsuario()));
        dto.setTipo(catalogHelper.valorCatalogo(sistema.getIdTipoAplicativo()));
        dto.setCriticidad(catalogHelper.valorCatalogo(sistema.getIdCriticidad()));
        dto.setEstado(DirectorEstados.normalizarEstadoSistema(sistema.getEstadoFlujo()));
        dto.setEstadoValidacion(DirectorEstados.normalizarEstadoSistema(sistema.getEstadoValidacion()));
        dto.setResponsableTecnico(catalogHelper.nombreUsuario(sistema.getIdResponsableTecnico()));
        dto.setResponsableFuncional(catalogHelper.nombreUsuario(sistema.getIdResponsableFuncional()));
        dto.setDesarrolladorNombre(DirectorTexto.safe(sistema.getDesarrolladorNombre()));
        dto.setFormaAdquisicion(DirectorTexto.safe(sistema.getFormaAdquisicion()));
        dto.setAnoAdquisicion(sistema.getAnoAdquisicion());
        dto.setContratoVigente(Boolean.TRUE.equals(sistema.getContratoVigente()));
        dto.setFechaVencimientoSoporte(sistema.getFechaVencimientoSoporte() == null
                ? null : sistema.getFechaVencimientoSoporte().toString());
        dto.setNivelRiesgo(DirectorTexto.safe(sistema.getNivelRiesgo()));
        dto.setPrioridadMigracion(DirectorTexto.safe(sistema.getPrioridadMigracion()));
        dto.setSistemaPendiente(DirectorEstados.esPendienteFlujo(sistema.getEstadoFlujo())
                || Boolean.TRUE.equals(sistema.getEsLegacy()));
        dto.setFechaCreacion(format(sistema.getFechaCreacion()));
        dto.setFechaActualizacion(format(sistema.getFechaActualizacion()));

        List<ObservacionEntity> observaciones = observacionRepository.findByIdSistema(sistemaId);
        dto.setCantidadObservaciones(observaciones.size());
        dto.setObservaciones(observaciones.stream().map(this::toObs).collect(Collectors.toList()));

        List<InfraestructuraEntity> infra = infraestructuraRepository.findByIdSistema(sistemaId);
        dto.setResultadoInfraestructura(infra.isEmpty()
                ? "Sin evaluación"
                : DirectorTexto.safe(infra.get(0).getCapacidadRecursos()));
        dto.setInfraestructura(infra.stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idInfraestructura", i.getIdInfraestructura());
            m.put("capacidadRecursos", DirectorTexto.safe(i.getCapacidadRecursos()));
            m.put("fechaCreacion", format(i.getFechaCreacion()));
            return m;
        }).collect(Collectors.toList()));

        dto.setArquitectura(arquitecturaRepository.findByIdSistema(sistemaId).stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idArquitectura", a.getIdArquitectura());
            m.put("tipoArquitectura", DirectorTexto.safe(a.getTipoArquitectura()));
            m.put("patronArquitectonico", DirectorTexto.safe(a.getPatronArquitectonico()));
            m.put("descripcionTecnica", DirectorTexto.safe(a.getDescripcionTecnica()));
            return m;
        }).collect(Collectors.toList()));

        dto.setSeguridad(seguridadRepository.findByIdSistema(sistemaId).stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idSeguridad", s.getIdSeguridad());
            m.put("tipoControl", DirectorTexto.safe(s.getTipoControl()));
            m.put("mecanismoAutenticacion", DirectorTexto.safe(s.getMecanismoAutenticacion()));
            return m;
        }).collect(Collectors.toList()));

        dto.setIntegraciones(integracionRepository.findByIdSistemaOrigen(sistemaId).stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idIntegracion", i.getIdIntegracion());
            m.put("idSistemaDestino", i.getIdSistemaDestino());
            m.put("protocolo", DirectorTexto.safe(i.getProtocolo()));
            m.put("estado", DirectorTexto.safe(i.getEstado()));
            return m;
        }).collect(Collectors.toList()));

        dto.setEvidencias(evidenciaRepository.findByIdSistema(sistemaId).stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idEvidencia", e.getIdEvidencia());
            m.put("tipoEvidencia", DirectorTexto.safe(e.getTipoEvidencia()));
            m.put("nombreArchivo", DirectorTexto.safe(e.getNombreArchivo()));
            m.put("estadoEvidencia", DirectorTexto.safe(e.getEstadoEvidencia()));
            m.put("fechaCarga", format(e.getFechaCarga()));
            return m;
        }).collect(Collectors.toList()));

        dto.setValidaciones(validacionRepository.findByIdSistema(sistemaId).stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idValidacion", v.getIdValidacion());
            m.put("estadoValidacion", DirectorTexto.upper(v.getEstadoValidacion()));
            m.put("resultado", DirectorTexto.safe(v.getResultado()));
            m.put("fechaValidacion", format(v.getFechaValidacion()));
            m.put("fechaCreacion", format(v.getFechaCreacion()));
            return m;
        }).collect(Collectors.toList()));

        String codigo = DirectorTexto.safe(sistema.getCodigoUnico());
        Map<Long, Usuario> usuarios = usuarioRepository.findAll().stream()
                .collect(Collectors.toMap(Usuario::getIdUsuario, u -> u, (a, b) -> a));
        List<AuditorAuditoriaResponseDTO> auditoria = auditoriaRepository.findAllOrderByFechaDesc().stream()
                .filter(a -> {
                    String desc = DirectorTexto.safe(a.getDescripcion());
                    return desc.contains(codigo)
                            || desc.contains("sistema_id=" + sistemaId)
                            || desc.contains("id_sistema=" + sistemaId);
                })
                .limit(20)
                .map(a -> AuditorMapper.toResponseDTO(a, a.getIdUsuario() == null ? null : usuarios.get(a.getIdUsuario())))
                .collect(Collectors.toList());
        dto.setAuditoria(auditoria);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> obtenerKpis() {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        long pendientes = sistemas.stream()
                .filter(s -> DirectorEstados.esPendienteFlujo(s.getEstadoFlujo()) || Boolean.TRUE.equals(s.getEsLegacy()))
                .count();
        long riesgo = sistemas.stream()
                .filter(s -> {
                    String r = DirectorTexto.upper(s.getNivelRiesgo());
                    return "ALTO".equals(r) || "CRITICO".equals(r);
                })
                .count();
        long contrato = sistemas.stream().filter(s -> Boolean.TRUE.equals(s.getContratoVigente())).count();

        Map<String, Long> kpis = new LinkedHashMap<>();
        kpis.put("total", (long) sistemas.size());
        kpis.put("pendientes", pendientes);
        kpis.put("legacy", pendientes);
        kpis.put("riesgo", riesgo);
        kpis.put("contrato", contrato);
        return kpis;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditorObservacionDTO> listarObservaciones(Long sistemaId, String origen) {
        List<ObservacionEntity> obs = sistemaId == null
                ? observacionRepository.findAll()
                : observacionRepository.findByIdSistema(sistemaId);
        return obs.stream()
                .map(this::toObs)
                .filter(o -> origen == null || origen.isBlank()
                        || DirectorTexto.upper(origen).equals(DirectorTexto.upper(o.getOrigen())))
                .collect(Collectors.toList());
    }

    private AuditorSistemaInventarioDTO toInventario(SistemaEntity s) {
        AuditorSistemaInventarioDTO dto = new AuditorSistemaInventarioDTO();
        dto.setSistemaId(s.getIdSistema());
        dto.setCodigo(s.getCodigoUnico());
        dto.setNombre(s.getNombre());
        dto.setDescripcion(DirectorTexto.safe(s.getDescripcion()));
        dto.setArea(catalogHelper.valorCatalogo(s.getIdAreaUsuario()));
        dto.setTipo(catalogHelper.valorCatalogo(s.getIdTipoAplicativo()));
        dto.setCriticidad(catalogHelper.valorCatalogo(s.getIdCriticidad()));
        dto.setEstado(DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo()));
        dto.setEstadoValidacion(DirectorEstados.normalizarEstadoSistema(s.getEstadoValidacion()));
        dto.setResponsableTecnico(catalogHelper.nombreUsuario(s.getIdResponsableTecnico()));
        dto.setResponsableFuncional(catalogHelper.nombreUsuario(s.getIdResponsableFuncional()));
        dto.setCantidadObservaciones(s.getObservaciones() == null ? 0 : s.getObservaciones().size());
        dto.setNivelRiesgo(DirectorTexto.safe(s.getNivelRiesgo()));
        dto.setSistemaPendiente(DirectorEstados.esPendienteFlujo(s.getEstadoFlujo())
                || Boolean.TRUE.equals(s.getEsLegacy()));
        dto.setContratoVigente(Boolean.TRUE.equals(s.getContratoVigente()));
        dto.setFechaCreacion(format(s.getFechaCreacion()));
        dto.setFechaActualizacion(format(s.getFechaActualizacion()));
        return dto;
    }

    private AuditorObservacionDTO toObs(ObservacionEntity o) {
        AuditorObservacionDTO dto = new AuditorObservacionDTO();
        dto.setObservacionId(o.getIdObservacion());
        dto.setSistemaId(o.getIdSistema());
        dto.setValidacionId(o.getIdValidacion());
        dto.setOrigen(DirectorEstados.origenDesdeDescripcion(o.getDescripcion()));
        dto.setDescripcion(DirectorTexto.safe(o.getDescripcion()));
        dto.setEstado(DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion()));
        dto.setFechaCreacion(format(o.getFechaObservacion()));
        dto.setRespuestaSubsanacion(DirectorTexto.safe(o.getRespuestaSubsanacion()));
        dto.setFechaAtencion(format(o.getFechaSubsanacion()));
        dto.setResultadoRevision(DirectorTexto.safe(o.getEstadoObservacion()));
        return dto;
    }

    private boolean matchesText(String filtro, String valor) {
        if (filtro == null || filtro.isBlank()) {
            return true;
        }
        return DirectorTexto.normalize(valor).contains(DirectorTexto.normalize(filtro));
    }

    private String format(java.time.LocalDateTime value) {
        return value == null ? null : value.format(ISO);
    }
}

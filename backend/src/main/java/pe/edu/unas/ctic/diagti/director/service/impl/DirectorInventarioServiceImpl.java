package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.director.dto.ActividadRecienteDTO;
import pe.edu.unas.ctic.diagti.director.dto.ObservacionConsolidadaDTO;
import pe.edu.unas.ctic.diagti.director.dto.SistemaDetalleDirectorDTO;
import pe.edu.unas.ctic.diagti.director.dto.SistemaInventarioDTO;
import pe.edu.unas.ctic.diagti.director.entity.*;
import pe.edu.unas.ctic.diagti.director.repository.*;
import pe.edu.unas.ctic.diagti.director.service.DirectorInventarioService;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;
import pe.edu.unas.ctic.diagti.director.support.DirectorEstados;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DirectorInventarioServiceImpl implements DirectorInventarioService {

    private final DirectorSistemaRepository sistemaRepository;
    private final ObservacionRepository observacionRepository;
    private final ValidacionRepository validacionRepository;
    private final DirectorArquitecturaRepository arquitecturaRepository;
    private final DirectorInfraestructuraRepository infraestructuraRepository;
    private final DirectorSeguridadRepository seguridadRepository;
    private final DirectorIntegracionRepository integracionRepository;
    private final DirectorEvidenciaRepository evidenciaRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final DirectorCatalogHelper catalogHelper;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    @Transactional(readOnly = true)
    public List<SistemaInventarioDTO> listar(String area, String criticidad, String estado, String busqueda) {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        if (sistemas == null) {
            return List.of();
        }
        sistemas.forEach(s -> {
            Hibernate.initialize(s.getValidaciones());
            Hibernate.initialize(s.getObservaciones());
        });

        return sistemas.stream()
                .filter(s -> DirectorTexto.matchesFilter(area, catalogHelper.valorCatalogo(s.getIdAreaUsuario())))
                .filter(s -> DirectorTexto.matchesFilter(criticidad, catalogHelper.valorCatalogo(s.getIdCriticidad())))
                .filter(s -> DirectorTexto.matchesFilter(estado, s.getEstadoValidacion()))
                .filter(s -> {
                    if (busqueda == null || busqueda.isBlank()) {
                        return true;
                    }
                    String q = DirectorTexto.normalize(busqueda);
                    return DirectorTexto.normalize(s.getCodigoUnico()).contains(q)
                            || DirectorTexto.normalize(s.getNombre()).contains(q);
                })
                .map(this::toInventario)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SistemaDetalleDirectorDTO obtenerDetalle(Long sistemaId) {
        SistemaEntity sistema = sistemaRepository.findActivoById(sistemaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sistema no encontrado"));

        Hibernate.initialize(sistema.getValidaciones());
        Hibernate.initialize(sistema.getObservaciones());

        SistemaDetalleDirectorDTO dto = new SistemaDetalleDirectorDTO();
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
        dto.setNivelRiesgo(DirectorTexto.safe(sistema.getNivelRiesgo()));
        dto.setEsLegacy(Boolean.TRUE.equals(sistema.getEsLegacy()));
        dto.setContratoVigente(Boolean.TRUE.equals(sistema.getContratoVigente()));
        dto.setFechaCreacion(sistema.getFechaCreacion() == null ? null : sistema.getFechaCreacion().format(ISO));
        dto.setFechaActualizacion(sistema.getFechaActualizacion() == null ? null : sistema.getFechaActualizacion().format(ISO));

        List<ObservacionEntity> observaciones = observacionRepository.findByIdSistema(sistemaId);
        dto.setCantidadObservaciones(observaciones.size());
        dto.setObservaciones(observaciones.stream().map(o -> toObs(o, sistema)).collect(Collectors.toList()));

        List<InfraestructuraEntity> infra = infraestructuraRepository.findByIdSistema(sistemaId);
        dto.setResultadoInfraestructura(infra.isEmpty()
                ? "Sin evaluación"
                : DirectorTexto.safe(infra.get(0).getCapacidadRecursos()));
        dto.setInfraestructura(infra.stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idInfraestructura", i.getIdInfraestructura());
            m.put("capacidadRecursos", DirectorTexto.safe(i.getCapacidadRecursos()));
            m.put("fechaCreacion", i.getFechaCreacion() == null ? null : i.getFechaCreacion().format(ISO));
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
            m.put("fechaCarga", e.getFechaCarga() == null ? null : e.getFechaCarga().format(ISO));
            return m;
        }).collect(Collectors.toList()));

        dto.setValidaciones(validacionRepository.findByIdSistema(sistemaId).stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idValidacion", v.getIdValidacion());
            m.put("estadoValidacion", DirectorTexto.upper(v.getEstadoValidacion()));
            m.put("resultado", DirectorTexto.safe(v.getResultado()));
            m.put("fechaValidacion", v.getFechaValidacion() == null ? null : v.getFechaValidacion().format(ISO));
            m.put("fechaCreacion", v.getFechaCreacion() == null ? null : v.getFechaCreacion().format(ISO));
            return m;
        }).collect(Collectors.toList()));

        String codigo = DirectorTexto.safe(sistema.getCodigoUnico());
        List<AuditoriaEntity> auditoria = auditoriaRepository.findTop100ByOrderByFechaEventoDesc().stream()
                .filter(a -> {
                    String desc = DirectorTexto.safe(a.getDescripcion());
                    return desc.contains(codigo) || desc.contains("sistema_id=" + sistemaId)
                            || desc.contains("id_sistema=" + sistemaId);
                })
                .limit(20)
                .toList();
        dto.setAuditoria(auditoria.stream().map(a -> {
            ActividadRecienteDTO act = new ActividadRecienteDTO();
            act.setId(a.getIdAuditoria());
            act.setModulo(DirectorTexto.safe(a.getModulo()));
            act.setAccion(DirectorTexto.safe(a.getAccion()));
            act.setDescripcion(DirectorTexto.safe(a.getDescripcion()));
            act.setFecha(a.getFechaEvento() == null ? null : a.getFechaEvento().format(ISO));
            return act;
        }).collect(Collectors.toList()));

        return dto;
    }

    private SistemaInventarioDTO toInventario(SistemaEntity s) {
        SistemaInventarioDTO dto = new SistemaInventarioDTO();
        dto.setSistemaId(s.getIdSistema());
        dto.setCodigo(s.getCodigoUnico());
        dto.setNombre(s.getNombre());
        dto.setDescripcion(DirectorTexto.safe(s.getDescripcion()));
        dto.setArea(catalogHelper.valorCatalogo(s.getIdAreaUsuario()));
        dto.setCriticidad(catalogHelper.valorCatalogo(s.getIdCriticidad()));
        dto.setEstado(DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo()));
        dto.setEstadoValidacion(DirectorEstados.normalizarEstadoSistema(s.getEstadoValidacion()));
        dto.setResponsableTecnico(catalogHelper.nombreUsuario(s.getIdResponsableTecnico()));
        dto.setResponsableFuncional(catalogHelper.nombreUsuario(s.getIdResponsableFuncional()));
        dto.setCantidadObservaciones(s.getObservaciones() == null ? 0 : s.getObservaciones().size());
        List<InfraestructuraEntity> infra = infraestructuraRepository.findByIdSistema(s.getIdSistema());
        dto.setResultadoInfraestructura(infra.isEmpty() ? "Sin evaluación" : "Registrada");
        dto.setFechaCreacion(s.getFechaCreacion() == null ? null : s.getFechaCreacion().format(ISO));
        dto.setFechaActualizacion(s.getFechaActualizacion() == null ? null : s.getFechaActualizacion().format(ISO));
        return dto;
    }

    private ObservacionConsolidadaDTO toObs(ObservacionEntity o, SistemaEntity s) {
        ObservacionConsolidadaDTO dto = new ObservacionConsolidadaDTO();
        dto.setObservacionId(o.getIdObservacion());
        dto.setSistemaId(o.getIdSistema());
        dto.setCodigoSistema(s.getCodigoUnico());
        dto.setNombreSistema(s.getNombre());
        dto.setDescripcion(DirectorTexto.safe(o.getDescripcion()));
        dto.setOrigen(DirectorEstados.origenDesdeDescripcion(o.getDescripcion()));
        dto.setEstado(DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion()));
        dto.setFecha(o.getFechaObservacion() == null ? null : o.getFechaObservacion().format(ISO));
        dto.setRespuestaSubsanacion(DirectorTexto.safe(o.getRespuestaSubsanacion()));
        dto.setResultadoRevision(DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion()));
        return dto;
    }
}

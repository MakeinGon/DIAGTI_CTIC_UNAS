package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.director.dto.*;
import pe.edu.unas.ctic.diagti.director.entity.InfraestructuraEntity;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.mapper.SistemaMapper;
import pe.edu.unas.ctic.diagti.director.repository.DirectorInfraestructuraRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.service.DashboardService;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;
import pe.edu.unas.ctic.diagti.director.support.DirectorEstados;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DirectorSistemaRepository sistemaRepository;
    private final ObservacionRepository observacionRepository;
    private final DirectorInfraestructuraRepository infraestructuraRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final SistemaMapper sistemaMapper;
    private final DirectorCatalogHelper catalogHelper;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final Map<String, String> CRITICIDAD_COLORS = Map.of(
            "alta", "#e49a18",
            "media", "#4f7fa4",
            "baja", "#1abb9c",
            "critica", "#cf2d35",
            "no-especificada", "#94a3b8"
    );

    @Override
    @Transactional(readOnly = true)
    public DashboardKpiDTO obtenerKpis() {
        List<SistemaEntity> sistemas = cargarSistemasActivos();
        DashboardKpiDTO kpi = new DashboardKpiDTO();
        kpi.setTotalSistemas(sistemas.size());

        int validados = 0, observados = 0, pendientes = 0, enValidacion = 0, borrador = 0, subsanados = 0;
        for (SistemaEntity s : sistemas) {
            String estado = DirectorEstados.normalizarEstadoSistema(s.getEstadoValidacion());
            switch (estado) {
                case DirectorEstados.VALIDADO -> validados++;
                case DirectorEstados.OBSERVADO -> observados++;
                case DirectorEstados.EN_VALIDACION, DirectorEstados.ENVIADO -> enValidacion++;
                case DirectorEstados.BORRADOR -> borrador++;
                case DirectorEstados.SUBSANADO -> subsanados++;
                default -> pendientes++;
            }
        }
        // "pendientes" del frontend: todo lo no validado/observado
        pendientes = sistemas.size() - validados - observados;

        kpi.setValidados(validados);
        kpi.setObservados(observados);
        kpi.setPendientes(Math.max(pendientes, 0));
        kpi.setEnValidacion(enValidacion);
        kpi.setBorrador(borrador);
        kpi.setSubsanados(subsanados);

        List<Long> ids = sistemas.stream().map(SistemaEntity::getIdSistema).toList();
        List<ObservacionEntity> observaciones = ids.isEmpty()
                ? List.of()
                : observacionRepository.findByIdSistemaIn(ids);

        int obsPend = 0, obsRev = 0, obsAten = 0, obsVal = 0, obsInfra = 0;
        Set<Long> sistemasConObsAbiertas = new HashSet<>();
        for (ObservacionEntity o : observaciones) {
            String est = DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion());
            if (DirectorEstados.OBS_PENDIENTE.equals(est)) {
                obsPend++;
                sistemasConObsAbiertas.add(o.getIdSistema());
            } else if (DirectorEstados.OBS_EN_REVISION.equals(est)) {
                obsRev++;
                sistemasConObsAbiertas.add(o.getIdSistema());
            } else if (DirectorEstados.OBS_ATENDIDA.equals(est) || DirectorEstados.OBS_APROBADA.equals(est)) {
                obsAten++;
            }
            String origen = DirectorEstados.origenDesdeDescripcion(o.getDescripcion());
            if (DirectorEstados.ORIGEN_VALIDACION.equals(origen)) {
                obsVal++;
            } else if (DirectorEstados.ORIGEN_INFRAESTRUCTURA.equals(origen)) {
                obsInfra++;
            }
        }
        kpi.setObservacionesPendientes(obsPend);
        kpi.setObservacionesEnRevision(obsRev);
        kpi.setObservacionesAtendidas(obsAten);
        kpi.setObservacionesValidacion(obsVal);
        kpi.setObservacionesInfraestructura(obsInfra);
        kpi.setSistemasConRiesgo((int) sistemas.stream()
                .filter(s -> sistemasConObsAbiertas.contains(s.getIdSistema())
                        || DirectorEstados.OBSERVADO.equals(DirectorEstados.normalizarEstadoSistema(s.getEstadoValidacion()))
                        || Boolean.TRUE.equals(s.getEsLegacy()))
                .count());
        return kpi;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumenValidacionDTO> obtenerResumenValidacion() {
        List<SistemaEntity> sistemas = cargarSistemasActivos();
        Map<String, Long> counts = sistemas.stream()
                .collect(Collectors.groupingBy(
                        s -> DirectorEstados.normalizarEstadoSistema(s.getEstadoValidacion()).toLowerCase(),
                        Collectors.counting()));

        return counts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    ResumenValidacionDTO dto = new ResumenValidacionDTO();
                    dto.setEstado(e.getKey());
                    dto.setCantidad(e.getValue().intValue());
                    dto.setColor(switch (e.getKey()) {
                        case "validado" -> "#1abb9c";
                        case "observado" -> "#e7a52d";
                        default -> "#5f88a8";
                    });
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CriticidadDTO> obtenerCriticidades() {
        List<SistemaEntity> sistemas = cargarSistemasActivos();
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("alta", 0L);
        counts.put("media", 0L);
        counts.put("baja", 0L);

        for (SistemaEntity s : sistemas) {
            String key = DirectorTexto.normalize(catalogHelper.valorCatalogo(s.getIdCriticidad()));
            if (!counts.containsKey(key)) {
                counts.put(key, 0L);
            }
            counts.put(key, counts.get(key) + 1);
        }

        return counts.entrySet().stream()
                .map(e -> {
                    CriticidadDTO dto = new CriticidadDTO();
                    dto.setNivel(e.getKey());
                    dto.setCantidad(e.getValue().intValue());
                    dto.setColor(CRITICIDAD_COLORS.getOrDefault(e.getKey(), "#1abb9c"));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SistemaResumenDTO> obtenerSistemasFiltrados(String area, String criticidad, String validacion, String busqueda) {
        List<SistemaEntity> sistemas = cargarSistemasActivos();

        return sistemas.stream()
                .filter(s -> DirectorTexto.matchesFilter(area, catalogHelper.valorCatalogo(s.getIdAreaUsuario())))
                .filter(s -> DirectorTexto.matchesFilter(criticidad, catalogHelper.valorCatalogo(s.getIdCriticidad())))
                .filter(s -> DirectorTexto.matchesFilter(validacion, s.getEstadoValidacion()))
                .filter(s -> {
                    if (busqueda == null || busqueda.isBlank()) {
                        return true;
                    }
                    String q = DirectorTexto.normalize(busqueda);
                    return DirectorTexto.normalize(s.getCodigoUnico()).contains(q)
                            || DirectorTexto.normalize(s.getNombre()).contains(q);
                })
                .map(s -> {
                    List<InfraestructuraEntity> infra = infraestructuraRepository.findByIdSistema(s.getIdSistema());
                    return sistemaMapper.toResumenDTO(s, infra);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActividadRecienteDTO> obtenerActividadReciente() {
        List<AuditoriaEntity> rows = auditoriaRepository.findTop100ByOrderByFechaEventoDesc();
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        return rows.stream().limit(20).map(a -> {
            ActividadRecienteDTO dto = new ActividadRecienteDTO();
            dto.setId(a.getIdAuditoria());
            dto.setModulo(DirectorTexto.safe(a.getModulo()));
            dto.setAccion(DirectorTexto.safe(a.getAccion()));
            dto.setDescripcion(DirectorTexto.safe(a.getDescripcion()));
            dto.setFecha(a.getFechaEvento() == null ? null : a.getFechaEvento().format(ISO));
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ObservacionConsolidadaDTO> obtenerObservacionesConsolidadas(String origen, String estado) {
        List<SistemaEntity> sistemas = cargarSistemasActivos();
        Map<Long, SistemaEntity> byId = sistemas.stream()
                .collect(Collectors.toMap(SistemaEntity::getIdSistema, s -> s, (a, b) -> a));
        List<Long> ids = new ArrayList<>(byId.keySet());
        if (ids.isEmpty()) {
            return List.of();
        }

        return observacionRepository.findByIdSistemaIn(ids).stream()
                .filter(o -> {
                    String oOrigen = DirectorEstados.origenDesdeDescripcion(o.getDescripcion());
                    return DirectorTexto.matchesFilter(origen, oOrigen);
                })
                .filter(o -> DirectorTexto.matchesFilter(estado, o.getEstadoObservacion()))
                .map(o -> toObservacionDTO(o, byId.get(o.getIdSistema())))
                .collect(Collectors.toList());
    }

    private ObservacionConsolidadaDTO toObservacionDTO(ObservacionEntity o, SistemaEntity s) {
        ObservacionConsolidadaDTO dto = new ObservacionConsolidadaDTO();
        dto.setObservacionId(o.getIdObservacion());
        dto.setSistemaId(o.getIdSistema());
        dto.setCodigoSistema(s != null ? s.getCodigoUnico() : "");
        dto.setNombreSistema(s != null ? s.getNombre() : "");
        dto.setDescripcion(DirectorTexto.safe(o.getDescripcion()));
        dto.setOrigen(DirectorEstados.origenDesdeDescripcion(o.getDescripcion()));
        dto.setEstado(DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion()));
        dto.setFecha(o.getFechaObservacion() == null ? null : o.getFechaObservacion().format(ISO));
        dto.setRespuestaSubsanacion(DirectorTexto.safe(o.getRespuestaSubsanacion()));
        dto.setResultadoRevision(DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion()));
        return dto;
    }

    private List<SistemaEntity> cargarSistemasActivos() {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        if (sistemas == null) {
            return List.of();
        }
        sistemas.forEach(s -> {
            Hibernate.initialize(s.getValidaciones());
            Hibernate.initialize(s.getObservaciones());
        });
        return sistemas;
    }
}

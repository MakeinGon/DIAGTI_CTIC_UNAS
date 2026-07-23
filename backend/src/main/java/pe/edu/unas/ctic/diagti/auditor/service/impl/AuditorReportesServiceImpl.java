package pe.edu.unas.ctic.diagti.auditor.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorReporteResumenDTO;
import pe.edu.unas.ctic.diagti.auditor.repository.AuditorAuditoriaRepository;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorReportesService;
import pe.edu.unas.ctic.diagti.director.entity.InfraestructuraEntity;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorInfraestructuraRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;
import pe.edu.unas.ctic.diagti.director.support.DirectorEstados;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditorReportesServiceImpl implements AuditorReportesService {

    private final DirectorSistemaRepository sistemaRepository;
    private final ObservacionRepository observacionRepository;
    private final ValidacionRepository validacionRepository;
    private final DirectorInfraestructuraRepository infraestructuraRepository;
    private final DirectorEvidenciaRepository evidenciaRepository;
    private final AuditorAuditoriaRepository auditoriaRepository;
    private final DirectorCatalogHelper catalogHelper;

    @Override
    @Transactional(readOnly = true)
    public AuditorReporteResumenDTO obtenerResumen() {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        sistemas.forEach(s -> Hibernate.initialize(s.getObservaciones()));

        List<ObservacionEntity> observaciones = observacionRepository.findAll();
        List<AuditoriaEntity> auditorias = auditoriaRepository.findAll();
        List<ValidacionEntity> validaciones = validacionRepository.findAll();
        List<InfraestructuraEntity> infraestructuras = infraestructuraRepository.findAll();

        AuditorReporteResumenDTO dto = new AuditorReporteResumenDTO();
        dto.setTotalSistemas(sistemas.size());
        dto.setSistemasPendientes((int) sistemas.stream()
                .filter(s -> DirectorEstados.esPendienteFlujo(s.getEstadoFlujo())).count());
        dto.setSistemasObservados((int) sistemas.stream()
                .filter(s -> DirectorEstados.OBSERVADO.equals(DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo())))
                .count());
        dto.setSistemasValidados((int) sistemas.stream()
                .filter(s -> DirectorEstados.VALIDADO.equals(DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo())))
                .count());
        dto.setTotalObservaciones(observaciones.size());
        dto.setTotalAuditoria(auditorias.size());

        dto.setPorEstado(contar(sistemas.stream()
                .map(s -> DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo()))
                .collect(Collectors.toList())));
        dto.setPorCriticidad(contar(sistemas.stream()
                .map(s -> catalogHelper.valorCatalogo(s.getIdCriticidad()))
                .collect(Collectors.toList())));
        dto.setPorArea(contar(sistemas.stream()
                .map(s -> catalogHelper.valorCatalogo(s.getIdAreaUsuario()))
                .collect(Collectors.toList())));
        dto.setObservacionesPorEstado(contar(observaciones.stream()
                .map(o -> DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion()))
                .collect(Collectors.toList())));
        dto.setObservacionesPorOrigen(contar(observaciones.stream()
                .map(o -> DirectorEstados.origenDesdeDescripcion(o.getDescripcion()))
                .collect(Collectors.toList())));
        dto.setActividadAuditoria(contar(auditorias.stream()
                .map(a -> DirectorTexto.safe(a.getAccion()))
                .filter(a -> !a.isBlank())
                .collect(Collectors.toList())));

        dto.setSistemasConMasObservaciones(sistemas.stream()
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("sistemaId", s.getIdSistema());
                    m.put("codigo", s.getCodigoUnico());
                    m.put("nombre", s.getNombre());
                    m.put("cantidadObservaciones", s.getObservaciones() == null ? 0 : s.getObservaciones().size());
                    return m;
                })
                .sorted(Comparator.comparingInt(m -> -((Integer) m.get("cantidadObservaciones"))))
                .limit(10)
                .collect(Collectors.toList()));

        dto.setResultadosValidacion(validaciones.stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idValidacion", v.getIdValidacion());
            m.put("sistemaId", v.getIdSistema());
            m.put("estadoValidacion", DirectorTexto.upper(v.getEstadoValidacion()));
            m.put("resultado", DirectorTexto.safe(v.getResultado()));
            return m;
        }).collect(Collectors.toList()));

        dto.setResultadosInfraestructura(infraestructuras.stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idInfraestructura", i.getIdInfraestructura());
            m.put("sistemaId", i.getIdSistema());
            m.put("capacidadRecursos", DirectorTexto.safe(i.getCapacidadRecursos()));
            return m;
        }).collect(Collectors.toList()));

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerDatos(String tipo) {
        String t = tipo == null ? "" : tipo.trim().toLowerCase(Locale.ROOT);
        return switch (t) {
            case "sistemas" -> sistemas();
            case "auditoria" -> auditoria();
            case "observaciones" -> observaciones();
            case "validaciones" -> validaciones();
            case "evidencias" -> evidencias();
            default -> List.of();
        };
    }

    private List<Map<String, Object>> sistemas() {
        return sistemaRepository.findAllActivos().stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("sistemaId", s.getIdSistema());
            m.put("codigo", s.getCodigoUnico());
            m.put("nombre", s.getNombre());
            m.put("descripcion", DirectorTexto.safe(s.getDescripcion()));
            m.put("area", catalogHelper.valorCatalogo(s.getIdAreaUsuario()));
            m.put("criticidad", catalogHelper.valorCatalogo(s.getIdCriticidad()));
            m.put("estado", DirectorEstados.normalizarEstadoSistema(s.getEstadoFlujo()));
            m.put("nivelRiesgo", DirectorTexto.safe(s.getNivelRiesgo()));
            m.put("responsableTecnico", catalogHelper.nombreUsuario(s.getIdResponsableTecnico()));
            return m;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> auditoria() {
        return auditoriaRepository.findAllOrderByFechaDesc().stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idAuditoria", a.getIdAuditoria());
            m.put("modulo", DirectorTexto.safe(a.getModulo()));
            m.put("accion", DirectorTexto.safe(a.getAccion()));
            m.put("descripcion", DirectorTexto.safe(a.getDescripcion()));
            m.put("fechaEvento", a.getFechaEvento() == null ? null : a.getFechaEvento().toString());
            m.put("direccionIp", DirectorTexto.safe(a.getDireccionIp()));
            return m;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> observaciones() {
        return observacionRepository.findAll().stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("observacionId", o.getIdObservacion());
            m.put("sistemaId", o.getIdSistema());
            m.put("origen", DirectorEstados.origenDesdeDescripcion(o.getDescripcion()));
            m.put("descripcion", DirectorTexto.safe(o.getDescripcion()));
            m.put("estado", DirectorEstados.normalizarEstadoObservacion(o.getEstadoObservacion()));
            return m;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> validaciones() {
        return validacionRepository.findAll().stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idValidacion", v.getIdValidacion());
            m.put("sistemaId", v.getIdSistema());
            m.put("estadoValidacion", DirectorTexto.upper(v.getEstadoValidacion()));
            m.put("resultado", DirectorTexto.safe(v.getResultado()));
            return m;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> evidencias() {
        return evidenciaRepository.findAll().stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idEvidencia", e.getIdEvidencia());
            m.put("sistemaId", e.getIdSistema());
            m.put("tipoEvidencia", DirectorTexto.safe(e.getTipoEvidencia()));
            m.put("nombreArchivo", DirectorTexto.safe(e.getNombreArchivo()));
            m.put("estadoEvidencia", DirectorTexto.safe(e.getEstadoEvidencia()));
            return m;
        }).collect(Collectors.toList());
    }

    private Map<String, Long> contar(List<String> values) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (String v : values) {
            String key = (v == null || v.isBlank()) ? "SIN_DATO" : v;
            map.put(key, map.getOrDefault(key, 0L) + 1);
        }
        return map;
    }
}

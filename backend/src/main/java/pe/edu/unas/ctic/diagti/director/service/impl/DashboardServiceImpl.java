package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.director.dto.*;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.mapper.SistemaMapper;
import pe.edu.unas.ctic.diagti.director.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.director.service.DashboardService;
import pe.edu.unas.ctic.diagti.director.specification.SistemaSpecification;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final SistemaRepository sistemaRepository;
    private final SistemaMapper sistemaMapper;

    private static final Map<String, String> CRITICIDAD_COLORS = Map.of(
            "critica", "#cf2d35",
            "alta", "#e49a18",
            "media", "#4f7fa4",
            "baja", "#1abb9c"
    );

    @Override
    @Transactional(readOnly = true) // Mantiene la sesión activa
    public DashboardKpiDTO obtenerKpis() {
        List<SistemaEntity> todos = sistemaRepository.findAll();
        // Inicializar colecciones perezosas para evitar LazyInitializationException
        todos.forEach(s -> {
            Hibernate.initialize(s.getValidaciones());
            Hibernate.initialize(s.getObservaciones());
        });
        DashboardKpiDTO kpi = new DashboardKpiDTO();
        kpi.setTotalSistemas(todos.size());
        long validados = todos.stream().filter(s -> "VALIDADO".equalsIgnoreCase(s.getEstadoValidacion())).count();
        long observados = todos.stream().filter(s -> "OBSERVADO".equalsIgnoreCase(s.getEstadoValidacion())).count();
        long pendientes = todos.size() - validados - observados;
        kpi.setValidados((int) validados);
        kpi.setObservados((int) observados);
        kpi.setPendientes((int) pendientes);
        return kpi;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumenValidacionDTO> obtenerResumenValidacion() {
        List<SistemaEntity> todos = sistemaRepository.findAll();
        todos.forEach(s -> Hibernate.initialize(s.getValidaciones()));
        Map<String, Long> counts = todos.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getEstadoValidacion().toLowerCase(),
                        Collectors.counting()
                ));
        return counts.entrySet().stream()
                .map(e -> {
                    ResumenValidacionDTO dto = new ResumenValidacionDTO();
                    dto.setEstado(e.getKey());
                    dto.setCantidad(e.getValue().intValue());
                    switch (e.getKey()) {
                        case "validado": dto.setColor("#1abb9c"); break;
                        case "observado": dto.setColor("#e7a52d"); break;
                        default: dto.setColor("#5f88a8");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CriticidadDTO> obtenerCriticidades() {
        List<SistemaEntity> todos = sistemaRepository.findAll();
        todos.forEach(s -> Hibernate.initialize(s.getValidaciones())); // opcional
        Map<String, Long> counts = todos.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getCriticidadNombre().toLowerCase(),
                        Collectors.counting()
                ));
        List<String> todasCriticidades = Arrays.asList("critica", "alta", "media", "baja");
        for (String nivel : todasCriticidades) {
            counts.putIfAbsent(nivel, 0L);
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
        Specification<SistemaEntity> spec = (root, query, cb) -> cb.conjunction();
        if (area != null && !area.isEmpty() && !"all".equals(area)) {
            spec = spec.and(SistemaSpecification.areaEquals(area));
        }
        if (criticidad != null && !criticidad.isEmpty() && !"all".equals(criticidad)) {
            spec = spec.and(SistemaSpecification.criticidadEquals(criticidad));
        }
        if (validacion != null && !validacion.isEmpty() && !"all".equals(validacion)) {
            spec = spec.and(SistemaSpecification.validacionEquals(validacion));
        }
        if (busqueda != null && !busqueda.isEmpty()) {
            spec = spec.and(SistemaSpecification.search(busqueda));
        }
        List<SistemaEntity> sistemas = sistemaRepository.findAll(spec);
        // Inicializar colecciones perezosas necesarias para el mapper
        sistemas.forEach(s -> {
            Hibernate.initialize(s.getValidaciones());
            Hibernate.initialize(s.getObservaciones());
        });
        return sistemas.stream()
                .map(sistemaMapper::toResumenDTO)
                .collect(Collectors.toList());
    }
}
package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.dto.*;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.mapper.SistemaMapper;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.service.DashboardService;
import pe.edu.unas.ctic.diagti.director.specification.SistemaSpecification;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DirectorSistemaRepository sistemaRepository;
    private final SistemaMapper sistemaMapper;
    private final CatalogoRepository catalogoRepository;

    private static final Map<String, String> CRITICIDAD_COLORS = Map.of(
            "critica", "#cf2d35",
            "alta", "#e49a18",
            "media", "#4f7fa4",
            "baja", "#1abb9c",
            // Colores para los niveles del catálogo de criticidad
            "academico", "#cf2d35",
            "financiero", "#e49a18",
            "rrhh", "#4f7fa4",
            "administrativo", "#1abb9c",
            "misional", "#8b5cf6",
            "estrategico", "#f59e0b"
    );

    /**
     * Obtiene el nombre del área desde el catálogo usando el id_area_usuario
     */
    private String getAreaNombre(SistemaEntity sistema) {
        if (sistema == null || sistema.getIdAreaUsuario() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(sistema.getIdAreaUsuario())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    /**
     * Obtiene el nombre de la criticidad desde el catálogo usando el id_criticidad
     * NOTA: Esto devuelve "Académico", "Financiero", "RRHH", etc.
     */
    private String getCriticidadNombre(SistemaEntity sistema) {
        if (sistema == null || sistema.getIdCriticidad() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(sistema.getIdCriticidad())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardKpiDTO obtenerKpis() {
        List<SistemaEntity> todos = sistemaRepository.findAll();
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
        
        // IMPORTANTE: Usar getCriticidadNombre() que consulta el catálogo de criticidades reales
        Map<String, Long> counts = todos.stream()
                .collect(Collectors.groupingBy(
                        s -> getCriticidadNombre(s).toLowerCase(),
                        Collectors.counting()
                ));
        
        // Asegurar que todas las categorías de criticidad estén presentes
        List<String> todasCriticidades = Arrays.asList("academico", "financiero", "rrhh", "administrativo", "misional", "estrategico");
        for (String nivel : todasCriticidades) {
            counts.putIfAbsent(nivel, 0L);
        }
        
        return counts.entrySet().stream()
                .filter(e -> e.getValue() > 0) // Solo mostrar las que tienen al menos 1
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
        
        if (busqueda != null && !busqueda.isEmpty()) {
            spec = spec.and(SistemaSpecification.search(busqueda));
        }
        
        List<SistemaEntity> sistemas = sistemaRepository.findAll(spec);
        sistemas.forEach(s -> {
            Hibernate.initialize(s.getValidaciones());
            Hibernate.initialize(s.getObservaciones());
        });
        
        // Filtrar por área en memoria
        if (area != null && !area.isEmpty() && !"all".equals(area)) {
            sistemas = sistemas.stream()
                    .filter(s -> area.equalsIgnoreCase(getAreaNombre(s)))
                    .collect(Collectors.toList());
        }
        
        // Filtrar por criticidad en memoria (usando el nombre real de la criticidad)
        if (criticidad != null && !criticidad.isEmpty() && !"all".equals(criticidad)) {
            sistemas = sistemas.stream()
                    .filter(s -> criticidad.equalsIgnoreCase(getCriticidadNombre(s)))
                    .collect(Collectors.toList());
        }
        
        // Filtrar por validación en memoria
        if (validacion != null && !validacion.isEmpty() && !"all".equals(validacion)) {
            sistemas = sistemas.stream()
                    .filter(s -> validacion.equalsIgnoreCase(s.getEstadoValidacion()))
                    .collect(Collectors.toList());
        }
        
        return sistemas.stream()
                .map(sistemaMapper::toResumenDTO)
                .collect(Collectors.toList());
    }
}
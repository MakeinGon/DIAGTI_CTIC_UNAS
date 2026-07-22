package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraDashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.entity.InfraSistemaEntity;
import pe.edu.unas.ctic.diagti.infraestructura.repository.InfraSistemaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InfraDashboardServiceImpl implements InfraDashboardService {

    private final InfraSistemaRepository sistemaRepository;

    private static final List<String> ESTADOS_ORDEN = Arrays.asList("Nuevo", "Borrador", "Enviado", "Observado", "Corregido", "Validado");
    private static final List<String> RIESGOS_ORDEN = Arrays.asList("Bajo", "Medio", "Alto", "Crítico");

    @Override
    public InfraDashboardDTO getDashboardData() {
        log.info("📊 Generando datos del dashboard de infraestructura");
        
        List<InfraSistemaEntity> sistemas = sistemaRepository.findAll();
        
        // 1. Estadísticas
        InfraDashboardDTO.Estadisticas estadisticas = calcularEstadisticas(sistemas);
        
        // 2. Prioridades
        List<InfraDashboardDTO.Prioridad> prioridades = calcularPrioridades(sistemas);
        
        // 3. Riesgos
        List<InfraDashboardDTO.Riesgo> riesgos = calcularRiesgos(sistemas);
        
        // 4. Estados
        List<InfraDashboardDTO.Estado> estados = calcularEstados(sistemas);
        
        return new InfraDashboardDTO(estadisticas, prioridades, riesgos, estados);
    }

    private InfraDashboardDTO.Estadisticas calcularEstadisticas(List<InfraSistemaEntity> sistemas) {
        int total = sistemas.size();
        int nuevos = (int) sistemas.stream().filter(s -> "Nuevo".equalsIgnoreCase(s.getEstado())).count();
        int borradores = (int) sistemas.stream().filter(s -> "Borrador".equalsIgnoreCase(s.getEstado())).count();
        int observados = (int) sistemas.stream().filter(s -> "Observado".equalsIgnoreCase(s.getEstado())).count();
        int validados = (int) sistemas.stream().filter(s -> "Validado".equalsIgnoreCase(s.getEstado())).count();
        
        return new InfraDashboardDTO.Estadisticas(
            total,
            nuevos + borradores,
            nuevos,
            borradores,
            observados,
            validados
        );
    }

    private List<InfraDashboardDTO.Prioridad> calcularPrioridades(List<InfraSistemaEntity> sistemas) {
        List<String> prioridadEstados = Arrays.asList("Observado", "Corregido", "Borrador", "Nuevo");
        
        return sistemas.stream()
            .filter(s -> prioridadEstados.contains(s.getEstado()))
            .sorted((a, b) -> {
                int idxA = prioridadEstados.indexOf(a.getEstado());
                int idxB = prioridadEstados.indexOf(b.getEstado());
                return Integer.compare(idxA, idxB);
            })
            .limit(6)
            .map(s -> {
                String accion;
                String detalle;
                String url;
                
                switch (s.getEstado()) {
                    case "Nuevo":
                        accion = "Registrar";
                        detalle = "Aún no tiene registro técnico.";
                        url = "infraestructura.html?sistema=" + s.getCodigo();
                        break;
                    case "Borrador":
                        accion = "Completar";
                        detalle = "El registro está incompleto.";
                        url = "infraestructura.html?sistema=" + s.getCodigo();
                        break;
                    case "Observado":
                        accion = "Subsanar";
                        detalle = "Tiene observaciones del Validador CTIC.";
                        url = "mis-sistemas.html?estado=Observado&sistema=" + s.getCodigo();
                        break;
                    case "Corregido":
                        accion = "Revisar y enviar";
                        detalle = "La corrección está lista para revisión.";
                        url = "mis-sistemas.html?estado=Corregido&sistema=" + s.getCodigo();
                        break;
                    default:
                        accion = "Ver";
                        detalle = "Ver detalles del sistema.";
                        url = "mis-sistemas.html?sistema=" + s.getCodigo();
                }
                
                return new InfraDashboardDTO.Prioridad(
                    s.getCodigo(),
                    s.getNombre(),
                    s.getEstado(),
                    detalle,
                    accion,
                    url
                );
            })
            .collect(Collectors.toList());
    }

    private List<InfraDashboardDTO.Riesgo> calcularRiesgos(List<InfraSistemaEntity> sistemas) {
        Map<String, Long> riesgoCount = sistemas.stream()
            .filter(s -> s.getNivelRiesgo() != null)
            .collect(Collectors.groupingBy(
                InfraSistemaEntity::getNivelRiesgo,
                Collectors.counting()
            ));
        
        return RIESGOS_ORDEN.stream()
            .map(r -> {
                int cantidad = riesgoCount.getOrDefault(r, 0L).intValue();
                String clase = r.toLowerCase();
                return new InfraDashboardDTO.Riesgo(r, cantidad, clase);
            })
            .collect(Collectors.toList());
    }

    private List<InfraDashboardDTO.Estado> calcularEstados(List<InfraSistemaEntity> sistemas) {
        Map<String, Long> estadoCount = sistemas.stream()
            .filter(s -> s.getEstado() != null)
            .collect(Collectors.groupingBy(
                InfraSistemaEntity::getEstado,
                Collectors.counting()
            ));
        
        return ESTADOS_ORDEN.stream()
            .map(e -> new InfraDashboardDTO.Estado(e, estadoCount.getOrDefault(e, 0L).intValue()))
            .collect(Collectors.toList());
    }
}
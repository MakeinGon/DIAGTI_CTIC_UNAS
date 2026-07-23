package pe.edu.unas.ctic.diagti.infraestructura.service.impl;

import org.springframework.stereotype.Service;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraDashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraDashboardService;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraSistemasService;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InfraDashboardServiceImpl implements InfraDashboardService {
    private final InfraSistemasService sistemasService;
    public InfraDashboardServiceImpl(InfraSistemasService sistemasService) { this.sistemasService = sistemasService; }

    @Override
    public InfraDashboardDTO getDashboardData() {
        List<InfraSistemaDTO> sistemas = sistemasService.listar(null);
        InfraDashboardDTO.Estadisticas estadisticas = new InfraDashboardDTO.Estadisticas(
                sistemas.size(),
                contar(sistemas, "NUEVO") + contar(sistemas, "BORRADOR"),
                contar(sistemas, "NUEVO"), contar(sistemas, "BORRADOR"),
                contar(sistemas, "OBSERVADO") + contar(sistemas, "RECHAZADO"),
                contar(sistemas, "VALIDADO"));

        List<String> prioridad = List.of("OBSERVADO", "RECHAZADO", "SUBSANADO", "CORREGIDO", "BORRADOR", "NUEVO");
        List<InfraDashboardDTO.Prioridad> prioridades = sistemas.stream()
                .filter(s -> prioridad.contains(normal(s.getEstado())))
                .sorted(Comparator.comparingInt(s -> prioridad.indexOf(normal(s.getEstado()))))
                .limit(6)
                .map(this::prioridad)
                .toList();

        List<String> riesgosOrden = List.of("Bajo", "Medio", "Alto", "Crítico");
        Map<String, Long> riesgosConteo = sistemas.stream().collect(Collectors.groupingBy(this::riesgo, Collectors.counting()));
        List<InfraDashboardDTO.Riesgo> riesgos = riesgosOrden.stream()
                .map(r -> new InfraDashboardDTO.Riesgo(r, riesgosConteo.getOrDefault(r, 0L).intValue(),
                        r.toLowerCase(Locale.ROOT).replace("í", "i"))).toList();

        List<String> estadosOrden = List.of("Nuevo", "Borrador", "Enviado", "Observado", "Corregido", "Validado");
        List<InfraDashboardDTO.Estado> estados = estadosOrden.stream()
                .map(e -> new InfraDashboardDTO.Estado(e, contar(sistemas, estadoApi(e)))).toList();
        return new InfraDashboardDTO(estadisticas, prioridades, riesgos, estados);
    }

    private int contar(List<InfraSistemaDTO> sistemas, String estado) {
        return (int) sistemas.stream().filter(s -> estado.equals(normal(s.getEstado()))).count();
    }

    private InfraDashboardDTO.Prioridad prioridad(InfraSistemaDTO s) {
        String estado = mostrarEstado(s.getEstado());
        String accion = switch (normal(s.getEstado())) {
            case "NUEVO" -> "Registrar";
            case "BORRADOR" -> "Completar";
            case "OBSERVADO", "RECHAZADO" -> "Subsanar";
            case "SUBSANADO", "CORREGIDO" -> "Revisar y enviar";
            default -> "Ver";
        };
        String url = ("Nuevo".equals(estado) || "Borrador".equals(estado))
                ? "infraestructura.html?sistema=" + s.getCodigoSistema()
                : "mis-sistemas.html?sistema=" + s.getCodigoSistema();
        return new InfraDashboardDTO.Prioridad(s.getCodigoSistema(), s.getNombreSistema(), estado,
                "Registro persistido del flujo de Infraestructura", accion, url);
    }

    private String riesgo(InfraSistemaDTO s) {
        Object valor = s.getDatosDesarrollo() == null ? null : s.getDatosDesarrollo().get("criticidad");
        if (valor == null && s.getDatosDesarrollo() != null) valor = s.getDatosDesarrollo().get("riesgo");
        String r = valor == null ? "Medio" : String.valueOf(valor).trim();
        if (r.isBlank()) r = "Medio";
        String normalizado = java.text.Normalizer.normalize(r, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return "CRITICA".equalsIgnoreCase(normalizado) || "CRITICO".equalsIgnoreCase(normalizado) ? "Crítico"
                : r.substring(0, 1).toUpperCase(Locale.ROOT) + r.substring(1).toLowerCase(Locale.ROOT);
    }

    private String normal(String valor) {
        return valor == null || valor.isBlank() ? "NUEVO" : valor.toUpperCase(Locale.ROOT);
    }
    private String mostrarEstado(String estado) {
        String e = normal(estado);
        if ("PENDIENTE".equals(e)) return "Enviado";
        return e.substring(0, 1) + e.substring(1).toLowerCase(Locale.ROOT);
    }
    private String estadoApi(String visible) { return "Enviado".equals(visible) ? "PENDIENTE" : visible.toUpperCase(Locale.ROOT); }
}

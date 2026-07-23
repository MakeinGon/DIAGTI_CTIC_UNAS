package pe.edu.unas.ctic.diagti.auditor.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
public class AuditorReporteResumenDTO {
    private int totalSistemas;
    private int sistemasPendientes;
    private int sistemasObservados;
    private int sistemasValidados;
    private int totalObservaciones;
    private int totalAuditoria;
    private int tablas = 5;

    private Map<String, Long> porEstado = new LinkedHashMap<>();
    private Map<String, Long> porCriticidad = new LinkedHashMap<>();
    private Map<String, Long> porArea = new LinkedHashMap<>();
    private Map<String, Long> observacionesPorEstado = new LinkedHashMap<>();
    private Map<String, Long> observacionesPorOrigen = new LinkedHashMap<>();
    private Map<String, Long> actividadAuditoria = new LinkedHashMap<>();
    private List<Map<String, Object>> sistemasConMasObservaciones = new ArrayList<>();
    private List<Map<String, Object>> resultadosValidacion = new ArrayList<>();
    private List<Map<String, Object>> resultadosInfraestructura = new ArrayList<>();
}

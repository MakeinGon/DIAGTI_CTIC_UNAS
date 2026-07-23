package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class DashboardKpiDTO {
    private Integer totalSistemas = 0;
    private Integer validados = 0;
    private Integer observados = 0;
    private Integer pendientes = 0;
    private Integer enValidacion = 0;
    private Integer borrador = 0;
    private Integer subsanados = 0;
    private Integer observacionesPendientes = 0;
    private Integer observacionesEnRevision = 0;
    private Integer observacionesAtendidas = 0;
    private Integer observacionesValidacion = 0;
    private Integer observacionesInfraestructura = 0;
    private Integer sistemasConRiesgo = 0;
}

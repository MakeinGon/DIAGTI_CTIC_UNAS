package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class DashboardKpiDTO {
    private Integer totalSistemas;
    private Integer validados;
    private Integer observados;
    private Integer pendientes;
}
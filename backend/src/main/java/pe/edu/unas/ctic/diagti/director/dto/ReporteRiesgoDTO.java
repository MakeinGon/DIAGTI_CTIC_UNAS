package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class ReporteRiesgoDTO {
    private String codigoSistema;
    private String riesgo; // descripción del riesgo
    private String categoria;
    private String estado; // estado del riesgo
    private String criticidad;
    private String area;
    private String fechaIso; // yyyy-MM-dd, para el filtro de rango de fechas
}
package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class ReporteRiesgoDTO {
    private String codigoSistema;
    private String riesgo;
    private String categoria;
    private String riesgoNivel;  // BAJO, MEDIO, ALTO, CRITICO
    private String estado;
    private String criticidad;   // Académico, Financiero, RRHH, etc.
    private String area;
    private String fechaIso;
}
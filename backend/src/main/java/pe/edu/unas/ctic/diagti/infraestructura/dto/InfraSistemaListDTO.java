package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfraSistemaListDTO {
    private Long sistemaId;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String area;
    private String criticidad;
    private String estadoSistema;
    private String estadoSistemaUi;
    private String responsableTecnico;
    private String responsableFuncional;
    private String estadoValidacion;
    private String estadoEvaluacionInfra;
    private String plataforma;
    private String exposicion;
    private String nivelRiesgo;
    private Integer cantidadObservaciones;
    private Integer observacionesPendientes;
    private String fechaEnvio;
    private String fechaActualizacion;
}

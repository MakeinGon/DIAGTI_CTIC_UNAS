package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Vista resumida de un sistema para las pantallas Mis Sistemas, Dashboard
 * y el selector de infraestructura.html. Combina datos de "sistemas" con
 * el estado de flujo propio del módulo (tabla "infraestructura").
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SistemaInfraDTO {
    private String codigo;
    private String nombre;
    private String plataforma;
    private String exposicion;
    private String estado;
    private String riesgo;
    private String observacion;
    private String observacionFecha;
    private Integer ultimoPaso;
}

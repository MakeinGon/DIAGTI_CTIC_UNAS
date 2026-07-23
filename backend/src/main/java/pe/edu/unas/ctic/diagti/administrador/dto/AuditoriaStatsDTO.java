package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

@Data
public class AuditoriaStatsDTO {
    private Long totalRegistros;
    private Long modulosActivos;
    private Long usuariosActivos;
    private String ultimaActualizacion;
}
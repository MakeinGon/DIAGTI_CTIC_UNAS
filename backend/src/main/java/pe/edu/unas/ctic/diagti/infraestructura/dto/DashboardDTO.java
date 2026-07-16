package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private long total;
    private long nuevos;
    private long borradores;
    private long pendientes;
    private long observados;
    private long validados;
    private Map<String, Long> porEstado;
    private Map<String, Long> porRiesgo;
    private List<SistemaInfraDTO> prioridades;
}

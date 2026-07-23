package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

/**
 * Asignación administrativa de responsables sobre la tabla oficial {@code sistemas}.
 */
@Data
public class SistemaResponsablesRequestDTO {
    private Long idResponsableTecnico;
    private Long idResponsableFuncional;
}

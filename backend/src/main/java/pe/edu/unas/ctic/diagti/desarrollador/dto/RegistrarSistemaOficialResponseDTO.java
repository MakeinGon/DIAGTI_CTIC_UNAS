package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarSistemaOficialResponseDTO {
    private boolean success;
    private String message;
    private SistemaFrontendDTO sistema;
}

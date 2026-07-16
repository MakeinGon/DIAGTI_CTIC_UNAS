package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class SubsanacionRequestDTO {
    private String descripcion;
    private List<EvidenciaDTO> evidencias = new ArrayList<>();
}

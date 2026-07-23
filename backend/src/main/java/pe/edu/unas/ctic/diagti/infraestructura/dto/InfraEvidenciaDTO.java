package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfraEvidenciaDTO {
    private Long idEvidencia;
    private String tipo;
    private String nombre;
    private String archivo;
    private String url;
    private String descripcion;
    private String estado;
    private String fechaCarga;
}

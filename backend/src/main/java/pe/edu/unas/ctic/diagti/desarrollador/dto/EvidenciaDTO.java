// EvidenciaDTO.java (actualizado)
package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvidenciaDTO {
    private Long id;
    private String tipoEvidencia;
    private String archivoUrl;
    private String nombreArchivo;
    private String descripcion;
    private Boolean esObligatoria;
    private String usuarioRegistra;
    private LocalDateTime fechaCarga;
    private String estado;
}//-
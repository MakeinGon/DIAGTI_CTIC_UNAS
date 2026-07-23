package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;

/**
 * Actualización de datos administrativos del sistema (no altera validaciones técnicas).
 * No debe usarse para forzar estado VALIDADO.
 */
@Data
public class SistemaAdminUpdateDTO {
    private String nombre;
    private String descripcion;
    private Long idAreaUsuario;
    private Long idTipoAplicativo;
    private Long idCriticidad;
    private String formaAdquisicion;
}

package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;
import java.util.List;

@Data
public class UsuarioDTO {
    private Long usuarioId;
    private String username;
    private String nombres;
    private String apellidos;
    private String dni;
    /** Nombre completo para la UI existente (compatibilidad). */
    private String nombreCompleto;
    private String correo;
    private String area;
    private Long rolId;
    private String rol;
    private String origen;
    private String estado;
    private String ultimoAcceso;
    private String fechaCreacion;
    private String fechaActualizacion;
    private List<String> roles;
}

package pe.edu.unas.ctic.diagti.administrador.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.ToString;

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

    /** Solo escritura (creación LOCAL). Nunca se serializa en respuestas. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String password;

    /** Solo escritura (creación LOCAL). Nunca se persiste ni se serializa. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String confirmPassword;
}

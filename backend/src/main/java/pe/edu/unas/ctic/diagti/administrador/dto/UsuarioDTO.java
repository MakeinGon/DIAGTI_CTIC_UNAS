package pe.edu.unas.ctic.diagti.administrador.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class UsuarioDTO {
    private String dni;
    private String username;
    private String nombreCompleto;
    private String correo;
    private String area;
    private Long rolId;       // id del rol principal (para el <select> del formulario)
    private String rol;       // nombre del rol principal (el primero)
    private String origen;
    private String estado;    // "Activo" / "Inactivo"
    private String ultimoAcceso;
    private List<String> roles; // opcional

    /**
     * Solo se recibe al crear o cambiar la contraseña. Nunca se devuelve al
     * navegador ni se persiste como texto plano.
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
}

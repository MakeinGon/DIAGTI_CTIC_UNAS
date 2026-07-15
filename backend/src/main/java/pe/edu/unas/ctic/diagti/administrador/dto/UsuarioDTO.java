package pe.edu.unas.ctic.diagti.administrador.dto;

import lombok.Data;
import java.util.List;

@Data
public class UsuarioDTO {
    private String dni;
    private String nombreCompleto;
    private String correo;
    private String area;
    private String rol;       // nombre del rol principal (el primero)
    private String origen;
    private String estado;    // "Activo" / "Inactivo"
    private String ultimoAcceso;
    private List<String> roles; // opcional
}
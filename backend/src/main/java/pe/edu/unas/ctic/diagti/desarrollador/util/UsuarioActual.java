package pe.edu.unas.ctic.diagti.desarrollador.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;

public final class UsuarioActual {
    private UsuarioActual() {}

    public static String obtener() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            HttpServletRequest request = attributes.getRequest();
            String usuario = request.getHeader("X-Usuario");
            if (usuario == null || usuario.isBlank()) usuario = request.getParameter("usuario");
            if (usuario != null && !usuario.isBlank()) return usuario.trim();
        }
        return "usuario-desarrollo";
    }

    public static boolean esPropietario(SistemaEntity sistema, String usuario) {
        if (sistema == null || usuario == null || usuario.isBlank()) return false;
        String propietario = sistema.getUsuarioCreador();
        if (propietario == null || propietario.isBlank()) propietario = sistema.getResponsableTecnico();
        return propietario != null && propietario.equalsIgnoreCase(usuario.trim());
    }
}

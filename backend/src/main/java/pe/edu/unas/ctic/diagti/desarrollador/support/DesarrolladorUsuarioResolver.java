package pe.edu.unas.ctic.diagti.desarrollador.support;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

@Component
@RequiredArgsConstructor
public class DesarrolladorUsuarioResolver {

    private final LoginUsuarioRepository loginUsuarioRepository;

    @Transactional(readOnly = true)
    public Usuario requireActiveDeveloper(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }

        Usuario usuario = loginUsuarioRepository.findActiveUserWithRoles(username.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado o inactivo"));

        boolean esDesarrollo = usuario.getRoles() != null && usuario.getRoles().stream()
                .map(Rol::getNombre)
                .filter(n -> n != null)
                .anyMatch(n -> "desarrollo".equalsIgnoreCase(n) || "admin".equalsIgnoreCase(n));

        if (!esDesarrollo) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rol no autorizado para el módulo desarrollador");
        }

        return usuario;
    }

    public Long requireDeveloperId(String username) {
        return requireActiveDeveloper(username).getIdUsuario();
    }
}

package pe.edu.unas.ctic.diagti.Login.service;

import pe.edu.unas.ctic.diagti.Login.dto.LoginRequest;
import pe.edu.unas.ctic.diagti.Login.dto.LoginResponse;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private LoginUsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse authenticate(LoginRequest loginRequest) {
        LoginResponse response = new LoginResponse();

        try {
            if (loginRequest == null
                    || loginRequest.getUsername() == null
                    || loginRequest.getUsername().isBlank()
                    || loginRequest.getPassword() == null) {
                response.setSuccess(false);
                response.setMessage("Usuario y contraseña son obligatorios");
                return response;
            }

            Optional<Usuario> usuarioOpt = usuarioRepository.findActiveUserWithRoles(
                loginRequest.getUsername().trim()
            );

            if (usuarioOpt.isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Usuario no encontrado");
                return response;
            }

            Usuario usuario = usuarioOpt.get();
            String origen = usuario.getOrigen() != null ? usuario.getOrigen().trim() : "Local";

            if (esLdap(origen)) {
                // Sin fallback silencioso a contraseña local.
                // No hay cliente LDAP institucional cableado en este backend.
                response.setSuccess(false);
                response.setMessage(
                        "La autenticación de cuentas LDAP se valida contra LDAP/OpenLDAP institucional");
                return response;
            }

            String passwordIngresada = loginRequest.getPassword();
            String hashGuardado = usuario.getPasswordHash();

            if (hashGuardado == null || hashGuardado.isBlank()) {
                response.setSuccess(false);
                response.setMessage("Contraseña incorrecta");
                return response;
            }

            if (!verificarPasswordLocal(passwordIngresada, hashGuardado)) {
                response.setSuccess(false);
                response.setMessage("Contraseña incorrecta");
                return response;
            }

            response.setSuccess(true);
            response.setMessage("Autenticación exitosa");
            response.setNombreCompleto(
                usuario.getNombres() + " " + usuario.getApellidos()
            );

            String rol = usuario.getRoles().stream()
                    .findFirst()
                    .map(Rol::getNombre)
                    .orElse("usuario");

            response.setRol(rol);
            response.setRedirectUrl(getRedirectUrl(rol));

        } catch (Exception e) {
            System.err.println("ERROR autenticacion: " + e.getClass().getSimpleName());
            response.setSuccess(false);
            response.setMessage("Error en autenticación");
        }

        return response;
    }

    /**
     * BCrypt oficial para hashes nuevos; igualdad legacy solo para seed
     * (texto plano histórico en password_hash). No registra secretos.
     */
    private boolean verificarPasswordLocal(String passwordIngresada, String hashGuardado) {
        if (esHashBcrypt(hashGuardado)) {
            return passwordEncoder.matches(passwordIngresada, hashGuardado);
        }
        // Compatibilidad seed: no migrar hashes existentes sin restablecimiento.
        return passwordIngresada.equals(hashGuardado);
    }

    private static boolean esHashBcrypt(String value) {
        return value != null && (value.startsWith("$2a$")
                || value.startsWith("$2b$")
                || value.startsWith("$2y$"));
    }

    private static boolean esLdap(String origen) {
        return "LDAP".equalsIgnoreCase(origen);
    }

    private String getRedirectUrl(String rol) {
        return switch (rol.toLowerCase()) {
            case "admin" -> "/pages/admin/modules/gestion-usuarios/gestion-usuarios.component.html";
            case "auditor" -> "/pages/auditor/modules/html/inventario.html";
            case "desarrollo" -> "/pages/desarrollo/modules/html/dashboard.html";
            case "directivo" -> "/pages/director/modules/dashboard-riesgos/dashboard-riesgos.component.html";
            case "funcional" -> "/pages/funcional/modules/gestion-catalogos/gestion-catalogos.component.html";
            case "infraestructura" -> "/pages/infraestructura/html/dashboard.html";
            case "validacion" -> "/pages/validacion/modules/html/dashboard.html";
            default -> "/pages/login/html/login.html";
        };
    }
}

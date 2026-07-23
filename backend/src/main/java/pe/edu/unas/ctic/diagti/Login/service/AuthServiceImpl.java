package pe.edu.unas.ctic.diagti.Login.service;

import pe.edu.unas.ctic.diagti.Login.dto.LoginRequest;
import pe.edu.unas.ctic.diagti.Login.dto.LoginResponse;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final LoginUsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(LoginUsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public LoginResponse authenticate(LoginRequest loginRequest) {
        LoginResponse response = new LoginResponse();

        try {
            if (loginRequest == null || loginRequest.getUsername() == null
                    || loginRequest.getPassword() == null) {
                response.setSuccess(false);
                response.setMessage("DNI y contraseña son obligatorios");
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
            String passwordIngresada = loginRequest.getPassword();
            String passwordGuardada = usuario.getPasswordHash();

            if (!passwordValida(passwordIngresada, passwordGuardada)) {
                response.setSuccess(false);
                response.setMessage("Contraseña incorrecta");
                return response;
            }

            // Los usuarios antiguos de prueba todavía tienen texto plano. En
            // su primer acceso correcto se migran automáticamente a BCrypt.
            if (!esBCrypt(passwordGuardada)) {
                usuario.setPasswordHash(passwordEncoder.encode(passwordIngresada));
            }
            usuario.setUltimoAcceso(LocalDateTime.now());
            usuarioRepository.save(usuario);

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
            response.setSuccess(false);
            response.setMessage("No se pudo completar la autenticación");
        }

        return response;
    }

    private boolean passwordValida(String ingresada, String guardada) {
        if (guardada == null || guardada.isBlank()) return false;
        return esBCrypt(guardada)
                ? passwordEncoder.matches(ingresada, guardada)
                : ingresada.equals(guardada);
    }

    private boolean esBCrypt(String password) {
        return password != null && (password.startsWith("$2a$")
                || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }

    private String getRedirectUrl(String rol) {
        return switch (normalizarRol(rol)) {
            case "admin", "administrador", "administrador ctic" ->
                    "/pages/admin/modules/gestion-usuarios/gestion-usuarios.component.html";
            case "auditor" -> "/pages/auditor/modules/html/inventario.html";
            case "desarrollo", "desarrollador", "area de desarrollo" ->
                    "/pages/desarrollo/modules/html/dashboard.html";
            case "directivo" -> "/pages/directivo/modules/html/dashboard-riesgos.html";
            case "funcional", "responsable funcional" -> "/pages/funcional/dashboard.html";
            case "infraestructura", "area de infraestructura" ->
                    "/pages/infraestructura/html/dashboard.html";
            case "validacion", "validador", "validador tecnico", "validador ctic" ->
                    "/pages/validacion/modules/html/dashboard.html";
            default -> "/pages/login/html/login.html";
        };
    }

    private String normalizarRol(String rol) {
        String texto = rol == null ? "" : rol.trim().toLowerCase(Locale.ROOT);
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }
}

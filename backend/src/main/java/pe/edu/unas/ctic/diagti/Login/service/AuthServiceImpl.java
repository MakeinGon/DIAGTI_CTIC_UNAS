package pe.edu.unas.ctic.diagti.Login.service;

import pe.edu.unas.ctic.diagti.Login.dto.LoginRequest;
import pe.edu.unas.ctic.diagti.Login.dto.LoginResponse;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private LoginUsuarioRepository usuarioRepository;

    @Override
    public LoginResponse authenticate(LoginRequest loginRequest) {
        LoginResponse response = new LoginResponse();

        try {
            System.out.println("🔐 Buscando usuario: " + loginRequest.getUsername());

            Optional<Usuario> usuarioOpt = usuarioRepository.findActiveUserWithRoles(
                loginRequest.getUsername()
            );

            if (usuarioOpt.isEmpty()) {
                System.out.println("❌ Usuario no encontrado");
                response.setSuccess(false);
                response.setMessage("Usuario no encontrado");
                return response;
            }

            Usuario usuario = usuarioOpt.get();
            System.out.println("✅ Usuario encontrado: " + usuario.getUsername());

            // Comparación directa (login temporal en texto plano; no registrar secretos)
            String passwordIngresada = loginRequest.getPassword();
            String passwordGuardada = usuario.getPasswordHash();

            if (!passwordIngresada.equals(passwordGuardada)) {
                System.out.println("❌ Contraseña incorrecta");
                response.setSuccess(false);
                response.setMessage("Contraseña incorrecta");
                return response;
            }

            System.out.println("✅ Autenticación exitosa");
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
            System.err.println("💥 ERROR: " + e.getMessage());
            e.printStackTrace();
            response.setSuccess(false);
            response.setMessage("Error en autenticación: " + e.getMessage());
        }

        return response;
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
package pe.edu.unas.ctic.diagti.Login.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.edu.unas.ctic.diagti.Login.dto.LoginRequest;
import pe.edu.unas.ctic.diagti.Login.dto.LoginResponse;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock LoginUsuarioRepository usuarioRepository;
    @Mock PasswordEncoder passwordEncoder;
    @InjectMocks AuthServiceImpl authService;

    private final PasswordEncoder realEncoder = new BCryptPasswordEncoder();
    private Usuario localUser;

    @BeforeEach
    void setUp() {
        Rol rol = new Rol();
        rol.setNombre("desarrollo");
        localUser = new Usuario();
        localUser.setUsername("79999991");
        localUser.setNombres("Usuario");
        localUser.setApellidos("Local");
        localUser.setOrigen("Local");
        localUser.setEstado(true);
        localUser.setRoles(new HashSet<>(Set.of(rol)));
    }

    @Test
    void loginLocal_bcryptOk() {
        String hash = realEncoder.encode("PruebaLocal123");
        localUser.setPasswordHash(hash);
        when(usuarioRepository.findActiveUserWithRoles("79999991")).thenReturn(Optional.of(localUser));
        when(passwordEncoder.matches("PruebaLocal123", hash)).thenAnswer(inv ->
                realEncoder.matches(inv.getArgument(0), inv.getArgument(1)));

        LoginRequest req = new LoginRequest();
        req.setUsername("79999991");
        req.setPassword("PruebaLocal123");
        LoginResponse res = authService.authenticate(req);
        assertTrue(res.isSuccess());
        assertTrue(res.getRedirectUrl().contains("desarrollo"));
    }

    @Test
    void loginLocal_passwordIncorrecta() {
        String hash = realEncoder.encode("PruebaLocal123");
        localUser.setPasswordHash(hash);
        when(usuarioRepository.findActiveUserWithRoles("79999991")).thenReturn(Optional.of(localUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        LoginRequest req = new LoginRequest();
        req.setUsername("79999991");
        req.setPassword("MalaClave999");
        LoginResponse res = authService.authenticate(req);
        assertFalse(res.isSuccess());
        assertEquals("Contraseña incorrecta", res.getMessage());
    }

    @Test
    void loginLocal_legacySeedPlano() {
        localUser.setUsername("71234567");
        localUser.setPasswordHash("admin123");
        when(usuarioRepository.findActiveUserWithRoles("71234567")).thenReturn(Optional.of(localUser));

        LoginRequest req = new LoginRequest();
        req.setUsername("71234567");
        req.setPassword("admin123");
        LoginResponse res = authService.authenticate(req);
        assertTrue(res.isSuccess());
    }

    @Test
    void loginInactivo_noEncontrado() {
        when(usuarioRepository.findActiveUserWithRoles("79999991")).thenReturn(Optional.empty());
        LoginRequest req = new LoginRequest();
        req.setUsername("79999991");
        req.setPassword("PruebaLocal123");
        LoginResponse res = authService.authenticate(req);
        assertFalse(res.isSuccess());
        assertEquals("Usuario no encontrado", res.getMessage());
    }

    @Test
    void loginLdap_noUsaPasswordLocal() {
        localUser.setOrigen("LDAP");
        localUser.setPasswordHash(null);
        when(usuarioRepository.findActiveUserWithRoles("79999992")).thenReturn(Optional.of(localUser));

        LoginRequest req = new LoginRequest();
        req.setUsername("79999992");
        req.setPassword("cualquierCosa1");
        LoginResponse res = authService.authenticate(req);
        assertFalse(res.isSuccess());
        assertTrue(res.getMessage().toLowerCase().contains("ldap"));
    }
}

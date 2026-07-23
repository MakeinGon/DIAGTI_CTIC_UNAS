package pe.edu.unas.ctic.diagti.desarrollador.support;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DesarrolladorUsuarioResolverTest {

    @Mock
    private LoginUsuarioRepository loginUsuarioRepository;

    @InjectMocks
    private DesarrolladorUsuarioResolver resolver;

    @Test
    void rolAuditor_noAutorizado() {
        Usuario u = new Usuario();
        u.setUsername("74331380");
        u.setEstado(true);
        Rol rol = new Rol();
        rol.setNombre("auditor");
        u.setRoles(new HashSet<>(Set.of(rol)));
        when(loginUsuarioRepository.findActiveUserWithRoles("74331380")).thenReturn(Optional.of(u));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> resolver.requireActiveDeveloper("74331380"));
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void rolDesarrollo_ok() {
        Usuario u = new Usuario();
        u.setIdUsuario(4L);
        u.setUsername("71234567");
        u.setEstado(true);
        Rol rol = new Rol();
        rol.setNombre("desarrollo");
        u.setRoles(new HashSet<>(Set.of(rol)));
        when(loginUsuarioRepository.findActiveUserWithRoles("71234567")).thenReturn(Optional.of(u));

        assertEquals(4L, resolver.requireDeveloperId("71234567"));
    }
}

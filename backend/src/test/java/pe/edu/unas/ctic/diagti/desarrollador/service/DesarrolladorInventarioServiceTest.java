package pe.edu.unas.ctic.diagti.desarrollador.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.impl.DesarrolladorInventarioServiceImpl;
import pe.edu.unas.ctic.diagti.desarrollador.support.DesarrolladorUsuarioResolver;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DesarrolladorInventarioServiceTest {

    @Mock private DesarrolladorUsuarioResolver usuarioResolver;
    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private ValidacionRepository validacionRepository;
    @Mock private CatalogoRepository catalogoRepository;
    @Mock private LoginUsuarioRepository loginUsuarioRepository;
    @Mock private AuditoriaRepository auditoriaRepository;

    @InjectMocks
    private DesarrolladorInventarioServiceImpl service;

    private Usuario desarrollador;

    @BeforeEach
    void setUp() {
        desarrollador = new Usuario();
        desarrollador.setIdUsuario(4L);
        desarrollador.setUsername("71234567");
        desarrollador.setNombres("Juan");
        desarrollador.setApellidos("Perez");
        desarrollador.setEstado(true);
        Rol rol = new Rol();
        rol.setNombre("desarrollo");
        desarrollador.setRoles(new HashSet<>(Set.of(rol)));
    }

    @Test
    void dashboardSinSistemas_retornaListaVacia() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(desarrollador);
        when(sistemaRepository.findActivosByResponsableTecnico(4L)).thenReturn(List.of());

        List<SistemaFrontendDTO> result = service.listarSistemasDelDesarrollador("71234567", Map.of());

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void listadoConSistemasAsignados() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(desarrollador);
        SistemaEntity s = sistema(1L, "SYS-001", "Académico", "BORRADOR", 4L);
        when(sistemaRepository.findActivosByResponsableTecnico(4L)).thenReturn(List.of(s));
        when(observacionRepository.findByIdSistemaIn(anyCollection())).thenReturn(List.of());

        List<SistemaFrontendDTO> result = service.listarSistemasDelDesarrollador("71234567", Map.of());

        assertEquals(1, result.size());
        assertEquals("SYS-001", result.get(0).getCodigo());
        assertEquals("Borrador", result.get(0).getEstado());
        assertNotNull(result.get(0).getObservacionesValidador());
    }

    @Test
    void consultarSistemaAjeno_lanza403() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(desarrollador);
        SistemaEntity ajeno = sistema(9L, "SYS-X", "Ajeno", "VALIDADO", 99L);
        when(sistemaRepository.findActivoById(9L)).thenReturn(Optional.of(ajeno));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.obtenerSistemaDelDesarrollador("71234567", 9L));
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void sistemaInexistente_lanza404() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(desarrollador);
        when(sistemaRepository.findActivoById(100L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.obtenerSistemaDelDesarrollador("71234567", 100L));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void observacionesPendientesYAtendidas() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(desarrollador);
        SistemaEntity s = sistema(2L, "SYS-002", "Trámite", "OBSERVADO", 4L);
        when(sistemaRepository.findActivosByResponsableTecnico(4L)).thenReturn(List.of(s));

        ObservacionEntity pend = new ObservacionEntity();
        pend.setIdObservacion(1L);
        pend.setIdSistema(2L);
        pend.setEstadoObservacion("PENDIENTE");
        pend.setDescripcion("Falta evidencia");

        ObservacionEntity atendida = new ObservacionEntity();
        atendida.setIdObservacion(2L);
        atendida.setIdSistema(2L);
        atendida.setEstadoObservacion("ATENDIDA");
        atendida.setDescripcion("Ya corregido");

        when(observacionRepository.findByIdSistemaIn(anyCollection())).thenReturn(List.of(pend, atendida));

        Map<String, Long> conteo = service.contarObservaciones("71234567");
        assertEquals(1L, conteo.get("pendientes"));
        assertEquals(1L, conteo.get("atendidas"));
        assertEquals(2L, conteo.get("total"));
    }

    @Test
    void enviarValidacion_creaRegistroYCambiaEstado() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(desarrollador);
        SistemaEntity s = sistema(3L, "SYS-003", "Finanzas", "BORRADOR", 4L);
        when(sistemaRepository.findActivoById(3L)).thenReturn(Optional.of(s));
        when(sistemaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(validacionRepository.save(any(ValidacionEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(observacionRepository.findByIdSistema(3L)).thenReturn(List.of());
        when(auditoriaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SistemaFrontendDTO dto = service.enviarAValidacion("71234567", 3L);

        assertEquals("Enviado", dto.getEstado());
        verify(validacionRepository).save(any(ValidacionEntity.class));
        verify(auditoriaRepository).save(any());
    }

    @Test
    void filtroObservados_soloIncluyeConObservaciones() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(desarrollador);
        SistemaEntity observado = sistema(2L, "SYS-002", "Trámite", "OBSERVADO", 4L);
        SistemaEntity validado = sistema(1L, "SYS-001", "Académico", "VALIDADO", 4L);
        when(sistemaRepository.findActivosByResponsableTecnico(4L)).thenReturn(List.of(observado, validado));

        ObservacionEntity pend = new ObservacionEntity();
        pend.setIdSistema(2L);
        pend.setEstadoObservacion("PENDIENTE");
        pend.setDescripcion("Obs");
        when(observacionRepository.findByIdSistemaIn(anyCollection())).thenReturn(List.of(pend));

        List<SistemaFrontendDTO> result = service.listarSistemasDelDesarrollador(
                "71234567", Map.of("soloObservados", "true"));

        assertEquals(1, result.size());
        assertEquals("SYS-002", result.get(0).getCodigo());
        assertEquals(1, result.get(0).getObservacionesValidador().size());
    }

    private SistemaEntity sistema(Long id, String codigo, String nombre, String estado, Long responsable) {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(id);
        s.setCodigoUnico(codigo);
        s.setNombre(nombre);
        s.setEstadoFlujo(estado);
        s.setIdResponsableTecnico(responsable);
        return s;
    }
}

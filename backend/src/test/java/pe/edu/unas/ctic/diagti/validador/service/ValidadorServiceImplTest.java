package pe.edu.unas.ctic.diagti.validador.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.validador.dto.DecisionValidacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.SistemaValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ValidadorDTO;
import pe.edu.unas.ctic.diagti.validador.entity.Validacion;
import pe.edu.unas.ctic.diagti.validador.repository.ValidadorValidacionRepository;
import pe.edu.unas.ctic.diagti.validador.support.ValidacionEstados;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ValidadorServiceImplTest {

    @Mock private ValidadorValidacionRepository validacionRepository;
    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private LoginUsuarioRepository usuarioRepository;
    @Mock private CatalogoRepository catalogoRepository;
    @Mock private AuditoriaRepository auditoriaRepository;

    @InjectMocks
    private ValidadorServiceImpl service;

    private SistemaEntity sistema;
    private Validacion validacion;

    @BeforeEach
    void setUp() {
        sistema = new SistemaEntity();
        sistema.setIdSistema(10L);
        sistema.setCodigoUnico("SYS-VAL-01");
        sistema.setNombre("Sistema Validación Test");
        sistema.setEstadoFlujo(ValidacionEstados.SISTEMA_ENVIADO);
        sistema.setIdResponsableTecnico(4L);

        validacion = new Validacion();
        validacion.setIdValidacion(20L);
        validacion.setIdSistema(10L);
        validacion.setEstadoValidacion(ValidacionEstados.VAL_PENDIENTE);
    }

    @Test
    void listaPendientesVacia() {
        when(validacionRepository.findPendientes()).thenReturn(List.of());
        assertTrue(service.getPendientes().isEmpty());
    }

    @Test
    void listaConPendientes() {
        when(validacionRepository.findPendientes()).thenReturn(List.of(validacion));
        when(sistemaRepository.findActivoById(10L)).thenReturn(Optional.of(sistema));
        List<ValidadorDTO> list = service.getPendientes();
        assertEquals(1, list.size());
        assertEquals("Sistema Validación Test", list.get(0).getNombreSistema());
    }

    @Test
    void detalleSistemaInexistente() {
        when(sistemaRepository.findActivoById(99L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.getDetalleSistema(99L));
    }

    @Test
    void detalleSistemaOk() {
        when(sistemaRepository.findActivoById(10L)).thenReturn(Optional.of(sistema));
        when(validacionRepository.findActivasBySistema(10L)).thenReturn(List.of(validacion));
        when(observacionRepository.findByIdSistema(10L)).thenReturn(List.of());
        SistemaValidacionDTO dto = service.getDetalleSistema(10L);
        assertEquals(10L, dto.getIdSistema());
        assertEquals("SYS-VAL-01", dto.getCodigo());
        assertNotNull(dto.getObservaciones());
    }

    @Test
    void registrarObservacion_mismoSistemaId() {
        when(sistemaRepository.findActivoById(10L)).thenReturn(Optional.of(sistema));
        when(validacionRepository.findActivasBySistema(10L)).thenReturn(List.of(validacion));
        when(observacionRepository.save(any())).thenAnswer(inv -> {
            ObservacionEntity o = inv.getArgument(0);
            o.setIdObservacion(5L);
            return o;
        });
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(sistemaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ObservacionRequestDTO req = new ObservacionRequestDTO();
        req.setIdSistema(10L);
        req.setArea("infraestructura");
        req.setTitulo("Backup");
        req.setDescripcion("Falta política de backup");

        ObservacionValidacionDTO dto = service.registrarObservacion(req);
        assertEquals(10L, dto.getIdSistema());
        assertEquals(20L, dto.getIdValidacion());
        assertEquals(ValidacionEstados.OBS_PENDIENTE, dto.getEstadoObservacion());
        assertTrue(dto.getDescripcion().contains("[INFRAESTRUCTURA]"));
        verify(sistemaRepository).save(argThat(s -> ValidacionEstados.SISTEMA_OBSERVADO.equals(s.getEstadoFlujo())));
    }

    @Test
    void validarConObservacionesPendientes_conflicto() {
        when(sistemaRepository.findActivoById(10L)).thenReturn(Optional.of(sistema));
        when(validacionRepository.findActivasBySistema(10L)).thenReturn(List.of(validacion));
        ObservacionEntity pend = new ObservacionEntity();
        pend.setEstadoObservacion(ValidacionEstados.OBS_PENDIENTE);
        when(observacionRepository.findByIdSistema(10L)).thenReturn(List.of(pend));

        DecisionValidacionRequestDTO req = new DecisionValidacionRequestDTO();
        req.setIdSistema(10L);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.validarSistema(req));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void validarSinPendientes_ok() {
        when(sistemaRepository.findActivoById(10L)).thenReturn(Optional.of(sistema));
        when(validacionRepository.findActivasBySistema(10L)).thenReturn(List.of(validacion));
        when(observacionRepository.findByIdSistema(10L)).thenReturn(List.of());
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(sistemaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DecisionValidacionRequestDTO req = new DecisionValidacionRequestDTO();
        req.setIdSistema(10L);
        req.setComentario("OK");
        ValidadorDTO dto = service.validarSistema(req);
        assertEquals(ValidacionEstados.VAL_VALIDADO, dto.getEstadoValidacion());
    }

    @Test
    void aprobarSubsanacion() {
        ObservacionEntity obs = new ObservacionEntity();
        obs.setIdObservacion(7L);
        obs.setIdSistema(10L);
        obs.setEstadoObservacion(ValidacionEstados.OBS_EN_REVISION);
        when(observacionRepository.findById(7L)).thenReturn(Optional.of(obs));
        when(observacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(observacionRepository.findByIdSistema(10L)).thenReturn(List.of(obs));
        when(sistemaRepository.findActivoById(10L)).thenReturn(Optional.of(sistema));
        when(validacionRepository.findActivasBySistema(10L)).thenReturn(List.of(validacion));
        when(sistemaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ObservacionValidacionDTO dto = service.aprobarSubsanacion(7L, "74331380");
        assertEquals(ValidacionEstados.OBS_ATENDIDA, dto.getEstadoObservacion());
    }

    @Test
    void rechazarSubsanacion() {
        ObservacionEntity obs = new ObservacionEntity();
        obs.setIdObservacion(8L);
        obs.setIdSistema(10L);
        obs.setDescripcion("[VALIDACION] X");
        obs.setEstadoObservacion(ValidacionEstados.OBS_EN_REVISION);
        when(observacionRepository.findById(8L)).thenReturn(Optional.of(obs));
        when(observacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(sistemaRepository.findActivoById(10L)).thenReturn(Optional.of(sistema));
        when(sistemaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(validacionRepository.findActivasBySistema(10L)).thenReturn(List.of(validacion));
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ObservacionValidacionDTO dto = service.rechazarSubsanacion(8L, "74331380", "Incompleto");
        assertEquals(ValidacionEstados.OBS_PENDIENTE, dto.getEstadoObservacion());
    }

    @Test
    void estadisticas() {
        when(validacionRepository.countByEstadoValidacion(ValidacionEstados.VAL_PENDIENTE)).thenReturn(2L);
        when(validacionRepository.countByEstadoValidacion(ValidacionEstados.VAL_SUBSANADO)).thenReturn(1L);
        when(validacionRepository.countByEstadoValidacion(ValidacionEstados.VAL_OBSERVADO)).thenReturn(3L);
        when(validacionRepository.countByEstadoValidacion(ValidacionEstados.VAL_VALIDADO)).thenReturn(4L);
        when(validacionRepository.countByEstadoValidacion(ValidacionEstados.VAL_RECHAZADO)).thenReturn(0L);
        Map<String, Long> stats = service.getEstadisticas();
        assertEquals(3L, stats.get("pendientes"));
        assertEquals(3L, stats.get("observados"));
        assertEquals(4L, stats.get("validados"));
    }

    @Test
    void observacionInexistente() {
        when(observacionRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.aprobarSubsanacion(999L, "x"));
    }
}

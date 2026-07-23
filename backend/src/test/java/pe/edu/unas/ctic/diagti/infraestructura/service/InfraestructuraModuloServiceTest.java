package pe.edu.unas.ctic.diagti.infraestructura.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.entity.InfraestructuraEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorArquitecturaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorInfraestructuraRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorIntegracionRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraEvaluacionRequestDTO;
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraSistemaListDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.impl.InfraestructuraModuloServiceImpl;
import pe.edu.unas.ctic.diagti.infraestructura.support.InfraEvaluacionPayload;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionRequestDTO;
import pe.edu.unas.ctic.diagti.validador.dto.ObservacionValidacionDTO;
import pe.edu.unas.ctic.diagti.validador.service.ValidadorService;
import pe.edu.unas.ctic.diagti.validador.support.ValidacionEstados;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InfraestructuraModuloServiceTest {

    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private DirectorInfraestructuraRepository infraRepository;
    @Mock private DirectorSeguridadRepository seguridadRepository;
    @Mock private DirectorEvidenciaRepository evidenciaRepository;
    @Mock private DirectorArquitecturaRepository arquitecturaRepository;
    @Mock private DirectorIntegracionRepository integracionRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private ValidacionRepository validacionRepository;
    @Mock private CatalogoRepository catalogoRepository;
    @Mock private LoginUsuarioRepository usuarioRepository;
    @Mock private AuditoriaRepository auditoriaRepository;
    @Mock private ValidadorService validadorService;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private InfraestructuraModuloServiceImpl service;

    private SistemaEntity sistema;

    @BeforeEach
    void setUp() {
        sistema = new SistemaEntity();
        sistema.setIdSistema(5L);
        sistema.setCodigoUnico("SYS-INF-01");
        sistema.setNombre("Sistema Infra Test");
        sistema.setEstadoFlujo(ValidacionEstados.SISTEMA_BORRADOR);
        sistema.setNivelRiesgo("MEDIO");
    }

    @Test
    void listarSistemas_vacio() {
        when(sistemaRepository.findAll()).thenReturn(List.of());
        List<InfraSistemaListDTO> list = service.listarSistemas(Map.of());
        assertTrue(list.isEmpty());
    }

    @Test
    void listarSistemas_sinInfra_pendienteEvaluacion() {
        when(sistemaRepository.findAll()).thenReturn(List.of(sistema));
        when(infraRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(observacionRepository.findByIdSistemaIn(anyCollection())).thenReturn(List.of());
        when(validacionRepository.findByIdSistema(5L)).thenReturn(List.of());

        List<InfraSistemaListDTO> list = service.listarSistemas(Map.of());
        assertEquals(1, list.size());
        assertEquals(5L, list.get(0).getSistemaId());
        assertEquals("Pendiente de evaluación", list.get(0).getEstadoSistemaUi());
        assertEquals("SIN_REGISTRO", list.get(0).getEstadoEvaluacionInfra());
        assertEquals("Sin evaluar", list.get(0).getPlataforma());
    }

    @Test
    void guardarEvaluacion_upsertSinDuplicar() {
        when(sistemaRepository.findActivoById(5L)).thenReturn(Optional.of(sistema));
        when(infraRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(infraRepository.save(any())).thenAnswer(inv -> {
            InfraestructuraEntity e = inv.getArgument(0);
            e.setIdInfraestructura(99L);
            return e;
        });
        when(seguridadRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(seguridadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(evidenciaRepository.findByIdSistema(5L)).thenReturn(List.of());

        InfraEvaluacionRequestDTO req = new InfraEvaluacionRequestDTO();
        req.setEstadoRegistro("BORRADOR");
        InfraEvaluacionPayload datos = new InfraEvaluacionPayload();
        datos.setPlataforma("Docker");
        datos.setSistemaOperativo("Ubuntu");
        datos.setBackup("Sí");
        datos.setFrecuenciaBackup("Diario");
        req.setDatos(datos);

        var dto = service.guardarEvaluacion(5L, req);
        assertEquals(99L, dto.getIdInfraestructura());
        assertEquals("BORRADOR", dto.getEstadoRegistro());

        ArgumentCaptor<InfraestructuraEntity> cap = ArgumentCaptor.forClass(InfraestructuraEntity.class);
        verify(infraRepository, times(1)).save(cap.capture());
        assertTrue(cap.getValue().getCapacidadRecursos().contains("Docker"));
        verify(infraRepository, never()).delete(any());
    }

    @Test
    void registrarObservacion_delegaConAreaInfraestructura() {
        when(sistemaRepository.findActivoById(5L)).thenReturn(Optional.of(sistema));
        when(validadorService.registrarObservacion(any())).thenReturn(
                ObservacionValidacionDTO.builder()
                        .idObservacion(1L)
                        .idSistema(5L)
                        .area(ValidacionEstados.AREA_INFRAESTRUCTURA)
                        .descripcion("[INFRAESTRUCTURA] Falta backup")
                        .estadoObservacion(ValidacionEstados.OBS_PENDIENTE)
                        .build());

        ObservacionRequestDTO req = new ObservacionRequestDTO();
        req.setDescripcion("[INFRAESTRUCTURA] Falta backup");
        ObservacionValidacionDTO out = service.registrarObservacion(5L, req);

        ArgumentCaptor<ObservacionRequestDTO> cap = ArgumentCaptor.forClass(ObservacionRequestDTO.class);
        verify(validadorService).registrarObservacion(cap.capture());
        assertEquals(ValidacionEstados.AREA_INFRAESTRUCTURA, cap.getValue().getArea());
        assertEquals(5L, cap.getValue().getIdSistema());
        assertFalse(cap.getValue().getDescripcion().startsWith("[INFRAESTRUCTURA]"));
        assertEquals(ValidacionEstados.AREA_INFRAESTRUCTURA, out.getArea());
    }

    @Test
    void aprobarSubsanacion_reutilizaValidador() {
        when(validadorService.aprobarSubsanacion(7L, "user1"))
                .thenReturn(ObservacionValidacionDTO.builder()
                        .idObservacion(7L)
                        .estadoObservacion(ValidacionEstados.OBS_ATENDIDA)
                        .build());
        ObservacionValidacionDTO out = service.aprobarSubsanacion(7L, "user1");
        assertEquals(ValidacionEstados.OBS_ATENDIDA, out.getEstadoObservacion());
        verify(validadorService).aprobarSubsanacion(7L, "user1");
    }
}

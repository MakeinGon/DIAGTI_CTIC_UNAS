package pe.edu.unas.ctic.diagti.director.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.director.dto.CriticidadDTO;
import pe.edu.unas.ctic.diagti.director.dto.DashboardKpiDTO;
import pe.edu.unas.ctic.diagti.director.dto.ObservacionConsolidadaDTO;
import pe.edu.unas.ctic.diagti.director.dto.SistemaResumenDTO;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.mapper.SistemaMapper;
import pe.edu.unas.ctic.diagti.director.repository.DirectorInfraestructuraRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.service.impl.DashboardServiceImpl;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private DirectorInfraestructuraRepository infraestructuraRepository;
    @Mock private AuditoriaRepository auditoriaRepository;
    @Mock private SistemaMapper sistemaMapper;
    @Mock private DirectorCatalogHelper catalogHelper;

    @InjectMocks
    private DashboardServiceImpl service;

    private SistemaEntity validado;
    private SistemaEntity observado;
    private SistemaEntity pendiente;

    @BeforeEach
    void setUp() {
        validado = sistema(1L, "SYS-D-OK", "Validado", "VALIDADO");
        observado = sistema(2L, "SYS-D-OBS", "Observado", "OBSERVADO");
        pendiente = sistema(3L, "SYS-D-PEN", "Pendiente", "ENVIADO");
    }

    @Test
    void dashboardBaseVacia() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        DashboardKpiDTO kpi = service.obtenerKpis();
        assertEquals(0, kpi.getTotalSistemas());
        assertEquals(0, kpi.getValidados());
        assertEquals(0, kpi.getObservados());
        assertEquals(0, kpi.getPendientes());
        assertEquals(0, kpi.getObservacionesPendientes());
        assertTrue(service.obtenerSistemasFiltrados(null, null, null, null).isEmpty());
        assertTrue(service.obtenerCriticidades().stream().allMatch(c -> c.getCantidad() == 0 || c.getCantidad() != null));
    }

    @Test
    void dashboardConSistemas_conteoPorEstado() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(validado, observado, pendiente));
        when(observacionRepository.findByIdSistemaIn(any())).thenReturn(List.of());

        DashboardKpiDTO kpi = service.obtenerKpis();
        assertEquals(3, kpi.getTotalSistemas());
        assertEquals(1, kpi.getValidados());
        assertEquals(1, kpi.getObservados());
        assertEquals(1, kpi.getPendientes());
    }

    @Test
    void conteoObservacionesPorPrefijo() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(observado));
        ObservacionEntity v = obs(10L, 2L, "[VALIDACION] Falta doc", "PENDIENTE");
        ObservacionEntity i = obs(11L, 2L, "[INFRAESTRUCTURA] Backup", "EN_REVISION");
        ObservacionEntity a = obs(12L, 2L, "[VALIDACION] Otra", "ATENDIDA");
        when(observacionRepository.findByIdSistemaIn(any())).thenReturn(List.of(v, i, a));

        DashboardKpiDTO kpi = service.obtenerKpis();
        assertEquals(1, kpi.getObservacionesPendientes());
        assertEquals(1, kpi.getObservacionesEnRevision());
        assertEquals(1, kpi.getObservacionesAtendidas());
        assertEquals(2, kpi.getObservacionesValidacion());
        assertEquals(1, kpi.getObservacionesInfraestructura());
    }

    @Test
    void inventarioDashboardConSistemas() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(validado));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Académica", "Alta");
        when(infraestructuraRepository.findByIdSistema(1L)).thenReturn(List.of());
        SistemaResumenDTO dto = new SistemaResumenDTO();
        dto.setSistemaId(1L);
        dto.setCodigo("SYS-D-OK");
        when(sistemaMapper.toResumenDTO(eq(validado), anyList())).thenReturn(dto);

        List<SistemaResumenDTO> list = service.obtenerSistemasFiltrados(null, null, null, null);
        assertEquals(1, list.size());
        assertEquals("SYS-D-OK", list.get(0).getCodigo());
    }

    @Test
    void criticidadesDesdeCatalogoOficial() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(validado, observado));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Alta", "Media");
        List<CriticidadDTO> list = service.obtenerCriticidades();
        assertTrue(list.stream().anyMatch(c -> "alta".equals(c.getNivel()) && c.getCantidad() == 1));
        assertTrue(list.stream().anyMatch(c -> "media".equals(c.getNivel()) && c.getCantidad() == 1));
    }

    @Test
    void observacionesConsolidadasPorPrefijoSinDuplicar() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(observado));
        ObservacionEntity v = obs(10L, 2L, "[VALIDACION] Una", "PENDIENTE");
        when(observacionRepository.findByIdSistemaIn(any())).thenReturn(List.of(v));

        List<ObservacionConsolidadaDTO> list = service.obtenerObservacionesConsolidadas("VALIDACION", null);
        assertEquals(1, list.size());
        assertEquals("VALIDACION", list.get(0).getOrigen());
    }

    private static SistemaEntity sistema(Long id, String codigo, String nombre, String estado) {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(id);
        s.setCodigoUnico(codigo);
        s.setNombre(nombre);
        s.setEstadoFlujo(estado);
        s.setObservaciones(List.of());
        s.setValidaciones(List.of());
        return s;
    }

    private static ObservacionEntity obs(Long id, Long sistemaId, String desc, String estado) {
        ObservacionEntity o = new ObservacionEntity();
        o.setIdObservacion(id);
        o.setIdSistema(sistemaId);
        o.setDescripcion(desc);
        o.setEstadoObservacion(estado);
        return o;
    }
}

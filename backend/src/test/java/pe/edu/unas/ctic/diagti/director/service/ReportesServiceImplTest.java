package pe.edu.unas.ctic.diagti.director.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteRiesgoDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.mapper.RiesgoMapper;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.service.impl.ReportesServiceImpl;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportesServiceImplTest {

    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private ValidacionRepository validacionRepository;
    @Mock private DirectorSeguridadRepository seguridadRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private DirectorCatalogHelper catalogHelper;
    @Mock private RiesgoMapper riesgoMapper;

    @InjectMocks
    private ReportesServiceImpl service;

    @Test
    void reporteVacio() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        assertTrue(service.obtenerInventario(null, null).isEmpty());
        assertTrue(service.obtenerValidacion(null, null, null).isEmpty());
        assertTrue(service.obtenerRiesgos(null, null).isEmpty());
    }

    @Test
    void reporteFiltradoPorEstado() {
        SistemaEntity obs = new SistemaEntity();
        obs.setIdSistema(1L);
        obs.setCodigoUnico("SYS-REP-OBS");
        obs.setNombre("Obs");
        obs.setEstadoFlujo("OBSERVADO");
        obs.setValidaciones(List.of());

        SistemaEntity ok = new SistemaEntity();
        ok.setIdSistema(2L);
        ok.setCodigoUnico("SYS-REP-OK");
        ok.setNombre("Ok");
        ok.setEstadoFlujo("VALIDADO");
        ok.setValidaciones(List.of());

        when(sistemaRepository.findAllActivos()).thenReturn(List.of(obs, ok));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Académica");

        List<ReporteValidacionDTO> list = service.obtenerValidacion(null, "OBSERVADO", null);
        assertEquals(1, list.size());
        assertEquals("SYS-REP-OBS", list.get(0).getCodigo());
        assertNotNull(list.get(0).getFechaValidacionIso());
    }

    @Test
    void reporteInventarioYRiesgosIntegranValidacionInfra() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(3L);
        s.setCodigoUnico("SYS-REP-03");
        s.setNombre("Integra");
        s.setEstadoFlujo("ENVIADO");
        s.setObservaciones(List.of());
        s.setValidaciones(List.of());

        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Media");
        when(validacionRepository.findByIdSistema(3L)).thenReturn(List.of());
        when(seguridadRepository.findByIdSistema(3L)).thenReturn(List.of());
        when(observacionRepository.findByIdSistema(3L)).thenReturn(List.of());

        RiesgoDTO riesgo = new RiesgoDTO();
        riesgo.setCodigo("SYS-REP-03");
        riesgo.setTitulo("General");
        riesgo.setCategoria("General");
        riesgo.setNivel("controlado");
        riesgo.setNivelTexto("Bajo");
        riesgo.setEstado("controlado");
        riesgo.setDetectado("2026-07-22");
        when(riesgoMapper.calcularRiesgos(eq(s), anyList(), anyList(), anyList())).thenReturn(List.of(riesgo));

        List<ReporteInventarioDTO> inv = service.obtenerInventario(null, null);
        List<ReporteRiesgoDTO> riesgos = service.obtenerRiesgos(null, null);
        assertEquals(1, inv.size());
        assertEquals("ENVIADO", inv.get(0).getEstadoValidacion());
        assertEquals(1, riesgos.size());
        assertEquals("SYS-REP-03", riesgos.get(0).getCodigoSistema());
    }
}

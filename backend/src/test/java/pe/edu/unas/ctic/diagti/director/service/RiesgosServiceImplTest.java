package pe.edu.unas.ctic.diagti.director.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.mapper.RiesgoMapper;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.service.impl.RiesgosServiceImpl;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RiesgosServiceImplTest {

    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private ValidacionRepository validacionRepository;
    @Mock private DirectorSeguridadRepository seguridadRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private RiesgoMapper riesgoMapper;

    @InjectMocks
    private RiesgosServiceImpl service;

    @Test
    void riesgosBaseVacia() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        assertTrue(service.obtenerRiesgos(null, null, null, null).isEmpty());
    }

    @Test
    void riesgoSinObservaciones_controlado() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(1L);
        s.setCodigoUnico("SYS-R-01");
        s.setNombre("Sin obs");
        s.setEstadoFlujo("VALIDADO");
        s.setNivelRiesgo("BAJO");

        RiesgoDTO dto = new RiesgoDTO();
        dto.setId("R-1");
        dto.setCodigo("SYS-R-01");
        dto.setNivel("controlado");
        dto.setEstado("controlado");

        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s));
        when(validacionRepository.findByIdSistema(1L)).thenReturn(List.of());
        when(seguridadRepository.findByIdSistema(1L)).thenReturn(List.of());
        when(observacionRepository.findByIdSistema(1L)).thenReturn(List.of());
        when(riesgoMapper.calcularRiesgos(eq(s), anyList(), anyList(), anyList())).thenReturn(List.of(dto));

        List<RiesgoDTO> list = service.obtenerRiesgos(null, null, null, null);
        assertEquals(1, list.size());
        assertEquals("controlado", list.get(0).getNivel());
    }

    @Test
    void riesgoConObservacionesPendientes() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(2L);
        s.setCodigoUnico("SYS-R-02");
        s.setNombre("Con obs");
        s.setEstadoFlujo("OBSERVADO");

        ObservacionEntity obs = new ObservacionEntity();
        obs.setIdSistema(2L);
        obs.setDescripcion("[VALIDACION] Error");
        obs.setEstadoObservacion("PENDIENTE");

        RiesgoDTO dto = new RiesgoDTO();
        dto.setId("R-2");
        dto.setCodigo("SYS-R-02");
        dto.setNivel("advertencia");
        dto.setEstado("abierto");

        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s));
        when(validacionRepository.findByIdSistema(2L)).thenReturn(List.of());
        when(seguridadRepository.findByIdSistema(2L)).thenReturn(List.of());
        when(observacionRepository.findByIdSistema(2L)).thenReturn(List.of(obs));
        when(riesgoMapper.calcularRiesgos(eq(s), anyList(), anyList(), anyList())).thenReturn(List.of(dto));

        List<RiesgoDTO> list = service.obtenerRiesgos(null, null, null, null);
        assertEquals(1, list.size());
        assertEquals("advertencia", list.get(0).getNivel());
        assertEquals("abierto", list.get(0).getEstado());
    }

    @Test
    void unSoloRiesgoPorSistema() {
        DirectorCatalogHelper helper = org.mockito.Mockito.mock(DirectorCatalogHelper.class);
        when(helper.valorCatalogo(any())).thenReturn("Académica");
        when(helper.nombreUsuario(any())).thenReturn("Dev");

        RiesgoMapper mapper = new RiesgoMapper(helper);
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(9L);
        s.setCodigoUnico("SYS-UNICO");
        s.setNombre("Único");
        s.setEstadoFlujo("OBSERVADO");
        s.setNivelRiesgo("ALTO");
        s.setEsLegacy(true);
        s.setContratoVigente(false);

        ObservacionEntity obs = new ObservacionEntity();
        obs.setEstadoObservacion("PENDIENTE");
        obs.setDescripcion("[VALIDACION] x");

        List<RiesgoDTO> riesgos = mapper.calcularRiesgos(s, List.of(), List.of(), List.of(obs));
        assertEquals(1, riesgos.size());
        assertEquals("R-9", riesgos.get(0).getId());
    }
}

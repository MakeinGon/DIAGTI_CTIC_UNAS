package pe.edu.unas.ctic.diagti.director.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.dto.DashboardKpiDTO;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.service.DashboardService;
import pe.edu.unas.ctic.diagti.director.service.DirectorInventarioService;
import pe.edu.unas.ctic.diagti.director.service.ReportesService;
import pe.edu.unas.ctic.diagti.director.service.RiesgosService;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DirectorControllersCorsTest {

    private MockMvc dashboardMvc;
    private MockMvc riesgosMvc;
    private MockMvc reportesMvc;
    private MockMvc inventarioMvc;

    @Mock private DashboardService dashboardService;
    @Mock private RiesgosService riesgosService;
    @Mock private ReportesService reportesService;
    @Mock private CatalogoRepository catalogoRepository;
    @Mock private DirectorInventarioService inventarioService;

    @InjectMocks private DashboardController dashboardController;
    @InjectMocks private RiesgosController riesgosController;
    @InjectMocks private ReportesController reportesController;
    @InjectMocks private InventarioDirectorController inventarioController;

    @BeforeEach
    void setUp() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        dashboardMvc = MockMvcBuilders.standaloneSetup(dashboardController).setMessageConverters(converter).build();
        riesgosMvc = MockMvcBuilders.standaloneSetup(riesgosController).setMessageConverters(converter).build();
        reportesMvc = MockMvcBuilders.standaloneSetup(reportesController).setMessageConverters(converter).build();
        inventarioMvc = MockMvcBuilders.standaloneSetup(inventarioController).setMessageConverters(converter).build();
    }

    @Test
    void kpis_respondeOk_sinCors_yJsonEsperado() throws Exception {
        DashboardKpiDTO kpi = new DashboardKpiDTO();
        kpi.setTotalSistemas(0);
        kpi.setValidados(0);
        kpi.setObservados(0);
        kpi.setPendientes(0);
        when(dashboardService.obtenerKpis()).thenReturn(kpi);

        dashboardMvc.perform(get("/api/director/dashboard/kpis")
                        .accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSistemas").value(0))
                .andExpect(jsonPath("$.validados").value(0));
    }

    @Test
    void riesgos_respondeOk_sinCors() throws Exception {
        when(riesgosService.obtenerRiesgos(any(), any(), any(), any())).thenReturn(Collections.emptyList());
        riesgosMvc.perform(get("/api/director/riesgos")
                        .accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void reportesInventario_respondeOk() throws Exception {
        when(reportesService.obtenerInventario(any(), any())).thenReturn(List.of());
        reportesMvc.perform(get("/api/director/reportes/inventario")
                        .accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk());
    }

    @Test
    void inventario_respondeOk_listasVacias() throws Exception {
        when(inventarioService.listar(any(), any(), any(), any())).thenReturn(List.of());
        inventarioMvc.perform(get("/api/director/inventario")
                        .accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void estadosValidacion_sinNull() throws Exception {
        reportesMvc.perform(get("/api/director/reportes/catalogos/estados-validacion")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].valor").exists());
    }

    @Test
    void riesgosJsonFrontend() throws Exception {
        RiesgoDTO r = new RiesgoDTO();
        r.setId("R-1");
        r.setCodigo("SYS-1");
        r.setTitulo("Observaciones · Demo");
        r.setNivel("advertencia");
        r.setNivelTexto("Medio");
        r.setEstado("abierto");
        r.setArea("Académica");
        r.setCategoria("Observaciones");
        when(riesgosService.obtenerRiesgos(any(), any(), any(), any())).thenReturn(List.of(r));

        riesgosMvc.perform(get("/api/director/riesgos").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("SYS-1"))
                .andExpect(jsonPath("$[0].nivel").value("advertencia"))
                .andExpect(jsonPath("$[0].nivelTexto").value("Medio"));
    }
}

package pe.edu.unas.ctic.diagti.infraestructura.controller;

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
import pe.edu.unas.ctic.diagti.infraestructura.dto.InfraDashboardDTO;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraDashboardService;
import pe.edu.unas.ctic.diagti.infraestructura.service.InfraestructuraModuloService;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifica que los endpoints de Infraestructura no fallen con HTTP 400
 * por la combinación inválida allowCredentials=true + origin "*".
 */
@ExtendWith(MockitoExtension.class)
class InfraestructuraControllersCorsTest {

    private MockMvc dashboardMvc;
    private MockMvc sistemasMvc;

    @Mock
    private InfraDashboardService dashboardService;

    @Mock
    private InfraestructuraModuloService moduloService;

    @InjectMocks
    private InfraDashboardController dashboardController;

    @InjectMocks
    private InfraSistemasController sistemasController;

    @BeforeEach
    void setUp() {
        dashboardMvc = MockMvcBuilders.standaloneSetup(dashboardController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
        sistemasMvc = MockMvcBuilders.standaloneSetup(sistemasController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void dashboard_respondeOk_sinErrorCors() throws Exception {
        when(dashboardService.getDashboardData()).thenReturn(
                new InfraDashboardDTO(
                        new InfraDashboardDTO.Estadisticas(0, 0, 0, 0, 0, 0),
                        List.of(),
                        List.of(),
                        List.of()));

        dashboardMvc.perform(get("/api/infraestructura/dashboard")
                        .accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk());
    }

    @Test
    void sistemas_respondeOk_sinErrorCors() throws Exception {
        when(moduloService.listarSistemas(anyMap())).thenReturn(Collections.emptyList());

        sistemasMvc.perform(get("/api/infraestructura/sistemas")
                        .accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk());
    }
}

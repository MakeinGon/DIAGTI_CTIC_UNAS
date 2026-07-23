package pe.edu.unas.ctic.diagti.desarrollador.controller;

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
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DesarrolladorInventarioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DesarrolladorInventarioService inventarioService;

    @InjectMocks
    private DesarrolladorInventarioController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void inventarioDevuelveJsonFrontend() throws Exception {
        SistemaFrontendDTO dto = SistemaFrontendDTO.builder()
                .id("1")
                .codigo("SYS-001")
                .nombre("Académico")
                .estado("Borrador")
                .observacionesValidador(List.of())
                .evidencias(List.of())
                .urls(List.of())
                .build();
        when(inventarioService.listarSistemasDelDesarrollador(eq("71234567"), anyMap()))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/desarrollador/inventario")
                        .param("username", "71234567")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("SYS-001"))
                .andExpect(jsonPath("$[0].estado").value("Borrador"))
                .andExpect(jsonPath("$[0].observaciones_validador").isArray());
    }

    @Test
    void rolNoAutorizado_propagaError() throws Exception {
        when(inventarioService.listarSistemasDelDesarrollador(eq("74331380"), anyMap()))
                .thenThrow(new ResponseStatusException(FORBIDDEN, "Rol no autorizado"));

        mockMvc.perform(get("/api/desarrollador/inventario")
                        .param("username", "74331380"))
                .andExpect(status().isForbidden());
    }

    @Test
    void conteoObservaciones() throws Exception {
        when(inventarioService.contarObservaciones("71234567"))
                .thenReturn(Map.of("pendientes", 2L, "atendidas", 1L, "total", 3L));

        mockMvc.perform(get("/api/desarrollador/observaciones/conteo")
                        .param("username", "71234567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendientes").value(2))
                .andExpect(jsonPath("$.atendidas").value(1));
    }
}

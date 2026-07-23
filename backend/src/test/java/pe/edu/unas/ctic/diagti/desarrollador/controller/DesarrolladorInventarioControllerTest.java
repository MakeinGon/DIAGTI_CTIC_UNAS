package pe.edu.unas.ctic.diagti.desarrollador.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.GlobalExceptionHandler;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DesarrolladorInventarioControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private DesarrolladorInventarioService inventarioService;

    @InjectMocks
    private DesarrolladorInventarioController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
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
    void listarSinUsername_responde400() throws Exception {
        mockMvc.perform(get("/api/desarrollador/inventario")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("username")));
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

    @Test
    void registrarSistema_ok() throws Exception {
        RegistrarSistemaOficialRequestDTO req = baseRequest("SYS-TMP-001");
        RegistrarSistemaOficialResponseDTO resp = RegistrarSistemaOficialResponseDTO.builder()
                .success(true)
                .message("Sistema registrado correctamente")
                .sistema(SistemaFrontendDTO.builder()
                        .id("99")
                        .codigo("SYS-TMP-001")
                        .nombre("Temporal")
                        .estado("Borrador")
                        .responsableTecnico("Juan Perez")
                        .build())
                .build();
        when(inventarioService.registrarSistemaOficial(eq("71234567"), any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/desarrollador/inventario")
                        .param("username", "71234567")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.sistema.codigo").value("SYS-TMP-001"));
        verify(inventarioService).registrarSistemaOficial(eq("71234567"), any());
    }

    @Test
    void registrarCodigoDuplicado_409() throws Exception {
        when(inventarioService.registrarSistemaOficial(eq("71234567"), any()))
                .thenThrow(new ConflictException("Ya existe un sistema con el código SYS-001"));

        mockMvc.perform(post("/api/desarrollador/inventario")
                        .param("username", "71234567")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(baseRequest("SYS-001"))))
                .andExpect(status().isConflict());
    }

    @Test
    void registrarUsuarioInexistente_401() throws Exception {
        when(inventarioService.registrarSistemaOficial(eq("00000000"), any()))
                .thenThrow(new ResponseStatusException(UNAUTHORIZED, "Usuario no encontrado o inactivo"));

        mockMvc.perform(post("/api/desarrollador/inventario")
                        .param("username", "00000000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(baseRequest("SYS-TMP-002"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrarRolNoDesarrollo_403() throws Exception {
        when(inventarioService.registrarSistemaOficial(eq("74331380"), any()))
                .thenThrow(new ResponseStatusException(FORBIDDEN, "Rol no autorizado para el módulo desarrollador"));

        mockMvc.perform(post("/api/desarrollador/inventario")
                        .param("username", "74331380")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(baseRequest("SYS-TMP-003"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void registrarCatalogoInexistente_404() throws Exception {
        when(inventarioService.registrarSistemaOficial(eq("71234567"), any()))
                .thenThrow(new ResourceNotFoundException("Catálogo inexistente: AREA_USUARIO/ZZZ"));

        mockMvc.perform(post("/api/desarrollador/inventario")
                        .param("username", "71234567")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(baseRequest("SYS-TMP-004"))))
                .andExpect(status().isNotFound());
    }

    private RegistrarSistemaOficialRequestDTO baseRequest(String codigo) {
        RegistrarSistemaOficialRequestDTO req = new RegistrarSistemaOficialRequestDTO();
        req.setCodigoUnico(codigo);
        req.setNombre("Sistema temporal prueba");
        req.setDescripcion("Descripción de prueba");
        req.setAreaCodigo("ACAD");
        req.setTipoCodigo("WEB");
        req.setCriticidadCodigo("MEDIO");
        req.setFormaAdquisicion("Desarrollo CTIC");
        req.setAnoAdquisicion(2026);
        req.setEstadoFlujo("BORRADOR");
        req.setNivelRiesgo("MEDIO");
        req.setPrioridadMigracion("CORTO PLAZO");
        req.setDesarrolladorNombre("CTIC UNAS");
        req.setContratoVigente(false);
        req.setEsLegacy(false);
        return req;
    }
}

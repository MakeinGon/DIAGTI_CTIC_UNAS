package pe.edu.unas.ctic.diagti.auditor.controller;

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
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorReporteResumenDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaInventarioDTO;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorAuditoriaService;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorInventarioService;
import pe.edu.unas.ctic.diagti.auditor.service.AuditorReportesService;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class AuditorControllersTest {

    private MockMvc inventarioMvc;
    private MockMvc auditoriaMvc;
    private MockMvc reportesMvc;

    @Mock private AuditorInventarioService inventarioService;
    @Mock private AuditorAuditoriaService auditoriaService;
    @Mock private AuditorReportesService reportesService;

    @InjectMocks private AuditorInventarioController inventarioController;
    @InjectMocks private AuditorAuditoriaController auditoriaController;
    @InjectMocks private AuditorReportesController reportesController;

    @BeforeEach
    void setUp() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        inventarioMvc = MockMvcBuilders.standaloneSetup(inventarioController).setMessageConverters(converter).build();
        auditoriaMvc = MockMvcBuilders.standaloneSetup(auditoriaController).setMessageConverters(converter).build();
        reportesMvc = MockMvcBuilders.standaloneSetup(reportesController).setMessageConverters(converter).build();
    }

    @Test
    void inventario_vacio_200() throws Exception {
        when(inventarioService.listar(any(), any(), any(), any(), any())).thenReturn(List.of());
        inventarioMvc.perform(get("/api/auditor/inventario").accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void inventario_conDatos_jsonEsperado() throws Exception {
        AuditorSistemaInventarioDTO dto = new AuditorSistemaInventarioDTO();
        dto.setSistemaId(1L);
        dto.setCodigo("SYS-1");
        dto.setNombre("Demo");
        dto.setEstado("PENDIENTE");
        dto.setCantidadObservaciones(0);
        when(inventarioService.listar(any(), any(), any(), any(), any())).thenReturn(List.of(dto));

        inventarioMvc.perform(get("/api/auditor/inventario").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sistemaId").value(1))
                .andExpect(jsonPath("$[0].codigo").value("SYS-1"))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));
    }

    @Test
    void detalle_inexistente_404() throws Exception {
        when(inventarioService.obtenerDetalle(anyLong()))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Sistema no encontrado"));
        inventarioMvc.perform(get("/api/auditor/inventario/999").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void detalle_existente_200() throws Exception {
        AuditorSistemaDetalleDTO dto = new AuditorSistemaDetalleDTO();
        dto.setSistemaId(3L);
        dto.setCodigo("SYS-3");
        dto.setObservaciones(Collections.emptyList());
        dto.setValidaciones(Collections.emptyList());
        when(inventarioService.obtenerDetalle(3L)).thenReturn(dto);

        inventarioMvc.perform(get("/api/auditor/inventario/3").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sistemaId").value(3))
                .andExpect(jsonPath("$.observaciones").isArray());
    }

    @Test
    void auditoria_vacia_sinCors() throws Exception {
        when(auditoriaService.getAuditoria(any())).thenReturn(List.of());
        auditoriaMvc.perform(get("/api/auditor/auditoria").accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void auditoria_post_compatibilidad() throws Exception {
        when(auditoriaService.getAuditoria(any())).thenReturn(List.of());
        auditoriaMvc.perform(post("/api/auditor/auditoria")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accion\":\"Consulta\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void reportes_resumen_vacio() throws Exception {
        when(reportesService.obtenerResumen()).thenReturn(new AuditorReporteResumenDTO());
        reportesMvc.perform(get("/api/auditor/reportes/resumen").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSistemas").value(0));
    }

    @Test
    void observaciones_endpoint() throws Exception {
        when(inventarioService.listarObservaciones(isNull(), isNull())).thenReturn(List.of());
        inventarioMvc.perform(get("/api/auditor/observaciones").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void kpis_inventario() throws Exception {
        when(inventarioService.obtenerKpis()).thenReturn(Map.of("total", 0L, "pendientes", 0L, "riesgo", 0L, "contrato", 0L));
        inventarioMvc.perform(get("/api/auditor/inventario/kpis").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }
}

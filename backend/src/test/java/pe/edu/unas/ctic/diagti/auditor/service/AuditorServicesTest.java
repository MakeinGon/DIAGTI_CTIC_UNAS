package pe.edu.unas.ctic.diagti.auditor.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaRequestDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorAuditoriaResponseDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorReporteResumenDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.auditor.dto.AuditorSistemaInventarioDTO;
import pe.edu.unas.ctic.diagti.auditor.repository.AuditorAuditoriaRepository;
import pe.edu.unas.ctic.diagti.auditor.service.impl.AuditorAuditoriaServiceImpl;
import pe.edu.unas.ctic.diagti.auditor.service.impl.AuditorInventarioServiceImpl;
import pe.edu.unas.ctic.diagti.auditor.service.impl.AuditorReportesServiceImpl;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorArquitecturaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorInfraestructuraRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorIntegracionRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditorServicesTest {

    @Mock DirectorSistemaRepository sistemaRepository;
    @Mock ObservacionRepository observacionRepository;
    @Mock ValidacionRepository validacionRepository;
    @Mock DirectorArquitecturaRepository arquitecturaRepository;
    @Mock DirectorInfraestructuraRepository infraestructuraRepository;
    @Mock DirectorSeguridadRepository seguridadRepository;
    @Mock DirectorIntegracionRepository integracionRepository;
    @Mock DirectorEvidenciaRepository evidenciaRepository;
    @Mock AuditorAuditoriaRepository auditoriaRepository;
    @Mock LoginUsuarioRepository usuarioRepository;
    @Mock DirectorCatalogHelper catalogHelper;

    @InjectMocks AuditorInventarioServiceImpl inventarioService;
    @InjectMocks AuditorAuditoriaServiceImpl auditoriaService;
    @InjectMocks AuditorReportesServiceImpl reportesService;

    @Test
    void inventario_baseVacia_retornaListaVacia() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        assertTrue(inventarioService.listar(null, null, null, null, null).isEmpty());
    }

    @Test
    void inventario_conSistemas_retornaDto() {
        SistemaEntity s = sistema(1L, "SYS-A", "Alpha", "OBSERVADO", "ALTO");
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Académica");
        when(catalogHelper.nombreUsuario(any())).thenReturn("Dev Uno");

        List<AuditorSistemaInventarioDTO> lista = inventarioService.listar(null, null, null, null, null);
        assertEquals(1, lista.size());
        assertEquals(1L, lista.get(0).getSistemaId());
        assertEquals("SYS-A", lista.get(0).getCodigo());
        assertEquals("OBSERVADO", lista.get(0).getEstado());
    }

    @Test
    void inventario_filtroEstado() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(
                sistema(1L, "A", "A", "VALIDADO", "BAJO"),
                sistema(2L, "B", "B", "OBSERVADO", "ALTO")
        ));
        when(catalogHelper.valorCatalogo(any())).thenReturn("X");
        when(catalogHelper.nombreUsuario(any())).thenReturn("U");

        assertEquals(1, inventarioService.listar(null, null, null, "OBSERVADO", null).size());
    }

    @Test
    void inventario_filtroArea() {
        SistemaEntity s1 = sistema(1L, "A", "A", "PENDIENTE", "BAJO");
        s1.setIdAreaUsuario(1L);
        SistemaEntity s2 = sistema(2L, "B", "B", "PENDIENTE", "BAJO");
        s2.setIdAreaUsuario(2L);
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s1, s2));
        when(catalogHelper.valorCatalogo(any())).thenAnswer(inv -> {
            Long id = inv.getArgument(0);
            if (Long.valueOf(1L).equals(id)) return "Académica";
            if (Long.valueOf(2L).equals(id)) return "Administrativa";
            return "No especificada";
        });
        when(catalogHelper.nombreUsuario(any())).thenReturn("U");

        assertEquals(1, inventarioService.listar(null, null, "Académica", null, null).size());
    }

    @Test
    void inventario_filtroCriticidad() {
        SistemaEntity s1 = sistema(1L, "A", "A", "PENDIENTE", "BAJO");
        s1.setIdCriticidad(10L);
        SistemaEntity s2 = sistema(2L, "B", "B", "PENDIENTE", "ALTO");
        s2.setIdCriticidad(20L);
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s1, s2));
        when(catalogHelper.valorCatalogo(any())).thenAnswer(inv -> {
            Long id = inv.getArgument(0);
            if (Long.valueOf(10L).equals(id)) return "Alta";
            if (Long.valueOf(20L).equals(id)) return "Baja";
            return "No especificada";
        });
        when(catalogHelper.nombreUsuario(any())).thenReturn("U");

        assertEquals(1, inventarioService.listar(null, null, null, null, "Alta").size());
    }

    @Test
    void detalle_sistemaExistente() {
        SistemaEntity s = sistema(5L, "SYS-5", "Detalle", "VALIDADO", "BAJO");
        when(sistemaRepository.findActivoById(5L)).thenReturn(Optional.of(s));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Area");
        when(catalogHelper.nombreUsuario(any())).thenReturn("Resp");
        when(observacionRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(infraestructuraRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(arquitecturaRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(seguridadRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(integracionRepository.findByIdSistemaOrigen(5L)).thenReturn(List.of());
        when(evidenciaRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(validacionRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(auditoriaRepository.findAllOrderByFechaDesc()).thenReturn(List.of());
        when(usuarioRepository.findAll()).thenReturn(List.of());

        AuditorSistemaDetalleDTO dto = inventarioService.obtenerDetalle(5L);
        assertEquals(5L, dto.getSistemaId());
        assertTrue(dto.getObservaciones().isEmpty());
        assertTrue(dto.getValidaciones().isEmpty());
    }

    @Test
    void detalle_sistemaInexistente_404() {
        when(sistemaRepository.findActivoById(999L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> inventarioService.obtenerDetalle(999L));
    }

    @Test
    void detalle_consolidado_incluyeValidacionEInfra() {
        SistemaEntity s = sistema(7L, "SYS-7", "Consol", "OBSERVADO", "ALTO");
        when(sistemaRepository.findActivoById(7L)).thenReturn(Optional.of(s));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Area");
        when(catalogHelper.nombreUsuario(any())).thenReturn("Resp");

        ObservacionEntity obs = new ObservacionEntity();
        obs.setIdObservacion(1L);
        obs.setIdSistema(7L);
        obs.setIdValidacion(2L);
        obs.setDescripcion("[VALIDACION] Falta evidencia");
        obs.setEstadoObservacion("PENDIENTE");

        ValidacionEntity val = new ValidacionEntity();
        val.setIdValidacion(2L);
        val.setIdSistema(7L);
        val.setEstadoValidacion("OBSERVADO");
        val.setResultado("Con observaciones");

        when(observacionRepository.findByIdSistema(7L)).thenReturn(List.of(obs));
        when(validacionRepository.findByIdSistema(7L)).thenReturn(List.of(val));
        when(infraestructuraRepository.findByIdSistema(7L)).thenReturn(List.of());
        when(arquitecturaRepository.findByIdSistema(7L)).thenReturn(List.of());
        when(seguridadRepository.findByIdSistema(7L)).thenReturn(List.of());
        when(integracionRepository.findByIdSistemaOrigen(7L)).thenReturn(List.of());
        when(evidenciaRepository.findByIdSistema(7L)).thenReturn(List.of());
        when(auditoriaRepository.findAllOrderByFechaDesc()).thenReturn(List.of());
        when(usuarioRepository.findAll()).thenReturn(List.of());

        AuditorSistemaDetalleDTO dto = inventarioService.obtenerDetalle(7L);
        assertEquals(1, dto.getCantidadObservaciones());
        assertEquals("VALIDACION", dto.getObservaciones().get(0).getOrigen());
        assertEquals(1, dto.getValidaciones().size());
    }

    @Test
    void auditoria_vacia() {
        when(auditoriaRepository.findAllOrderByFechaDesc()).thenReturn(List.of());
        when(usuarioRepository.findAll()).thenReturn(List.of());
        assertTrue(auditoriaService.getAuditoria(new AuditorAuditoriaRequestDTO()).isEmpty());
    }

    @Test
    void auditoria_conRegistros() {
        AuditoriaEntity a = new AuditoriaEntity();
        a.setIdAuditoria(1L);
        a.setModulo("Inventario");
        a.setAccion("Consulta");
        a.setDescripcion("Consulta de SYS-A");
        a.setFechaEvento(LocalDateTime.now());
        a.setDireccionIp("127.0.0.1");
        when(auditoriaRepository.findAllOrderByFechaDesc()).thenReturn(List.of(a));
        when(usuarioRepository.findAll()).thenReturn(List.of());

        List<AuditorAuditoriaResponseDTO> lista = auditoriaService.getAuditoria(new AuditorAuditoriaRequestDTO());
        assertEquals(1, lista.size());
        assertEquals("Consulta", lista.get(0).getAccion());
    }

    @Test
    void auditoria_filtroAccion() {
        AuditoriaEntity a = new AuditoriaEntity();
        a.setIdAuditoria(1L);
        a.setModulo("Inventario");
        a.setAccion("Consulta");
        a.setDescripcion("x");
        a.setFechaEvento(LocalDateTime.now());
        when(auditoriaRepository.findAllOrderByFechaDesc()).thenReturn(List.of(a));
        when(usuarioRepository.findAll()).thenReturn(List.of());

        AuditorAuditoriaRequestDTO req = new AuditorAuditoriaRequestDTO();
        req.setAccion("Exportación");
        assertTrue(auditoriaService.getAuditoria(req).isEmpty());
    }

    @Test
    void auditoria_filtroUsuario() {
        AuditoriaEntity a = new AuditoriaEntity();
        a.setIdAuditoria(1L);
        a.setModulo("Inventario");
        a.setAccion("Consulta");
        a.setDescripcion("x");
        a.setFechaEvento(LocalDateTime.now());
        when(auditoriaRepository.findAllOrderByFechaDesc()).thenReturn(List.of(a));
        when(usuarioRepository.findAll()).thenReturn(List.of());

        AuditorAuditoriaRequestDTO req = new AuditorAuditoriaRequestDTO();
        req.setUsuario("inexistente");
        assertTrue(auditoriaService.getAuditoria(req).isEmpty());
    }

    @Test
    void auditoria_filtroSistema() {
        AuditoriaEntity a = new AuditoriaEntity();
        a.setIdAuditoria(1L);
        a.setModulo("Inventario");
        a.setAccion("Consulta");
        a.setDescripcion("sistema_id=9 codigo SYS-X");
        a.setFechaEvento(LocalDateTime.now());
        when(auditoriaRepository.findAllOrderByFechaDesc()).thenReturn(List.of(a));
        when(usuarioRepository.findAll()).thenReturn(List.of());
        when(sistemaRepository.findActivoById(9L)).thenReturn(Optional.of(sistema(9L, "SYS-X", "X", "PENDIENTE", "BAJO")));

        AuditorAuditoriaRequestDTO req = new AuditorAuditoriaRequestDTO();
        req.setSistemaId(9L);
        assertEquals(1, auditoriaService.getAuditoria(req).size());
    }

    @Test
    void reportes_baseVacia() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        when(observacionRepository.findAll()).thenReturn(List.of());
        when(auditoriaRepository.findAll()).thenReturn(List.of());
        when(validacionRepository.findAll()).thenReturn(List.of());
        when(infraestructuraRepository.findAll()).thenReturn(List.of());

        AuditorReporteResumenDTO resumen = reportesService.obtenerResumen();
        assertEquals(0, resumen.getTotalSistemas());
        assertEquals(0, resumen.getSistemasObservados());
        assertTrue(resumen.getPorEstado().isEmpty() || resumen.getPorEstado().values().stream().allMatch(v -> v == 0));
        assertTrue(resumen.getSistemasConMasObservaciones().isEmpty());
    }

    @Test
    void reportes_conDatos_conteos() {
        SistemaEntity s1 = sistema(1L, "A", "A", "VALIDADO", "BAJO");
        s1.setIdCriticidad(1L);
        s1.setIdAreaUsuario(1L);
        SistemaEntity s2 = sistema(2L, "B", "B", "OBSERVADO", "ALTO");
        s2.setIdCriticidad(2L);
        s2.setIdAreaUsuario(2L);
        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s1, s2));
        when(catalogHelper.valorCatalogo(1L)).thenReturn("Alta");
        when(catalogHelper.valorCatalogo(2L)).thenReturn("Baja");
        when(observacionRepository.findAll()).thenReturn(List.of());
        when(auditoriaRepository.findAll()).thenReturn(List.of());
        when(validacionRepository.findAll()).thenReturn(List.of());
        when(infraestructuraRepository.findAll()).thenReturn(List.of());

        AuditorReporteResumenDTO resumen = reportesService.obtenerResumen();
        assertEquals(2, resumen.getTotalSistemas());
        assertEquals(1, resumen.getSistemasValidados());
        assertEquals(1, resumen.getSistemasObservados());
        assertEquals(1L, resumen.getPorEstado().get("VALIDADO"));
        assertEquals(1L, resumen.getPorCriticidad().get("Alta"));
    }

    @Test
    void observaciones_porPrefijo() {
        ObservacionEntity o1 = new ObservacionEntity();
        o1.setIdObservacion(1L);
        o1.setIdSistema(1L);
        o1.setIdValidacion(1L);
        o1.setDescripcion("[INFRAESTRUCTURA] Capacidad");
        o1.setEstadoObservacion("PENDIENTE");
        ObservacionEntity o2 = new ObservacionEntity();
        o2.setIdObservacion(2L);
        o2.setIdSistema(1L);
        o2.setIdValidacion(1L);
        o2.setDescripcion("[VALIDACION] Docs");
        o2.setEstadoObservacion("PENDIENTE");
        when(observacionRepository.findByIdSistema(1L)).thenReturn(List.of(o1, o2));

        assertEquals(1, inventarioService.listarObservaciones(1L, "INFRAESTRUCTURA").size());
        assertEquals(1, inventarioService.listarObservaciones(1L, "VALIDACION").size());
    }

    @Test
    void reportes_datos_sistemas_sinNull() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        List<Map<String, Object>> datos = reportesService.obtenerDatos("sistemas");
        assertTrue(datos.isEmpty());
    }

    @Test
    void auditor_noModificaDatos_soloLectura() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        inventarioService.listar(null, null, null, null, null);
        verify(sistemaRepository, never()).save(any());
        verify(observacionRepository, never()).save(any());
        verify(auditoriaRepository, never()).save(any());
    }

    private SistemaEntity sistema(Long id, String codigo, String nombre, String estado, String riesgo) {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(id);
        s.setCodigoUnico(codigo);
        s.setNombre(nombre);
        s.setEstadoFlujo(estado);
        s.setNivelRiesgo(riesgo);
        s.setObservaciones(List.of());
        return s;
    }
}

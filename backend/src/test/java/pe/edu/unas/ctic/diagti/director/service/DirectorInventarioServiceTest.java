package pe.edu.unas.ctic.diagti.director.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.director.dto.SistemaDetalleDirectorDTO;
import pe.edu.unas.ctic.diagti.director.dto.SistemaInventarioDTO;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.*;
import pe.edu.unas.ctic.diagti.director.service.impl.DirectorInventarioServiceImpl;
import pe.edu.unas.ctic.diagti.director.support.DirectorCatalogHelper;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DirectorInventarioServiceTest {

    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private ValidacionRepository validacionRepository;
    @Mock private DirectorArquitecturaRepository arquitecturaRepository;
    @Mock private DirectorInfraestructuraRepository infraestructuraRepository;
    @Mock private DirectorSeguridadRepository seguridadRepository;
    @Mock private DirectorIntegracionRepository integracionRepository;
    @Mock private DirectorEvidenciaRepository evidenciaRepository;
    @Mock private AuditoriaRepository auditoriaRepository;
    @Mock private DirectorCatalogHelper catalogHelper;

    @InjectMocks
    private DirectorInventarioServiceImpl service;

    @Test
    void inventarioVacio() {
        when(sistemaRepository.findAllActivos()).thenReturn(List.of());
        assertTrue(service.listar(null, null, null, null).isEmpty());
    }

    @Test
    void inventarioConSistemas() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(5L);
        s.setCodigoUnico("SYS-INV-01");
        s.setNombre("Inventario");
        s.setEstadoFlujo("ENVIADO");
        s.setObservaciones(List.of());
        s.setValidaciones(List.of());

        when(sistemaRepository.findAllActivos()).thenReturn(List.of(s));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Media");
        when(catalogHelper.nombreUsuario(any())).thenReturn("Dev");
        when(infraestructuraRepository.findByIdSistema(5L)).thenReturn(List.of());

        List<SistemaInventarioDTO> list = service.listar(null, null, null, null);
        assertEquals(1, list.size());
        assertEquals(5L, list.get(0).getSistemaId());
        assertEquals("SYS-INV-01", list.get(0).getCodigo());
        assertNotNull(list.get(0).getCantidadObservaciones());
    }

    @Test
    void detalleExistente() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(5L);
        s.setCodigoUnico("SYS-INV-01");
        s.setNombre("Inventario");
        s.setEstadoFlujo("VALIDADO");
        s.setObservaciones(List.of());
        s.setValidaciones(List.of());

        when(sistemaRepository.findActivoById(5L)).thenReturn(Optional.of(s));
        when(catalogHelper.valorCatalogo(any())).thenReturn("Alta");
        when(catalogHelper.nombreUsuario(any())).thenReturn("Dev");
        when(observacionRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(infraestructuraRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(arquitecturaRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(seguridadRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(integracionRepository.findByIdSistemaOrigen(5L)).thenReturn(List.of());
        when(evidenciaRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(validacionRepository.findByIdSistema(5L)).thenReturn(List.of());
        when(auditoriaRepository.findTop100ByOrderByFechaEventoDesc()).thenReturn(List.of());

        SistemaDetalleDirectorDTO dto = service.obtenerDetalle(5L);
        assertEquals(5L, dto.getSistemaId());
        assertNotNull(dto.getObservaciones());
        assertNotNull(dto.getValidaciones());
        assertTrue(dto.getObservaciones().isEmpty());
        assertFalse(dto.toString().toLowerCase().contains("password"));
    }

    @Test
    void detalleInexistente() {
        when(sistemaRepository.findActivoById(99L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.obtenerDetalle(99L));
    }
}

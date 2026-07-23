package pe.edu.unas.ctic.diagti.administrador.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unas.ctic.diagti.administrador.dto.CatalogoDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.RolDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaResponsablesRequestDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import pe.edu.unas.ctic.diagti.administrador.mapper.CatalogoMapper;
import pe.edu.unas.ctic.diagti.administrador.mapper.UsuarioMapper;
import pe.edu.unas.ctic.diagti.administrador.repository.AdministradorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.RolRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.impl.CatalogoServiceImpl;
import pe.edu.unas.ctic.diagti.administrador.service.impl.RolServiceImpl;
import pe.edu.unas.ctic.diagti.administrador.service.impl.SistemaAdminServiceImpl;
import pe.edu.unas.ctic.diagti.administrador.service.impl.UsuarioServiceImpl;
import pe.edu.unas.ctic.diagti.administrador.support.AdminAuditoriaWriter;
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdministradorServicesTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock RolRepository rolRepository;
    @Mock CatalogoRepository catalogoRepository;
    @Mock DirectorSistemaRepository sistemaRepository;
    @Mock AdministradorEvidenciaRepository evidenciaRepository;
    @Mock AuditoriaRepository auditoriaRepository;
    @Mock UsuarioMapper usuarioMapper;
    @Mock CatalogoMapper catalogoMapper;
    @Mock AdminAuditoriaWriter auditoriaWriter;

    @InjectMocks UsuarioServiceImpl usuarioService;
    @InjectMocks RolServiceImpl rolService;
    @InjectMocks CatalogoServiceImpl catalogoService;
    @InjectMocks SistemaAdminServiceImpl sistemaAdminService;

    private UsuarioEntity usuarioActivo;
    private RolEntity rolAdmin;

    @BeforeEach
    void setUp() {
        rolAdmin = new RolEntity();
        rolAdmin.setIdRol(1L);
        rolAdmin.setNombre("admin");
        rolAdmin.setEstado(true);

        usuarioActivo = new UsuarioEntity();
        usuarioActivo.setIdUsuario(10L);
        usuarioActivo.setDni("76551691");
        usuarioActivo.setUsername("76551691");
        usuarioActivo.setNombres("Johan");
        usuarioActivo.setApellidos("Vela");
        usuarioActivo.setCorreo("johan.vela@unas.edu.pe");
        usuarioActivo.setEstado(true);
        usuarioActivo.setRoles(new HashSet<>(List.of(rolAdmin)));
    }

    @Test
    void listarUsuarios_vacio() {
        when(usuarioRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(Collections.emptyList());
        assertTrue(usuarioService.listar(null, null, null, null).isEmpty());
    }

    @Test
    void listarUsuarios_conDatos() {
        when(usuarioRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(List.of(usuarioActivo));
        UsuarioDTO dto = new UsuarioDTO();
        dto.setDni("76551691");
        dto.setUsername("76551691");
        when(usuarioMapper.toDTO(usuarioActivo)).thenReturn(dto);

        List<UsuarioDTO> lista = usuarioService.listar(null, null, null, null);
        assertEquals(1, lista.size());
        assertEquals("76551691", lista.get(0).getUsername());
    }

    @Test
    void detalleUsuario_existente() {
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        UsuarioDTO dto = new UsuarioDTO();
        dto.setDni("76551691");
        when(usuarioMapper.toDTO(usuarioActivo)).thenReturn(dto);
        assertEquals("76551691", usuarioService.obtenerPorDni("76551691").getDni());
    }

    @Test
    void detalleUsuario_inexistente_404() {
        when(usuarioRepository.findByDni("00000000")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> usuarioService.obtenerPorDni("00000000"));
    }

    @Test
    void crearUsuario_valido() {
        UsuarioDTO req = new UsuarioDTO();
        req.setDni("89999999");
        req.setNombreCompleto("Nuevo Usuario");
        req.setCorreo("nuevo.usuario@unas.edu.pe");
        req.setOrigen("Local");
        req.setEstado("Activo");

        when(usuarioRepository.existsByDni("89999999")).thenReturn(false);
        when(usuarioRepository.existsByCorreo(anyString())).thenReturn(false);
        when(usuarioRepository.existsByUsername("89999999")).thenReturn(false);
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolAdmin));
        when(usuarioRepository.save(any(UsuarioEntity.class))).thenAnswer(inv -> {
            UsuarioEntity e = inv.getArgument(0);
            e.setIdUsuario(99L);
            return e;
        });
        when(usuarioMapper.toDTO(any())).thenAnswer(inv -> {
            UsuarioEntity e = inv.getArgument(0);
            UsuarioDTO d = new UsuarioDTO();
            d.setUsuarioId(e.getIdUsuario());
            d.setUsername(e.getUsername());
            d.setDni(e.getDni());
            d.setCorreo(e.getCorreo());
            return d;
        });

        UsuarioDTO creado = usuarioService.crear(req, 1L);
        assertEquals("89999999", creado.getUsername());
        verify(auditoriaWriter).registrar(anyLong(), eq("usuario creado"), anyString());

        ArgumentCaptor<UsuarioEntity> captor = ArgumentCaptor.forClass(UsuarioEntity.class);
        verify(usuarioRepository).save(captor.capture());
        assertEquals("admin123", captor.getValue().getPasswordHash());
        assertNotNull(captor.getValue().getPasswordHash());
    }

    @Test
    void crearUsuario_usernameDuplicado_409() {
        UsuarioDTO req = new UsuarioDTO();
        req.setDni("76551691");
        req.setNombreCompleto("Dup User");
        req.setCorreo("otro@unas.edu.pe");
        when(usuarioRepository.existsByDni("76551691")).thenReturn(true);
        assertThrows(ConflictException.class, () -> usuarioService.crear(req, 1L));
    }

    @Test
    void crearUsuario_correoDuplicado_409() {
        UsuarioDTO req = new UsuarioDTO();
        req.setDni("81111111");
        req.setNombreCompleto("Dup Mail");
        req.setCorreo("johan.vela@unas.edu.pe");
        when(usuarioRepository.existsByDni("81111111")).thenReturn(false);
        when(usuarioRepository.existsByCorreo("johan.vela@unas.edu.pe")).thenReturn(true);
        assertThrows(ConflictException.class, () -> usuarioService.crear(req, 1L));
    }

    @Test
    void actualizarUsuario() {
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolAdmin));
        when(usuarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioMapper.toDTO(any())).thenReturn(new UsuarioDTO());

        UsuarioDTO req = new UsuarioDTO();
        req.setNombreCompleto("Johan Actualizado");
        req.setCorreo("johan.vela@unas.edu.pe");
        req.setEstado("Activo");
        assertDoesNotThrow(() -> usuarioService.actualizar("76551691", req, 1L));
        verify(auditoriaWriter).registrar(anyLong(), eq("usuario actualizado"), anyString());
    }

    @Test
    void activarYDesactivarUsuario() {
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        when(usuarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioMapper.toDTO(any())).thenReturn(new UsuarioDTO());

        usuarioService.cambiarEstado("76551691", true);
        usuarioService.cambiarEstado("76551691", false);
        usuarioService.desactivar("76551691");
        assertFalse(usuarioActivo.getEstado());
    }

    @Test
    void dtoNoExponePasswordHash() {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsername("x");
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        when(usuarioMapper.toDTO(usuarioActivo)).thenReturn(dto);
        UsuarioDTO out = usuarioService.obtenerPorDni("76551691");
        assertDoesNotThrow(() -> out.getClass().getDeclaredField("usuarioId"));
        assertThrows(NoSuchFieldException.class, () -> out.getClass().getDeclaredField("passwordHash"));
        assertThrows(NoSuchFieldException.class, () -> out.getClass().getDeclaredField("password_hash"));
    }

    @Test
    void listarRoles() {
        when(rolRepository.findAll()).thenReturn(List.of(rolAdmin));
        when(rolRepository.contarUsuariosPorRol(1L)).thenReturn(2L);
        List<RolDTO> roles = rolService.listar();
        assertEquals(1, roles.size());
        assertEquals("admin", roles.get(0).getNombre());
    }

    @Test
    void asignarRol_idempotente() {
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolAdmin));
        when(usuarioMapper.toDTO(any())).thenReturn(new UsuarioDTO());
        usuarioService.asignarRol("76551691", 1L);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void asignarRol_nuevo() {
        RolEntity otro = new RolEntity();
        otro.setIdRol(2L);
        otro.setNombre("auditor");
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        when(rolRepository.findById(2L)).thenReturn(Optional.of(otro));
        when(usuarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioMapper.toDTO(any())).thenReturn(new UsuarioDTO());
        usuarioService.asignarRol("76551691", 2L);
        verify(auditoriaWriter).registrar(anyLong(), eq("rol asignado"), anyString());
    }

    @Test
    void retirarRol() {
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolAdmin));
        when(usuarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioMapper.toDTO(any())).thenReturn(new UsuarioDTO());
        usuarioService.retirarRol("76551691", 1L);
        assertTrue(usuarioActivo.getRoles().isEmpty());
    }

    @Test
    void rolInexistente_404() {
        when(usuarioRepository.findByDni("76551691")).thenReturn(Optional.of(usuarioActivo));
        when(rolRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> usuarioService.asignarRol("76551691", 99L));
    }

    @Test
    void catalogos_listarTodos_vacio() {
        when(catalogoRepository.findAllByOrderByTipoCatalogoAscOrdenAsc())
                .thenReturn(Collections.emptyList());
        assertTrue(catalogoService.listarTodos().isEmpty());
    }

    @Test
    void catalogos_listarTodos_conDatos() {
        CatalogoEntity entity = new CatalogoEntity();
        entity.setTipoCatalogo("CRITICIDAD");
        entity.setCodigo("ALTO");
        entity.setValor("Alta");
        entity.setEstado(true);
        entity.setOrden(1);
        when(catalogoRepository.findAllByOrderByTipoCatalogoAscOrdenAsc())
                .thenReturn(List.of(entity));
        CatalogoDTO dto = new CatalogoDTO();
        dto.setTipo("CRITICIDAD");
        dto.setCodigo("ALTO");
        dto.setNombre("Alta");
        when(catalogoMapper.toDTO(entity)).thenReturn(dto);

        List<CatalogoDTO> lista = catalogoService.listarTodos();
        assertEquals(1, lista.size());
        assertEquals("CRITICIDAD", lista.get(0).getTipo());
        assertEquals("ALTO", lista.get(0).getCodigo());
    }

    @Test
    void catalogos_listarYDuplicado() {
        when(catalogoRepository.findByTipoCatalogoOrderByOrdenAsc("CRITICIDAD"))
                .thenReturn(Collections.emptyList());
        assertTrue(catalogoService.listarPorTipo("CRITICIDAD").isEmpty());

        CatalogoDTO dto = new CatalogoDTO();
        dto.setCodigo("ALTO");
        dto.setNombre("Alta");
        when(catalogoRepository.existsByTipoCatalogoAndCodigo("CRITICIDAD", "ALTO")).thenReturn(true);
        assertThrows(ConflictException.class, () -> catalogoService.crear("CRITICIDAD", dto));
    }

    @Test
    void catalogo_desactivar() {
        CatalogoEntity entity = new CatalogoEntity();
        entity.setCodigo("ALTO");
        entity.setEstado(true);
        when(catalogoRepository.findByTipoCatalogoAndCodigo("CRITICIDAD", "ALTO"))
                .thenReturn(Optional.of(entity));
        when(catalogoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        catalogoService.eliminar("CRITICIDAD", "ALTO");
        assertFalse(entity.getEstado());
    }

    @Test
    void sistemas_listaVacia() {
        when(sistemaRepository.findAll()).thenReturn(Collections.emptyList());
        assertTrue(sistemaAdminService.listarSistemas(null, null, null, null, null, null, null, null).isEmpty());
    }

    @Test
    void sistemas_listaYDetalle() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(1L);
        s.setCodigoUnico("SYS-1");
        s.setNombre("Demo");
        s.setEstadoFlujo("PENDIENTE");
        when(sistemaRepository.findAll()).thenReturn(List.of(s));
        when(sistemaRepository.findById(1L)).thenReturn(Optional.of(s));
        when(evidenciaRepository.findByIdSistema(1L)).thenReturn(Collections.emptyList());

        assertEquals(1, sistemaAdminService.listarSistemas(null, null, null, null, null, null, null, null).size());
        assertEquals("SYS-1", sistemaAdminService.obtenerPorId(1L).getCodigo());
    }

    @Test
    void asignarResponsable_usuarioDesactivado_409() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(1L);
        s.setCodigoUnico("SYS-1");
        when(sistemaRepository.findById(1L)).thenReturn(Optional.of(s));

        UsuarioEntity inactivo = new UsuarioEntity();
        inactivo.setIdUsuario(5L);
        inactivo.setEstado(false);
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(inactivo));

        SistemaResponsablesRequestDTO req = new SistemaResponsablesRequestDTO();
        req.setIdResponsableTecnico(5L);
        assertThrows(ConflictException.class, () -> sistemaAdminService.asignarResponsables(1L, req));
    }

    @Test
    void asignarResponsable_ok() {
        SistemaEntity s = new SistemaEntity();
        s.setIdSistema(1L);
        s.setCodigoUnico("SYS-1");
        when(sistemaRepository.findById(1L)).thenReturn(Optional.of(s));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuarioActivo));
        when(sistemaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(evidenciaRepository.findByIdSistema(1L)).thenReturn(Collections.emptyList());

        SistemaResponsablesRequestDTO req = new SistemaResponsablesRequestDTO();
        req.setIdResponsableTecnico(10L);
        assertEquals("SYS-1", sistemaAdminService.asignarResponsables(1L, req).getCodigo());
        verify(auditoriaWriter).registrar(eq("responsable asignado"), anyString());
    }
}

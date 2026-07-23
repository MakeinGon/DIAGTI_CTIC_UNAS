package pe.edu.unas.ctic.diagti.administrador.controller;

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
import pe.edu.unas.ctic.diagti.administrador.dto.AuditoriaDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.CatalogoDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.RolDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaListDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.service.AuditoriaService;
import pe.edu.unas.ctic.diagti.administrador.service.CatalogoService;
import pe.edu.unas.ctic.diagti.administrador.service.EvidenciaService;
import pe.edu.unas.ctic.diagti.administrador.service.PermisoService;
import pe.edu.unas.ctic.diagti.administrador.service.RolService;
import pe.edu.unas.ctic.diagti.administrador.service.SistemaAdminService;
import pe.edu.unas.ctic.diagti.administrador.service.UsuarioService;
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.GlobalExceptionHandler;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdministradorControllersTest {

    private MockMvc usuariosMvc;
    private MockMvc rolesMvc;
    private MockMvc catalogosMvc;
    private MockMvc sistemasMvc;
    private MockMvc auditoriaMvc;

    @Mock UsuarioService usuarioService;
    @Mock RolService rolService;
    @Mock PermisoService permisoService;
    @Mock CatalogoService catalogoService;
    @Mock SistemaAdminService sistemaAdminService;
    @Mock AuditoriaService auditoriaService;
    @Mock EvidenciaService evidenciaService;

    @InjectMocks UsuarioController usuarioController;
    @InjectMocks RolPermisoController rolPermisoController;
    @InjectMocks CatalogoController catalogoController;
    @InjectMocks SistemaAdminController sistemaAdminController;
    @InjectMocks AuditoriaController auditoriaController;

    @BeforeEach
    void setUp() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        GlobalExceptionHandler advice = new GlobalExceptionHandler();
        usuariosMvc = MockMvcBuilders.standaloneSetup(usuarioController)
                .setControllerAdvice(advice).setMessageConverters(converter).build();
        rolesMvc = MockMvcBuilders.standaloneSetup(rolPermisoController)
                .setControllerAdvice(advice).setMessageConverters(converter).build();
        catalogosMvc = MockMvcBuilders.standaloneSetup(catalogoController)
                .setControllerAdvice(advice).setMessageConverters(converter).build();
        sistemasMvc = MockMvcBuilders.standaloneSetup(sistemaAdminController)
                .setControllerAdvice(advice).setMessageConverters(converter).build();
        auditoriaMvc = MockMvcBuilders.standaloneSetup(auditoriaController)
                .setControllerAdvice(advice).setMessageConverters(converter).build();
    }

    @Test
    void usuarios_listaVacia_sinCors() throws Exception {
        when(usuarioService.listar(isNull(), isNull(), isNull(), isNull())).thenReturn(List.of());
        usuariosMvc.perform(get("/api/admin/usuarios").accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void usuarios_listaConDatos_jsonEsperado() throws Exception {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsuarioId(1L);
        dto.setUsername("76551691");
        dto.setDni("76551691");
        dto.setNombreCompleto("Johan Vela");
        dto.setCorreo("johan.vela@unas.edu.pe");
        dto.setEstado("Activo");
        dto.setRol("admin");
        when(usuarioService.listar(isNull(), isNull(), isNull(), isNull())).thenReturn(List.of(dto));

        usuariosMvc.perform(get("/api/admin/usuarios").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("76551691"))
                .andExpect(jsonPath("$[0].correo").value("johan.vela@unas.edu.pe"))
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$[0].password_hash").doesNotExist());
    }

    @Test
    void usuario_detalle_404() throws Exception {
        when(usuarioService.obtenerPorDni("00000000"))
                .thenThrow(new ResourceNotFoundException("Usuario no encontrado"));
        usuariosMvc.perform(get("/api/admin/usuarios/00000000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Usuario no encontrado"));
    }

    @Test
    void usuario_crear_201() throws Exception {
        UsuarioDTO creado = new UsuarioDTO();
        creado.setDni("89999999");
        creado.setUsername("89999999");
        when(usuarioService.crear(any(UsuarioDTO.class), eq(1L))).thenReturn(creado);

        usuariosMvc.perform(post("/api/admin/usuarios?rolId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"dni":"89999999","nombreCompleto":"Nuevo Usuario",
                                 "correo":"nuevo@unas.edu.pe","origen":"Local","estado":"Activo"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dni").value("89999999"));
    }

    @Test
    void usuario_duplicado_409() throws Exception {
        when(usuarioService.crear(any(UsuarioDTO.class), eq(1L)))
                .thenThrow(new ConflictException("DNI ya registrado"));
        usuariosMvc.perform(post("/api/admin/usuarios?rolId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"dni":"76551691","nombreCompleto":"Johan Vela",
                                 "correo":"johan.vela@unas.edu.pe"}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void usuario_activarDesactivar() throws Exception {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setEstado("Inactivo");
        when(usuarioService.cambiarEstado(eq("76551691"), anyBoolean())).thenReturn(dto);
        when(usuarioService.desactivar("76551691")).thenReturn(dto);

        usuariosMvc.perform(patch("/api/admin/usuarios/76551691/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\":false}"))
                .andExpect(status().isOk());

        usuariosMvc.perform(delete("/api/admin/usuarios/76551691"))
                .andExpect(status().isOk());
    }

    @Test
    void roles_listar() throws Exception {
        RolDTO rol = new RolDTO();
        rol.setId(1L);
        rol.setNombre("admin");
        when(rolService.listar()).thenReturn(List.of(rol));
        rolesMvc.perform(get("/api/admin/roles").accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("admin"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void catalogos_listarTodos_200_vacio() throws Exception {
        when(catalogoService.listarTodos()).thenReturn(Collections.emptyList());
        catalogosMvc.perform(get("/api/admin/catalogos").accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void catalogos_listarTodos_conDatos_jsonEsperado() throws Exception {
        CatalogoDTO item = new CatalogoDTO();
        item.setTipo("AREA_USUARIO");
        item.setCodigo("ADMIN");
        item.setNombre("Administración");
        item.setEstado("Activo");
        item.setOrden(1);
        when(catalogoService.listarTodos()).thenReturn(List.of(item));

        catalogosMvc.perform(get("/api/admin/catalogos").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipo").value("AREA_USUARIO"))
                .andExpect(jsonPath("$[0].codigo").value("ADMIN"))
                .andExpect(jsonPath("$[0].nombre").value("Administración"))
                .andExpect(jsonPath("$[0].estado").value("Activo"))
                .andExpect(jsonPath("$[0].idCatalogo").doesNotExist());
    }

    @Test
    void catalogos_filtroTipo() throws Exception {
        CatalogoDTO item = new CatalogoDTO();
        item.setTipo("CRITICIDAD");
        item.setCodigo("ALTO");
        item.setNombre("Alta");
        item.setEstado("Activo");
        when(catalogoService.listarPorTipo("CRITICIDAD")).thenReturn(List.of(item));
        catalogosMvc.perform(get("/api/admin/catalogos/CRITICIDAD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("ALTO"));
    }

    @Test
    void catalogos_tipoSinResultados_200_vacio() throws Exception {
        when(catalogoService.listarPorTipo("SIN_DATOS")).thenReturn(Collections.emptyList());
        catalogosMvc.perform(get("/api/admin/catalogos/SIN_DATOS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void catalogos_duplicado_409() throws Exception {
        when(catalogoService.crear(eq("CRITICIDAD"), any(CatalogoDTO.class)))
                .thenThrow(new ConflictException("Ya existe un ítem con el código 'ALTO' en este catálogo."));
        catalogosMvc.perform(post("/api/admin/catalogos/CRITICIDAD")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"ALTO\",\"nombre\":\"Alta\",\"estado\":\"Activo\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void sistemas_vacio_y_detalle() throws Exception {
        when(sistemaAdminService.listarSistemas(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        sistemasMvc.perform(get("/api/admin/sistemas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        when(sistemaAdminService.obtenerPorId(999L))
                .thenThrow(new ResourceNotFoundException("Sistema no encontrado"));
        sistemasMvc.perform(get("/api/admin/sistemas/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void sistemas_conDatos_y_responsables() throws Exception {
        SistemaListDTO list = new SistemaListDTO();
        list.setId(1L);
        list.setCodigo("SYS-1");
        when(sistemaAdminService.listarSistemas(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(list));
        sistemasMvc.perform(get("/api/admin/sistemas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("SYS-1"));

        SistemaDetalleDTO detalle = new SistemaDetalleDTO();
        detalle.setId(1L);
        detalle.setCodigo("SYS-1");
        when(sistemaAdminService.asignarResponsables(eq(1L), any())).thenReturn(detalle);
        sistemasMvc.perform(put("/api/admin/sistemas/1/responsables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idResponsableTecnico\":10}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigo").value("SYS-1"));
    }

    @Test
    void auditoria_vacia() throws Exception {
        when(auditoriaService.listarAuditoria(any(), any(), any(), any())).thenReturn(List.of());
        auditoriaMvc.perform(get("/api/admin/auditoria").accept(MediaType.APPLICATION_JSON)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void auditoria_detalle() throws Exception {
        AuditoriaDTO dto = new AuditoriaDTO();
        dto.setId(5L);
        dto.setAccion("usuario creado");
        dto.setModulo("Administrador");
        when(auditoriaService.obtenerPorId(5L)).thenReturn(dto);
        auditoriaMvc.perform(get("/api/admin/auditoria/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accion").value("usuario creado"));
    }

    @Test
    void baseVacia_sin500() throws Exception {
        when(usuarioService.listar(any(), any(), any(), any())).thenReturn(List.of());
        when(rolService.listar()).thenReturn(List.of());
        when(catalogoService.listarTodos()).thenReturn(List.of());
        when(catalogoService.listarPorTipo(anyString())).thenReturn(List.of());
        when(sistemaAdminService.listarSistemas(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());
        when(auditoriaService.listarAuditoria(any(), any(), any(), any())).thenReturn(List.of());

        usuariosMvc.perform(get("/api/admin/usuarios")).andExpect(status().isOk());
        rolesMvc.perform(get("/api/admin/roles")).andExpect(status().isOk());
        catalogosMvc.perform(get("/api/admin/catalogos")).andExpect(status().isOk());
        catalogosMvc.perform(get("/api/admin/catalogos/CRITICIDAD")).andExpect(status().isOk());
        sistemasMvc.perform(get("/api/admin/sistemas")).andExpect(status().isOk());
        auditoriaMvc.perform(get("/api/admin/auditoria")).andExpect(status().isOk());
    }
}

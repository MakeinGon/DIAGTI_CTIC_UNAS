package pe.edu.unas.ctic.diagti.desarrollador.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unas.ctic.diagti.Login.model.Rol;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.RegistrarSistemaOficialResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaOficialInsertRepository;
import pe.edu.unas.ctic.diagti.desarrollador.service.impl.DesarrolladorInventarioServiceImpl;
import pe.edu.unas.ctic.diagti.desarrollador.support.DesarrolladorUsuarioResolver;
import pe.edu.unas.ctic.diagti.director.entity.ArquitecturaEntity;
import pe.edu.unas.ctic.diagti.director.entity.BaseDatosSistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.EvidenciaEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.repository.BaseDatosSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorArquitecturaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorIntegracionRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DesarrolladorInventarioRegistroServiceTest {

    @Mock private DesarrolladorUsuarioResolver usuarioResolver;
    @Mock private DirectorSistemaRepository sistemaRepository;
    @Mock private ObservacionRepository observacionRepository;
    @Mock private ValidacionRepository validacionRepository;
    @Mock private CatalogoRepository catalogoRepository;
    @Mock private LoginUsuarioRepository loginUsuarioRepository;
    @Mock private AuditoriaRepository auditoriaRepository;
    @Mock private SistemaOficialInsertRepository sistemaOficialInsertRepository;
    @Mock private DirectorArquitecturaRepository arquitecturaRepository;
    @Mock private BaseDatosSistemaRepository baseDatosSistemaRepository;
    @Mock private DirectorIntegracionRepository integracionRepository;
    @Mock private DirectorEvidenciaRepository evidenciaRepository;

    @InjectMocks
    private DesarrolladorInventarioServiceImpl service;

    @Test
    void registrarAsignaTecnicoYFuncionalNull() {
        Usuario dev = usuarioDev();
        stubCatalogos();
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(dev);
        when(sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull("SYS-TMP-100"))
                .thenReturn(Optional.empty());
        when(sistemaOficialInsertRepository.insertar(any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(100L);

        SistemaEntity saved = baseSaved(100L, "SYS-TMP-100", "BORRADOR", dev.getIdUsuario());
        when(sistemaRepository.findActivoById(100L)).thenReturn(Optional.of(saved));
        when(validacionRepository.findByIdSistema(100L)).thenReturn(List.of());
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        stubFichaLecturaVacia(100L);

        RegistrarSistemaOficialResponseDTO resp = service.registrarSistemaOficial("71234567", request("SYS-TMP-100"));

        assertTrue(resp.isSuccess());
        assertEquals("SYS-TMP-100", resp.getSistema().getCodigo());
        assertNull(saved.getIdResponsableFuncional());
        verify(arquitecturaRepository, never()).save(any());
        verify(baseDatosSistemaRepository, never()).save(any());
    }

    @Test
    void registrarConArquitecturaYBaseDatos() {
        Usuario dev = usuarioDev();
        stubCatalogos();
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(dev);
        when(sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull("SYS-TMP-FULL"))
                .thenReturn(Optional.empty());
        when(sistemaOficialInsertRepository.insertar(any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(200L);
        SistemaEntity saved = baseSaved(200L, "SYS-TMP-FULL", "BORRADOR", dev.getIdUsuario());
        when(sistemaRepository.findActivoById(200L)).thenReturn(Optional.of(saved));
        when(validacionRepository.findByIdSistema(200L)).thenReturn(List.of());
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(arquitecturaRepository.findByIdSistema(200L)).thenReturn(List.of());
        when(baseDatosSistemaRepository.findByIdSistema(200L)).thenReturn(Optional.empty());
        when(arquitecturaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(baseDatosSistemaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(integracionRepository.findByIdSistemaOrigen(200L)).thenReturn(List.of());
        when(evidenciaRepository.findByIdSistema(200L)).thenReturn(List.of());

        RegistrarSistemaOficialRequestDTO req = request("SYS-TMP-FULL");
        RegistrarSistemaOficialRequestDTO.ArquitecturaSeccionDTO arq =
                new RegistrarSistemaOficialRequestDTO.ArquitecturaSeccionDTO();
        arq.setLenguaje("Java");
        arq.setVersionLenguaje("17");
        arq.setFramework("Spring Boot");
        arq.setVersionFramework("3.3.4");
        arq.setTipoArquitectura("Arquitectura limpia");
        arq.setPatron("Repository");
        arq.setTecnologiasComplementarias("HTML, CSS, JavaScript y Nginx");
        req.setArquitectura(arq);

        RegistrarSistemaOficialRequestDTO.BaseDatosSeccionDTO bd =
                new RegistrarSistemaOficialRequestDTO.BaseDatosSeccionDTO();
        bd.setMotor("PostgreSQL");
        bd.setVersion("17");
        bd.setTipo("Relacional");
        bd.setServidor("diagti_postgres");
        bd.setEsquema("public");
        bd.setTieneBackup(true);
        bd.setFrecuenciaBackup("Diario");
        bd.setCifrado(false);
        bd.setResponsable("CTIC UNAS");
        req.setBaseDatos(bd);

        service.registrarSistemaOficial("71234567", req);

        ArgumentCaptor<ArquitecturaEntity> arqCap = ArgumentCaptor.forClass(ArquitecturaEntity.class);
        verify(arquitecturaRepository).save(arqCap.capture());
        assertEquals("Java", arqCap.getValue().getLenguajeProgramacion());
        assertEquals("Arquitectura limpia", arqCap.getValue().getTipoArquitectura());
        assertEquals(200L, arqCap.getValue().getIdSistema());

        ArgumentCaptor<BaseDatosSistemaEntity> bdCap = ArgumentCaptor.forClass(BaseDatosSistemaEntity.class);
        verify(baseDatosSistemaRepository).save(bdCap.capture());
        assertEquals("PostgreSQL", bdCap.getValue().getMotor());
        assertEquals("diagti_postgres", bdCap.getValue().getServidor());
        assertEquals(Boolean.TRUE, bdCap.getValue().getBackupActivo());
    }

    @Test
    void registrarUrlEvidencia() {
        Usuario dev = usuarioDev();
        stubCatalogos();
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(dev);
        when(sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull("SYS-TMP-EV"))
                .thenReturn(Optional.empty());
        when(sistemaOficialInsertRepository.insertar(any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(201L);
        when(sistemaRepository.findActivoById(201L))
                .thenReturn(Optional.of(baseSaved(201L, "SYS-TMP-EV", "BORRADOR", dev.getIdUsuario())));
        when(validacionRepository.findByIdSistema(201L)).thenReturn(List.of());
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        stubFichaLecturaVacia(201L);
        when(evidenciaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RegistrarSistemaOficialRequestDTO req = request("SYS-TMP-EV");
        RegistrarSistemaOficialRequestDTO.EvidenciasSeccionDTO ev =
                new RegistrarSistemaOficialRequestDTO.EvidenciasSeccionDTO();
        RegistrarSistemaOficialRequestDTO.EvidenciaUrlDTO url =
                new RegistrarSistemaOficialRequestDTO.EvidenciaUrlDTO();
        url.setUrl("https://example.com/doc.pdf");
        url.setDescripcion("Manual");
        url.setTipo("URL");
        ev.setUrls(List.of(url));
        req.setEvidencias(ev);

        service.registrarSistemaOficial("71234567", req);

        ArgumentCaptor<EvidenciaEntity> cap = ArgumentCaptor.forClass(EvidenciaEntity.class);
        verify(evidenciaRepository).save(cap.capture());
        assertEquals("https://example.com/doc.pdf", cap.getValue().getUrlEvidencia());
        assertEquals(201L, cap.getValue().getIdSistema());
    }

    @Test
    void registrarNoDuplicaArquitectura() {
        Usuario dev = usuarioDev();
        stubCatalogos();
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(dev);
        when(sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull("SYS-TMP-ARQ"))
                .thenReturn(Optional.empty());
        when(sistemaOficialInsertRepository.insertar(any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(202L);
        when(sistemaRepository.findActivoById(202L))
                .thenReturn(Optional.of(baseSaved(202L, "SYS-TMP-ARQ", "BORRADOR", dev.getIdUsuario())));
        when(validacionRepository.findByIdSistema(202L)).thenReturn(List.of());
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ArquitecturaEntity existente = new ArquitecturaEntity();
        existente.setIdArquitectura(9L);
        existente.setIdSistema(202L);
        existente.setTipoArquitectura("MVC");
        when(arquitecturaRepository.findByIdSistema(202L)).thenReturn(List.of(existente));
        when(arquitecturaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(baseDatosSistemaRepository.findByIdSistema(202L)).thenReturn(Optional.empty());
        when(integracionRepository.findByIdSistemaOrigen(202L)).thenReturn(List.of());
        when(evidenciaRepository.findByIdSistema(202L)).thenReturn(List.of());

        RegistrarSistemaOficialRequestDTO req = request("SYS-TMP-ARQ");
        RegistrarSistemaOficialRequestDTO.ArquitecturaSeccionDTO arq =
                new RegistrarSistemaOficialRequestDTO.ArquitecturaSeccionDTO();
        arq.setTipoArquitectura("Hexagonal");
        arq.setLenguaje("Java");
        req.setArquitectura(arq);

        service.registrarSistemaOficial("71234567", req);

        ArgumentCaptor<ArquitecturaEntity> cap = ArgumentCaptor.forClass(ArquitecturaEntity.class);
        verify(arquitecturaRepository).save(cap.capture());
        assertEquals(9L, cap.getValue().getIdArquitectura());
        assertEquals("Hexagonal", cap.getValue().getTipoArquitectura());
    }

    @Test
    void registrarCodigoDuplicadoLanzaConflict() {
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(usuarioDev());
        when(sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull("SYS-001"))
                .thenReturn(Optional.of(new SistemaEntity()));

        assertThrows(ConflictException.class,
                () -> service.registrarSistemaOficial("71234567", request("SYS-001")));
        verify(sistemaOficialInsertRepository, never()).insertar(
                any(), any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void registrarEnviadoCreaValidacionPendiente() {
        Usuario dev = usuarioDev();
        stubCatalogos();
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(dev);
        when(sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull("SYS-TMP-ENV"))
                .thenReturn(Optional.empty());
        when(sistemaOficialInsertRepository.insertar(any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(101L);
        when(sistemaRepository.findActivoById(101L))
                .thenReturn(Optional.of(baseSaved(101L, "SYS-TMP-ENV", "ENVIADO", dev.getIdUsuario())));
        when(validacionRepository.findByIdSistema(101L)).thenReturn(List.of());
        when(validacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        stubFichaLecturaVacia(101L);

        RegistrarSistemaOficialRequestDTO req = request("SYS-TMP-ENV");
        req.setEstadoFlujo("ENVIADO");
        service.registrarSistemaOficial("71234567", req);

        ArgumentCaptor<ValidacionEntity> valCap = ArgumentCaptor.forClass(ValidacionEntity.class);
        verify(validacionRepository).save(valCap.capture());
        assertEquals("PENDIENTE", valCap.getValue().getEstadoValidacion());
    }

    @Test
    void registrarNoDuplicaValidacionInicial() {
        Usuario dev = usuarioDev();
        stubCatalogos();
        when(usuarioResolver.requireActiveDeveloper("71234567")).thenReturn(dev);
        when(sistemaRepository.findByCodigoUnicoAndFechaEliminacionIsNull("SYS-TMP-DUP"))
                .thenReturn(Optional.empty());
        when(sistemaOficialInsertRepository.insertar(any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(102L);
        when(sistemaRepository.findActivoById(102L))
                .thenReturn(Optional.of(baseSaved(102L, "SYS-TMP-DUP", "BORRADOR", dev.getIdUsuario())));

        ValidacionEntity existente = new ValidacionEntity();
        existente.setIdValidacion(9L);
        existente.setIdSistema(102L);
        existente.setEstadoValidacion("BORRADOR");
        when(validacionRepository.findByIdSistema(102L)).thenReturn(List.of(existente));
        stubFichaLecturaVacia(102L);

        service.registrarSistemaOficial("71234567", request("SYS-TMP-DUP"));
        verify(validacionRepository, never()).save(any());
    }

    private void stubCatalogos() {
        when(catalogoRepository.findByTipoCatalogoAndCodigo("AREA_USUARIO", "ACAD"))
                .thenReturn(Optional.of(cat(1L, "ACAD", "Académica")));
        when(catalogoRepository.findByTipoCatalogoAndCodigo("TIPO_APLICATIVO", "WEB"))
                .thenReturn(Optional.of(cat(2L, "WEB", "Aplicativo Web")));
        when(catalogoRepository.findByTipoCatalogoAndCodigo("CRITICIDAD", "MEDIO"))
                .thenReturn(Optional.of(cat(3L, "MEDIO", "Media")));
    }

    private void stubFichaLecturaVacia(Long id) {
        when(arquitecturaRepository.findByIdSistema(id)).thenReturn(List.of());
        when(baseDatosSistemaRepository.findByIdSistema(id)).thenReturn(Optional.empty());
        when(integracionRepository.findByIdSistemaOrigen(id)).thenReturn(List.of());
        when(evidenciaRepository.findByIdSistema(id)).thenReturn(List.of());
    }

    private SistemaEntity baseSaved(Long id, String codigo, String estado, Long idTec) {
        SistemaEntity saved = new SistemaEntity();
        saved.setIdSistema(id);
        saved.setCodigoUnico(codigo);
        saved.setNombre("Temporal");
        saved.setDescripcion("Desc");
        saved.setIdResponsableTecnico(idTec);
        saved.setIdResponsableFuncional(null);
        saved.setEstadoFlujo(estado);
        return saved;
    }

    private RegistrarSistemaOficialRequestDTO request(String codigo) {
        RegistrarSistemaOficialRequestDTO req = new RegistrarSistemaOficialRequestDTO();
        req.setCodigoUnico(codigo);
        req.setNombre("Temporal");
        req.setDescripcion("Descripción");
        req.setAreaCodigo("ACAD");
        req.setTipoCodigo("WEB");
        req.setCriticidadCodigo("MEDIO");
        req.setFormaAdquisicion("Desarrollo CTIC");
        req.setAnoAdquisicion(2026);
        req.setEstadoFlujo("BORRADOR");
        req.setNivelRiesgo("MEDIO");
        req.setPrioridadMigracion("CORTO PLAZO");
        return req;
    }

    private Usuario usuarioDev() {
        Usuario u = new Usuario();
        u.setIdUsuario(3L);
        u.setUsername("71234567");
        u.setNombres("Juan");
        u.setApellidos("Perez");
        Rol rol = new Rol();
        rol.setNombre("desarrollo");
        u.setRoles(Set.of(rol));
        return u;
    }

    private CatalogoEntity cat(Long id, String codigo, String valor) {
        CatalogoEntity c = new CatalogoEntity();
        c.setIdCatalogo(id);
        c.setCodigo(codigo);
        c.setValor(valor);
        c.setEstado(true);
        return c;
    }
}

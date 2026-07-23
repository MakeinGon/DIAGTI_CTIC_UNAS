package pe.edu.unas.ctic.diagti.desarrollador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.controller.EditarSistemaController;
import pe.edu.unas.ctic.diagti.desarrollador.dto.*;
import pe.edu.unas.ctic.diagti.desarrollador.entity.*;
import pe.edu.unas.ctic.diagti.desarrollador.mapper.*;
import pe.edu.unas.ctic.diagti.desarrollador.repository.*;
import pe.edu.unas.ctic.diagti.desarrollador.util.RiesgoCalculator;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Recupera y modifica un sistema existente, sus secciones técnicas, evidencias
 * e integraciones; también cambia su estado al enviarlo a validación.
 */
@Service
@RequiredArgsConstructor
public class EditarSistemaService {
    
    private final SistemaDesarrolloRepository sistemaRepository;
    private final ArquitecturaRepository arquitecturaRepository;
    private final InfraestructuraRepository infraestructuraRepository;
    private final SeguridadRepository seguridadRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final IntegracionRepository integracionRepository;
    private final DesarrolladorValidacionRepository validacionRepository;  // ← CAMBIADO
    
    private final SistemaDetalleMapper detalleMapper;
    
    private final RiesgoCalculator riesgoCalculator;
    
    @Value("${app.uploads.path:uploads/evidencias}")
    private String uploadPath;
    
    @Transactional(readOnly = true)
    public SistemaCompletoDTO obtenerDatosEdicion(Long id) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        if (!pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.esPropietario(sistema, usuarioActual)
                && !esAdministrador(usuarioActual)) {
            throw new RuntimeException("No tiene acceso a este sistema");
        }
        
        SistemaCompletoDTO dto = new SistemaCompletoDTO();
        
        dto.setId(sistema.getId());
        dto.setCodigo(sistema.getCodigo());
        dto.setNombre(sistema.getNombre());
        dto.setDescripcion(sistema.getDescripcion());
        dto.setTipoAplicativo(sistema.getTipoAplicativo());
        dto.setAreaUsuaria(sistema.getAreaUsuaria());
        dto.setResponsableFuncional(sistema.getResponsableFuncional());
        dto.setResponsableTecnico(sistema.getResponsableTecnico());
        dto.setEstado(sistema.getEstado());
        dto.setCriticidad(sistema.getCriticidad());
        dto.setAnioDesarrollo(sistema.getAnioDesarrollo());
        dto.setFormaAdquisicion(sistema.getFormaAdquisicion());
        dto.setEmpresaDesarrolladora(sistema.getEmpresaDesarrolladora());
        dto.setContratoVigente(sistema.getContratoVigente());
        dto.setFechaVencimientoSoporte(sistema.getFechaVencimientoSoporte());
        dto.setObservaciones(sistema.getObservaciones());
        dto.setNivelRiesgo(sistema.getNivelRiesgo());
        dto.setPuntajeRiesgo(sistema.getPuntajeRiesgo());
        dto.setEsLegacy(sistema.getEsLegacy());
        dto.setFechaCreacion(sistema.getFechaCreacion());
        dto.setFechaActualizacion(sistema.getFechaActualizacion());
        dto.setUsuarioCreador(sistema.getUsuarioCreador());
        dto.setUsuarioModificador(sistema.getUsuarioModificador());
        
        if (sistema.getArquitectura() != null) {
            dto.setArquitectura(detalleMapper.arquitecturaToDto(sistema.getArquitectura()));
        }
        
        if (sistema.getInfraestructura() != null) {
            dto.setInfraestructura(detalleMapper.infraestructuraToDto(sistema.getInfraestructura()));
        }
        
        if (sistema.getSeguridad() != null) {
            dto.setSeguridad(detalleMapper.seguridadToDto(sistema.getSeguridad()));
        }
        
        if (sistema.getIntegraciones() != null) {
            dto.setIntegraciones(sistema.getIntegraciones().stream()
                    .filter(i -> !Boolean.TRUE.equals(i.getEliminado()))
                    .map(detalleMapper::integracionToDto)
                    .collect(Collectors.toList()));
        }
        
        if (sistema.getEvidencias() != null) {
            dto.setEvidencias(sistema.getEvidencias().stream()
                    .filter(e -> !Boolean.TRUE.equals(e.getEliminado()))
                    .map(detalleMapper::evidenciaToDto)
                    .collect(Collectors.toList()));
        }
        
        if (sistema.getEvidencias() != null) {
            List<SistemaCompletoDTO.UrlDTO> urls = sistema.getEvidencias().stream()
                    .filter(e -> !Boolean.TRUE.equals(e.getEliminado()) && e.getArchivoUrl() != null && e.getArchivoUrl().startsWith("http"))
                    .map(e -> {
                        SistemaCompletoDTO.UrlDTO urlDto = new SistemaCompletoDTO.UrlDTO();
                        urlDto.setId(e.getId());
                        urlDto.setUrl(e.getArchivoUrl());
                        urlDto.setDescripcion(e.getDescripcion());
                        urlDto.setFechaCreacion(e.getFechaCarga());
                        return urlDto;
                    })
                    .collect(Collectors.toList());
            dto.setUrls(urls);
        }
        
        return dto;
    }
    
    @Transactional
    public OperacionSistemaDTO.EdicionResponse editarSistema(Long id, EditarSistemaRequestDTO request) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        if (!pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.esPropietario(sistema, usuarioActual)
                && !esAdministrador(usuarioActual)) {
            throw new RuntimeException("No tiene permisos para editar este sistema");
        }
        
        if ("ENVIADO".equals(sistema.getEstado()) || "VALIDADO".equals(sistema.getEstado())) {
            throw new RuntimeException("No se puede editar un sistema en validación o ya validado");
        }
        
        // Actualizar datos básicos
        if (request.getCodigo() != null && !request.getCodigo().isEmpty()) {
            sistemaRepository.findByCodigo(request.getCodigo())
                    .ifPresent(s -> {
                        if (!s.getId().equals(id)) {
                            throw new RuntimeException("El código ya existe en otro sistema");
                        }
                    });
            sistema.setCodigo(request.getCodigo());
        }
        if (request.getNombre() != null) sistema.setNombre(request.getNombre());
        if (request.getDescripcion() != null) sistema.setDescripcion(request.getDescripcion());
        if (request.getTipoAplicativo() != null) sistema.setTipoAplicativo(request.getTipoAplicativo());
        if (request.getAreaUsuaria() != null) sistema.setAreaUsuaria(request.getAreaUsuaria());
        if (request.getResponsableFuncional() != null) sistema.setResponsableFuncional(request.getResponsableFuncional());
        if (request.getResponsableTecnico() != null) sistema.setResponsableTecnico(request.getResponsableTecnico());
        if (request.getEstado() != null) sistema.setEstado(request.getEstado());
        if (request.getCriticidad() != null) sistema.setCriticidad(request.getCriticidad());
        if (request.getAnioDesarrollo() != null) sistema.setAnioDesarrollo(request.getAnioDesarrollo());
        if (request.getFormaAdquisicion() != null) sistema.setFormaAdquisicion(request.getFormaAdquisicion());
        if (request.getEmpresaDesarrolladora() != null) sistema.setEmpresaDesarrolladora(request.getEmpresaDesarrolladora());
        if (request.getContratoVigente() != null) sistema.setContratoVigente(request.getContratoVigente());
        if (request.getFechaVencimientoSoporte() != null) sistema.setFechaVencimientoSoporte(request.getFechaVencimientoSoporte());
        if (request.getObservaciones() != null) sistema.setObservaciones(request.getObservaciones());
        if (request.getEsLegacy() != null) sistema.setEsLegacy(request.getEsLegacy());
        
        sistema.setUsuarioModificador(usuarioActual);
        sistema.setFechaActualizacion(LocalDateTime.now());
        
        // ============================================================
        // ACTUALIZAR ARQUITECTURA
        // ============================================================
        if (request.getArquitectura() != null) {
            ArquitecturaEntity arquitectura = sistema.getArquitectura();
            if (arquitectura == null) {
                arquitectura = new ArquitecturaEntity();
                arquitectura.setSistema(sistema);
            }
            arquitectura.setLenguajeProgramacion(request.getArquitectura().getLenguajeProgramacion());
            arquitectura.setVersionLenguaje(request.getArquitectura().getVersionLenguaje());
            arquitectura.setFramework(request.getArquitectura().getFramework());
            arquitectura.setVersionFramework(request.getArquitectura().getVersionFramework());
            arquitectura.setArquitectura(request.getArquitectura().getArquitectura());
            arquitectura.setPatronDiseno(request.getArquitectura().getPatronDiseno());
            arquitectura.setRepositorio(request.getArquitectura().getRepositorio());
            arquitectura.setTecnologiasComplementarias(request.getArquitectura().getTecnologiasComplementarias());
            arquitectura.setMotorBaseDatos(request.getArquitectura().getMotorBaseDatos());
            arquitectura.setVersionBaseDatos(request.getArquitectura().getVersionBaseDatos());
            arquitectura.setTipoBaseDatos(request.getArquitectura().getTipoBaseDatos());
            arquitectura.setServidorBaseDatos(request.getArquitectura().getServidorBaseDatos());
            arquitectura.setEsquemaBaseDatos(request.getArquitectura().getEsquemaBaseDatos());
            arquitectura.setBackupActivo(request.getArquitectura().getBackupActivo());
            arquitectura.setFrecuenciaBackup(request.getArquitectura().getFrecuenciaBackup());
            arquitectura.setCifradoBaseDatos(request.getArquitectura().getCifradoBaseDatos());
            arquitectura.setResponsableBaseDatos(request.getArquitectura().getResponsableBaseDatos());
            arquitectura.setObservaciones(request.getArquitectura().getObservaciones());
            sistema.setArquitectura(arquitectura);
        }
        
        // ============================================================
        // ACTUALIZAR INFRAESTRUCTURA
        // ============================================================
        if (request.getInfraestructura() != null) {
            InfraestructuraEntity infraestructura = sistema.getInfraestructura();
            if (infraestructura == null) {
                infraestructura = new InfraestructuraEntity();
                infraestructura.setSistema(sistema);
            }
            infraestructura.setPlataforma(request.getInfraestructura().getPlataforma());
            infraestructura.setTipoServidor(request.getInfraestructura().getTipoServidor());
            infraestructura.setSistemaOperativo(request.getInfraestructura().getSistemaOperativo());
            infraestructura.setVersionSO(request.getInfraestructura().getVersionSO());
            infraestructura.setIp(request.getInfraestructura().getIp());
            infraestructura.setPuerto(request.getInfraestructura().getPuerto());
            infraestructura.setDominio(request.getInfraestructura().getDominio());
            infraestructura.setSubdominio(request.getInfraestructura().getSubdominio());
            infraestructura.setAmbiente(request.getInfraestructura().getAmbiente());
            infraestructura.setUsoDocker(request.getInfraestructura().getUsoDocker());
            infraestructura.setDockerCompose(request.getInfraestructura().getDockerCompose());
            infraestructura.setProxmox(request.getInfraestructura().getProxmox());
            infraestructura.setProxyReverso(request.getInfraestructura().getProxyReverso());
            infraestructura.setServidorWeb(request.getInfraestructura().getServidorWeb());
            infraestructura.setCiCd(request.getInfraestructura().getCiCd());
            infraestructura.setMecanismoPublicacion(request.getInfraestructura().getMecanismoPublicacion());
            infraestructura.setExposicion(request.getInfraestructura().getExposicion());
            infraestructura.setIpPublica(request.getInfraestructura().getIpPublica());
            infraestructura.setIpPrivada(request.getInfraestructura().getIpPrivada());
            infraestructura.setSubdominioInstitucional(request.getInfraestructura().getSubdominioInstitucional());
            infraestructura.setObservaciones(request.getInfraestructura().getObservaciones());
            sistema.setInfraestructura(infraestructura);
        }
        
        // ============================================================
        // ACTUALIZAR SEGURIDAD
        // ============================================================
        if (request.getSeguridad() != null) {
            SeguridadEntity seguridad = sistema.getSeguridad();
            if (seguridad == null) {
                seguridad = new SeguridadEntity();
                seguridad.setSistema(sistema);
            }
            seguridad.setSslTls(request.getSeguridad().getSslTls());
            seguridad.setAutenticacionActiva(request.getSeguridad().getAutenticacionActiva());
            seguridad.setMfa(request.getSeguridad().getMfa());
            seguridad.setLogsActivos(request.getSeguridad().getLogsActivos());
            seguridad.setAuditoriaActiva(request.getSeguridad().getAuditoriaActiva());
            seguridad.setOwaspCumple(request.getSeguridad().getOwaspCumple());
            seguridad.setCifradoActivo(request.getSeguridad().getCifradoActivo());
            seguridad.setControlAcceso(request.getSeguridad().getControlAcceso());
            seguridad.setRestriccionIP(request.getSeguridad().getRestriccionIP());
            seguridad.setControlSesiones(request.getSeguridad().getControlSesiones());
            seguridad.setBackupSeguro(request.getSeguridad().getBackupSeguro());
            seguridad.setObservaciones(request.getSeguridad().getObservaciones());
            sistema.setSeguridad(seguridad);
        }
        
        // Eliminar integraciones marcadas
        if (request.getIntegracionesEliminar() != null) {
            request.getIntegracionesEliminar().forEach(idIntegracion -> {
                integracionRepository.findById(idIntegracion).ifPresent(integracion -> {
                    integracion.setEliminado(true);
                    integracionRepository.save(integracion);
                });
            });
        }
        
        // Eliminar evidencias marcadas
        if (request.getEvidenciasEliminar() != null) {
            request.getEvidenciasEliminar().forEach(idEvidencia -> {
                evidenciaRepository.findById(idEvidencia).ifPresent(evidencia -> {
                    evidencia.setEliminado(true);
                    evidencia.setFechaEliminacion(LocalDateTime.now());
                    evidenciaRepository.save(evidencia);
                    
                    if (evidencia.getArchivoUrl() != null && !evidencia.getArchivoUrl().startsWith("http")) {
                        try {
                            Path filePath = Paths.get(uploadPath, evidencia.getArchivoUrl());
                            Files.deleteIfExists(filePath);
                        } catch (IOException e) {
                            // Log error
                        }
                    }
                });
            });
        }
        
        // Recalcular riesgo
        riesgoCalculator.calcularRiesgo(sistema);
        sistemaRepository.save(sistema);
        
        OperacionSistemaDTO.EdicionResponse response = new OperacionSistemaDTO.EdicionResponse();
        response.setId(sistema.getId());
        response.setCodigo(sistema.getCodigo());
        response.setNombre(sistema.getNombre());
        response.setEstado(sistema.getEstado());
        response.setNivelRiesgo(sistema.getNivelRiesgo());
        response.setPuntajeRiesgo(sistema.getPuntajeRiesgo());
        response.setFechaActualizacion(sistema.getFechaActualizacion());
        response.setExito(true);
        response.setMensaje("Sistema actualizado exitosamente");
        
        return response;
    }
    
    @Transactional
    public OperacionSistemaDTO.EdicionResponse subirEvidencia(Long id, String tipo, MultipartFile archivo) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        if (!pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.esPropietario(sistema, usuarioActual)
                && !esAdministrador(usuarioActual)) {
            throw new RuntimeException("No tiene permisos para subir evidencias");
        }
        
        if (archivo.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }
        
        String contentType = archivo.getContentType();
        if (!esTipoPermitido(contentType)) {
            throw new RuntimeException("Tipo de archivo no permitido");
        }
        
        if (archivo.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("El archivo excede el tamaño máximo permitido (10MB)");
        }
        
        try {
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            String extension = "";
            String originalName = archivo.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadDir.resolve(fileName);
            Files.write(filePath, archivo.getBytes());
            
            EvidenciaEntity evidencia = new EvidenciaEntity();
            evidencia.setSistema(sistema);
            evidencia.setTipoEvidencia(tipo);
            evidencia.setArchivoUrl(fileName);
            evidencia.setNombreArchivo(archivo.getOriginalFilename());
            evidencia.setDescripcion("Archivo subido: " + archivo.getOriginalFilename());
            evidencia.setUsuarioRegistra(usuarioActual);
            evidencia.setFechaCarga(LocalDateTime.now());
            evidencia.setEstado("ACTIVO");
            evidencia.setEliminado(false);
            evidencia.setEsObligatoria(esEvidenciaObligatoria(tipo));
            
            evidenciaRepository.save(evidencia);
            
            OperacionSistemaDTO.EdicionResponse response = new OperacionSistemaDTO.EdicionResponse();
            response.setId(sistema.getId());
            response.setExito(true);
            response.setMensaje("Evidencia subida correctamente: " + archivo.getOriginalFilename());
            return response;
            
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage());
        }
    }
    
    @Transactional
    public void eliminarEvidencia(Long sistemaId, Long evidenciaId) {
        EvidenciaEntity evidencia = evidenciaRepository.findById(evidenciaId)
                .orElseThrow(() -> new RuntimeException("Evidencia no encontrada"));
        
        if (!evidencia.getSistema().getId().equals(sistemaId)) {
            throw new RuntimeException("La evidencia no pertenece a este sistema");
        }
        
        evidencia.setEliminado(true);
        evidencia.setFechaEliminacion(LocalDateTime.now());
        evidenciaRepository.save(evidencia);
    }
    
    @Transactional
    public OperacionSistemaDTO.EdicionResponse agregarUrl(Long id, String url, String descripcion) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        if (!pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.esPropietario(sistema, usuarioActual)
                && !esAdministrador(usuarioActual)) {
            throw new RuntimeException("No tiene permisos para agregar URLs");
        }
        
        EvidenciaEntity evidencia = new EvidenciaEntity();
        evidencia.setSistema(sistema);
        evidencia.setTipoEvidencia("URL");
        evidencia.setArchivoUrl(url);
        evidencia.setNombreArchivo(url);
        evidencia.setDescripcion(descripcion != null ? descripcion : "URL agregada");
        evidencia.setUsuarioRegistra(usuarioActual);
        evidencia.setFechaCarga(LocalDateTime.now());
        evidencia.setEstado("ACTIVO");
        evidencia.setEliminado(false);
        evidencia.setEsObligatoria(false);
        
        evidenciaRepository.save(evidencia);
        
        OperacionSistemaDTO.EdicionResponse response = new OperacionSistemaDTO.EdicionResponse();
        response.setId(sistema.getId());
        response.setExito(true);
        response.setMensaje("URL agregada correctamente");
        return response;
    }
    
    @Transactional
    public void eliminarUrl(Long sistemaId, Long urlId) {
        eliminarEvidencia(sistemaId, urlId);
    }
    
    @Transactional
    public OperacionSistemaDTO.EdicionResponse agregarIntegracion(Long id, EditarSistemaController.IntegracionRequest request) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));

        String usuarioActual = obtenerUsuarioActual();
        if (!pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.esPropietario(sistema, usuarioActual)
                && !esAdministrador(usuarioActual)) {
            throw new RuntimeException("No tiene permisos para agregar integraciones");
        }

        IntegracionEntity integracion = new IntegracionEntity();
        integracion.setSistema(sistema);
        integracion.setSistemaOrigen(sistema.getNombre());
        integracion.setSistemaDestino(request.getSistemaDestino());
        integracion.setProtocolo(request.getProtocolo());
        integracion.setMetodoIntercambio(request.getMetodo());
        integracion.setFrecuencia(request.getFrecuencia() != null ? request.getFrecuencia() : "Tiempo real");
        integracion.setEstado(request.getEstado() != null ? request.getEstado() : "ACTIVO");
        integracion.setResponsable(request.getResponsable());
        integracion.setDescripcion(request.getDescripcion());
        integracion.setFechaCreacion(LocalDateTime.now());
        integracion.setEliminado(false);

        integracionRepository.save(integracion);

        OperacionSistemaDTO.EdicionResponse response = new OperacionSistemaDTO.EdicionResponse();
        response.setId(sistema.getId());
        response.setExito(true);
        response.setMensaje("Integración agregada correctamente");
        return response;
    }
    
    @Transactional
    public void eliminarIntegracion(Long sistemaId, Long integracionId) {
        IntegracionEntity integracion = integracionRepository.findById(integracionId)
                .orElseThrow(() -> new RuntimeException("Integración no encontrada"));
        
        if (!integracion.getSistema().getId().equals(sistemaId)) {
            throw new RuntimeException("La integración no pertenece a este sistema");
        }
        
        integracion.setEliminado(true);
        integracionRepository.save(integracion);
    }
    
    @Transactional
    public OperacionSistemaDTO.EdicionResponse enviarAValidacion(Long id) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        if (!pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.esPropietario(sistema, usuarioActual)
                && !esAdministrador(usuarioActual)) {
            throw new RuntimeException("No tiene permisos para enviar a validación");
        }
        
        if (!"BORRADOR".equals(sistema.getEstado()) && !"OBSERVADO".equals(sistema.getEstado())) {
            throw new RuntimeException("El sistema debe estar en estado BORRADOR u OBSERVADO para enviar a validación");
        }
        
        // Verificar campos obligatorios
        validarCamposObligatorios(sistema);
        
        sistema.setEstado("ENVIADO");
        sistema.setUsuarioModificador(usuarioActual);
        sistema.setFechaActualizacion(LocalDateTime.now());
        sistemaRepository.save(sistema);
        
        OperacionSistemaDTO.EdicionResponse response = new OperacionSistemaDTO.EdicionResponse();
        response.setId(sistema.getId());
        response.setEstado(sistema.getEstado());
        response.setExito(true);
        response.setMensaje("Sistema enviado a validación exitosamente");
        return response;
    }
    
    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================
    
    private void validarCamposObligatorios(SistemaEntity sistema) {
        if (sistema.getNombre() == null || sistema.getNombre().isEmpty()) {
            throw new RuntimeException("El nombre del sistema es obligatorio");
        }
        if (sistema.getCodigo() == null || sistema.getCodigo().isEmpty()) {
            throw new RuntimeException("El código del sistema es obligatorio");
        }
        if (sistema.getResponsableTecnico() == null || sistema.getResponsableTecnico().isEmpty()) {
            throw new RuntimeException("El responsable técnico es obligatorio");
        }
        if (sistema.getTipoAplicativo() == null || sistema.getTipoAplicativo().isEmpty()) {
            throw new RuntimeException("El tipo de aplicativo es obligatorio");
        }
        
        if ("CRITICA".equals(sistema.getCriticidad()) || "ALTA".equals(sistema.getCriticidad())) {
            long evidenciasObligatorias = sistema.getEvidencias() != null ?
                    sistema.getEvidencias().stream()
                            .filter(e -> Boolean.TRUE.equals(e.getEsObligatoria()) && !Boolean.TRUE.equals(e.getEliminado()))
                            .count() : 0;
            
            if (evidenciasObligatorias < 2) {
                throw new RuntimeException("Los sistemas críticos requieren al menos 2 evidencias obligatorias");
            }
        }
    }
    
    private boolean esTipoPermitido(String contentType) {
        if (contentType == null) return false;
        return contentType.startsWith("image/") ||
               contentType.equals("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("application/vnd.ms-excel") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
               contentType.equals("application/zip") ||
               contentType.startsWith("text/");
    }
    
    private boolean esEvidenciaObligatoria(String tipo) {
        List<String> obligatorias = List.of("manual", "contrato", "documento", "certificados");
        return obligatorias.contains(tipo.toLowerCase());
    }
    
    private String obtenerUsuarioActual() {
        return pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.obtener();
    }
    
    private boolean esAdministrador(String usuario) {
        // TODO: Verificar si el usuario tiene rol de administrador
        return "admin".equals(usuario);
    }
}

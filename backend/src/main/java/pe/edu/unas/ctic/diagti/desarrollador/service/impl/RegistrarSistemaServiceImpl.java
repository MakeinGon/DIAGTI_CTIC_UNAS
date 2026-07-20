package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.controller.RegistrarSistemaController;
import pe.edu.unas.ctic.diagti.desarrollador.dto.*;
import pe.edu.unas.ctic.diagti.desarrollador.entity.*;
import pe.edu.unas.ctic.diagti.desarrollador.mapper.*;
import pe.edu.unas.ctic.diagti.desarrollador.repository.*;
import pe.edu.unas.ctic.diagti.desarrollador.service.RegistrarSistemaService;
import pe.edu.unas.ctic.diagti.desarrollador.util.RiesgoCalculator;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrarSistemaServiceImpl implements RegistrarSistemaService {
    
    private final SistemaRepository sistemaRepository;
    private final ArquitecturaRepository arquitecturaRepository;
    private final InfraestructuraRepository infraestructuraRepository;
    private final SeguridadRepository seguridadRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final IntegracionRepository integracionRepository;
    
    private final SistemaMapper sistemaMapper;
    private final ArquitecturaMapper arquitecturaMapper;
    private final InfraestructuraMapper infraestructuraMapper;
    private final SeguridadMapper seguridadMapper;
    private final EvidenciaMapper evidenciaMapper;
    private final IntegracionMapper integracionMapper;
    
    private final RiesgoCalculator riesgoCalculator;
    
    @Value("${app.uploads.path:uploads/evidencias}")
    private String uploadPath;
    
    @Override
    @Transactional
    public RegistrarSistemaResponseDTO registrarSistema(RegistrarSistemaRequestDTO request) {
        RegistrarSistemaResponseDTO response = new RegistrarSistemaResponseDTO();
        String usuarioActual = obtenerUsuarioActual();
        
        try {
            // Validar código único
            if (sistemaRepository.findByCodigo(request.getCodigo()).isPresent()) {
                response.setExito(false);
                response.setMensaje("El código ya existe");
                response.setErrores("Código duplicado");
                return response;
            }
            
            // Validar campos obligatorios
            String error = validarCamposObligatorios(request);
            if (error != null) {
                response.setExito(false);
                response.setMensaje("Faltan campos obligatorios");
                response.setErrores(error);
                return response;
            }
            
            // Crear sistema
            SistemaEntity sistema = new SistemaEntity();
            sistema.setCodigo(request.getCodigo());
            sistema.setNombre(request.getNombre());
            sistema.setDescripcion(request.getDescripcion());
            sistema.setTipoAplicativo(request.getTipoAplicativo());
            sistema.setAreaUsuaria(request.getAreaUsuaria());
            sistema.setResponsableFuncional(request.getResponsableFuncional());
            sistema.setResponsableTecnico(request.getResponsableTecnico() != null ? 
                    request.getResponsableTecnico() : usuarioActual);
            sistema.setCriticidad(request.getCriticidad() != null ? request.getCriticidad() : "MEDIA");
            sistema.setAnioDesarrollo(request.getAnioDesarrollo());
            sistema.setFormaAdquisicion(request.getFormaAdquisicion());
            sistema.setEmpresaDesarrolladora(request.getEmpresaDesarrolladora());
            sistema.setContratoVigente(request.getContratoVigente());
            sistema.setFechaVencimientoSoporte(request.getFechaVencimientoSoporte());
            sistema.setObservaciones(request.getObservaciones());
            sistema.setEsLegacy(request.getEsLegacy() != null ? request.getEsLegacy() : false);
            sistema.setEstado("BORRADOR");
            sistema.setUsuarioCreador(usuarioActual);
            sistema.setUsuarioModificador(usuarioActual);
            sistema.setEliminado(false);
            
            // Calcular riesgo inicial
            riesgoCalculator.calcularRiesgo(sistema);
            
            // Guardar sistema
            SistemaEntity saved = sistemaRepository.save(sistema);
            
            // Guardar arquitectura
            if (request.getArquitectura() != null) {
                ArquitecturaEntity arquitectura = arquitecturaMapper.toEntity(request.getArquitectura());
                arquitectura.setSistema(saved);
                arquitecturaRepository.save(arquitectura);
                saved.setArquitectura(arquitectura);
            }
            
            // Guardar infraestructura
            if (request.getInfraestructura() != null) {
                InfraestructuraEntity infraestructura = infraestructuraMapper.toEntity(request.getInfraestructura());
                infraestructura.setSistema(saved);
                infraestructuraRepository.save(infraestructura);
                saved.setInfraestructura(infraestructura);
            }
            
            // Guardar seguridad
            if (request.getSeguridad() != null) {
                SeguridadEntity seguridad = seguridadMapper.toEntity(request.getSeguridad());
                seguridad.setSistema(saved);
                seguridadRepository.save(seguridad);
                saved.setSeguridad(seguridad);
            }
            
            // Guardar integraciones
            if (request.getIntegraciones() != null && !request.getIntegraciones().isEmpty()) {
                for (IntegracionDTO integracionDTO : request.getIntegraciones()) {
                    IntegracionEntity integracion = integracionMapper.toEntity(integracionDTO);
                    integracion.setSistema(saved);
                    integracion.setSistemaOrigen(saved.getNombre());
                    integracion.setFechaCreacion(LocalDateTime.now());
                    integracion.setEliminado(false);
                    integracionRepository.save(integracion);
                }
            }
            
            // Actualizar sistema con relaciones
            sistemaRepository.save(saved);
            
            // Preparar respuesta
            response.setId(saved.getId());
            response.setCodigo(saved.getCodigo());
            response.setNombre(saved.getNombre());
            response.setEstado(saved.getEstado());
            response.setNivelRiesgo(saved.getNivelRiesgo());
            response.setPuntajeRiesgo(saved.getPuntajeRiesgo());
            response.setFechaCreacion(saved.getFechaCreacion());
            response.setExito(true);
            response.setMensaje("Sistema registrado exitosamente");
            
        } catch (Exception e) {
            response.setExito(false);
            response.setMensaje("Error al registrar el sistema");
            response.setErrores(e.getMessage());
        }
        
        return response;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Boolean validarCodigo(String codigo) {
        return !sistemaRepository.findByCodigo(codigo).isPresent();
    }
    
    @Override
    @Transactional
    public RegistrarSistemaResponseDTO subirEvidencia(Long id, String tipo, MultipartFile archivo) {
        RegistrarSistemaResponseDTO response = new RegistrarSistemaResponseDTO();
        String usuarioActual = obtenerUsuarioActual();
        
        try {
            SistemaEntity sistema = sistemaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
            
            // Validar archivo
            if (archivo.isEmpty()) {
                response.setExito(false);
                response.setMensaje("El archivo está vacío");
                return response;
            }
            
            // Validar tipo de archivo
            String contentType = archivo.getContentType();
            if (!esTipoPermitido(contentType)) {
                response.setExito(false);
                response.setMensaje("Tipo de archivo no permitido");
                return response;
            }
            
            // Validar tamaño (max 10MB)
            if (archivo.getSize() > 10 * 1024 * 1024) {
                response.setExito(false);
                response.setMensaje("El archivo excede el tamaño máximo permitido (10MB)");
                return response;
            }
            
            // Crear directorio si no existe
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            // Generar nombre único
            String extension = "";
            String originalName = archivo.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            
            // Guardar archivo
            Path filePath = uploadDir.resolve(fileName);
            Files.write(filePath, archivo.getBytes());
            
            // Crear evidencia
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
            
            response.setId(sistema.getId());
            response.setExito(true);
            response.setMensaje("Evidencia subida correctamente: " + archivo.getOriginalFilename());
            
        } catch (Exception e) {
            response.setExito(false);
            response.setMensaje("Error al subir la evidencia: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    @Transactional
    public RegistrarSistemaResponseDTO agregarUrl(Long id, String url, String descripcion) {
        RegistrarSistemaResponseDTO response = new RegistrarSistemaResponseDTO();
        String usuarioActual = obtenerUsuarioActual();
        
        try {
            SistemaEntity sistema = sistemaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
            
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
            
            response.setId(sistema.getId());
            response.setExito(true);
            response.setMensaje("URL agregada correctamente");
            
        } catch (Exception e) {
            response.setExito(false);
            response.setMensaje("Error al agregar URL: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    @Transactional
    public RegistrarSistemaResponseDTO agregarIntegracion(Long id, RegistrarSistemaController.IntegracionRequest request) {
        RegistrarSistemaResponseDTO response = new RegistrarSistemaResponseDTO();
        
        try {
            SistemaEntity sistema = sistemaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
            
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
            
            response.setId(sistema.getId());
            response.setExito(true);
            response.setMensaje("Integración agregada correctamente");
            
        } catch (Exception e) {
            response.setExito(false);
            response.setMensaje("Error al agregar integración: " + e.getMessage());
        }
        
        return response;
    }
    
    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================
    
    private String validarCamposObligatorios(RegistrarSistemaRequestDTO request) {
        if (request.getCodigo() == null || request.getCodigo().isEmpty()) {
            return "El código es obligatorio";
        }
        if (request.getNombre() == null || request.getNombre().isEmpty()) {
            return "El nombre es obligatorio";
        }
        if (request.getTipoAplicativo() == null || request.getTipoAplicativo().isEmpty()) {
            return "El tipo de aplicativo es obligatorio";
        }
        return null;
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
        // TODO: Implementar obtención del usuario desde el contexto de seguridad
        return "desarrollador1";
    }
}
package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.unas.ctic.diagti.desarrollador.dto.*;
import pe.edu.unas.ctic.diagti.desarrollador.entity.*;
import pe.edu.unas.ctic.diagti.desarrollador.repository.*;
import pe.edu.unas.ctic.diagti.desarrollador.service.SubsanarObservacionesService;
import pe.edu.unas.ctic.diagti.desarrollador.util.RiesgoCalculator;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubsanarObservacionesServiceImpl implements SubsanarObservacionesService {
    
    private final SistemaDesarrolloRepository sistemaRepository;
    private final ArquitecturaRepository arquitecturaRepository;
    private final InfraestructuraRepository infraestructuraRepository;
    private final SeguridadRepository seguridadRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final DesarrolladorValidacionRepository validacionRepository;  // ← CAMBIADO
    
    private final RiesgoCalculator riesgoCalculator;
    
    @Value("${app.uploads.path:uploads/evidencias}")
    private String uploadPath;
    
    @Override
    @Transactional(readOnly = true)
    public List<SistemaObservadoDTO> obtenerSistemasObservados() {
        String usuarioActual = obtenerUsuarioActual();
        
        List<SistemaEntity> sistemas = sistemaRepository
                .findByResponsableTecnicoAndEstadoAndEliminadoFalse(usuarioActual, "OBSERVADO");
        
        return sistemas.stream()
                .map(this::convertirASistemaObservadoDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public SubsanarObservacionesResponseDTO obtenerDetalleSubsanacion(Long id) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        if (!sistema.getResponsableTecnico().equals(usuarioActual)) {
            throw new RuntimeException("No tiene acceso a este sistema");
        }
        
        if (!"OBSERVADO".equals(sistema.getEstado())) {
            throw new RuntimeException("El sistema no está en estado observado");
        }
        
        SubsanarObservacionesResponseDTO response = new SubsanarObservacionesResponseDTO();
        response.setId(sistema.getId());
        response.setCodigo(sistema.getCodigo());
        response.setNombre(sistema.getNombre());
        response.setEstado(sistema.getEstado());
        
        // Obtener observaciones de la última validación
        List<SubsanarObservacionesResponseDTO.ObservacionDTO> observaciones = new ArrayList<>();
        
        validacionRepository.findBySistemaIdAndEsUltimaTrue(sistema.getId())
                .ifPresent(validacion -> {
                    if ("OBSERVADO".equals(validacion.getEstadoValidacion()) && 
                        validacion.getObservacion() != null) {
                        
                        // Dividir observaciones por líneas o por puntos
                        String[] lines = validacion.getObservacion().split("\\n");
                        for (String line : lines) {
                            if (line.trim().isEmpty()) continue;
                            
                            SubsanarObservacionesResponseDTO.ObservacionDTO obs = 
                                    new SubsanarObservacionesResponseDTO.ObservacionDTO();
                            obs.setDescripcion(line.trim());
                            obs.setTipo("OBSERVACION");
                            obs.setEstado("PENDIENTE");
                            
                            // Detectar campos referenciados
                            if (line.toLowerCase().contains("postgresql") || 
                                line.toLowerCase().contains("base de datos") ||
                                line.toLowerCase().contains("motor")) {
                                obs.setCampoReferencia("motorBaseDatos");
                            } else if (line.toLowerCase().contains("contrato")) {
                                obs.setCampoReferencia("contratoAdjunto");
                            } else if (line.toLowerCase().contains("repositorio") || 
                                       line.toLowerCase().contains("git")) {
                                obs.setCampoReferencia("repositorioGit");
                            } else if (line.toLowerCase().contains("seguridad") || 
                                       line.toLowerCase().contains("ssl") ||
                                       line.toLowerCase().contains("mfa")) {
                                obs.setCampoReferencia("seguridadChecks");
                            } else if (line.toLowerCase().contains("arquitectura")) {
                                obs.setCampoReferencia("arquitectura");
                            }
                            
                            observaciones.add(obs);
                        }
                    }
                });
        
        response.setObservaciones(observaciones);
        
        // Datos actuales del sistema
        SubsanarObservacionesResponseDTO.DatosSistemaDTO datos = 
                new SubsanarObservacionesResponseDTO.DatosSistemaDTO();
        
        if (sistema.getArquitectura() != null) {
            datos.setMotorBaseDatos(sistema.getArquitectura().getMotorBaseDatos());
            datos.setVersionBaseDatos(sistema.getArquitectura().getVersionBaseDatos());
            datos.setRepositorioGit(sistema.getArquitectura().getRepositorio());
        }
        
        // Verificar si tiene contrato como evidencia
        if (sistema.getEvidencias() != null) {
            boolean tieneContrato = sistema.getEvidencias().stream()
                    .anyMatch(e -> "contrato".equalsIgnoreCase(e.getTipoEvidencia()) && 
                                  !Boolean.TRUE.equals(e.getEliminado()));
            datos.setContratoAdjunto(tieneContrato);
        }
        
        // Seguridad checks
        if (sistema.getSeguridad() != null) {
            List<String> checks = new ArrayList<>();
            if (Boolean.TRUE.equals(sistema.getSeguridad().getSslTls())) checks.add("SSL");
            if (Boolean.TRUE.equals(sistema.getSeguridad().getMfa())) checks.add("MFA");
            if (Boolean.TRUE.equals(sistema.getSeguridad().getLogsActivos())) checks.add("Logs");
            if (Boolean.TRUE.equals(sistema.getSeguridad().getAuditoriaActiva())) checks.add("Auditoría");
            if (Boolean.TRUE.equals(sistema.getSeguridad().getOwaspCumple())) checks.add("OWASP");
            if (Boolean.TRUE.equals(sistema.getSeguridad().getControlAcceso())) checks.add("Control de acceso");
            if (Boolean.TRUE.equals(sistema.getSeguridad().getRestriccionIP())) checks.add("Restricción IP");
            if (Boolean.TRUE.equals(sistema.getSeguridad().getBackupSeguro())) checks.add("Backup");
            datos.setSeguridadChecks(checks);
        }
        
        response.setDatosSistema(datos);
        response.setExito(true);
        
        return response;
    }
    
    @Override
    @Transactional
    public SubsanarObservacionesResponseDTO guardarSubsanacion(Long id, SubsanarObservacionesRequestDTO request) {
        SubsanarObservacionesResponseDTO response = new SubsanarObservacionesResponseDTO();
        String usuarioActual = obtenerUsuarioActual();
        
        try {
            SistemaEntity sistema = sistemaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
            
            if (!sistema.getResponsableTecnico().equals(usuarioActual)) {
                throw new RuntimeException("No tiene permisos para subsanar este sistema");
            }
            
            if (!"OBSERVADO".equals(sistema.getEstado())) {
                throw new RuntimeException("El sistema no está en estado observado");
            }
            
            // Actualizar arquitectura
            if (sistema.getArquitectura() != null) {
                if (request.getMotorBaseDatos() != null) {
                    sistema.getArquitectura().setMotorBaseDatos(request.getMotorBaseDatos());
                }
                if (request.getVersionBaseDatos() != null) {
                    sistema.getArquitectura().setVersionBaseDatos(request.getVersionBaseDatos());
                }
                if (request.getRepositorioGit() != null) {
                    sistema.getArquitectura().setRepositorio(request.getRepositorioGit());
                }
                arquitecturaRepository.save(sistema.getArquitectura());
            }
            
            // Actualizar seguridad
            if (sistema.getSeguridad() != null && request.getSeguridadChecks() != null) {
                List<String> checks = request.getSeguridadChecks();
                sistema.getSeguridad().setSslTls(checks.contains("SSL"));
                sistema.getSeguridad().setMfa(checks.contains("MFA"));
                sistema.getSeguridad().setLogsActivos(checks.contains("Logs"));
                sistema.getSeguridad().setAuditoriaActiva(checks.contains("Auditoría"));
                sistema.getSeguridad().setOwaspCumple(checks.contains("OWASP"));
                sistema.getSeguridad().setControlAcceso(checks.contains("Control de acceso"));
                sistema.getSeguridad().setRestriccionIP(checks.contains("Restricción IP"));
                sistema.getSeguridad().setBackupSeguro(checks.contains("Backup"));
                seguridadRepository.save(sistema.getSeguridad());
            }
            
            // Crear registro de subsanación
            ValidacionEntity nuevaValidacion = new ValidacionEntity();
            // ✅ Usar sistemaId en lugar de setSistema
            nuevaValidacion.setSistemaId(sistema.getId());  // ← CAMBIADO
            nuevaValidacion.setEstadoValidacion("SUBSANADO");
            nuevaValidacion.setUsuarioSubsanacion(usuarioActual);
            nuevaValidacion.setFechaSubsanacion(LocalDateTime.now());
            nuevaValidacion.setComentarioSubsanacion(request.getComentarioGeneral());
            nuevaValidacion.setEsUltima(true);
            
            // Marcar validaciones anteriores como no últimas
            validacionRepository.findBySistemaIdAndEsUltimaTrue(sistema.getId())
                    .ifPresent(v -> {
                        v.setEsUltima(false);
                        validacionRepository.save(v);
                    });
            
            validacionRepository.save(nuevaValidacion);
            
            // Cambiar estado del sistema
            sistema.setEstado("SUBSANADO");
            sistema.setUsuarioModificador(usuarioActual);
            sistema.setFechaActualizacion(LocalDateTime.now());
            
            // Recalcular riesgo
            riesgoCalculator.calcularRiesgo(sistema);
            
            sistemaRepository.save(sistema);
            
            response.setId(sistema.getId());
            response.setCodigo(sistema.getCodigo());
            response.setNombre(sistema.getNombre());
            response.setEstado(sistema.getEstado());
            response.setFechaSubsanacion(LocalDateTime.now());
            response.setExito(true);
            response.setMensaje("Observaciones subsanadas correctamente");
            
        } catch (Exception e) {
            response.setExito(false);
            response.setMensaje("Error al guardar: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    @Transactional
    public SubsanarObservacionesResponseDTO subirEvidenciaSubsanacion(Long id, String tipo, MultipartFile archivo) {
        SubsanarObservacionesResponseDTO response = new SubsanarObservacionesResponseDTO();
        String usuarioActual = obtenerUsuarioActual();
        
        try {
            SistemaEntity sistema = sistemaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
            
            if (!sistema.getResponsableTecnico().equals(usuarioActual)) {
                throw new RuntimeException("No tiene permisos para subir evidencias");
            }
            
            // Validar archivo
            if (archivo.isEmpty()) {
                response.setExito(false);
                response.setMensaje("El archivo está vacío");
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
            evidencia.setDescripcion("Evidencia de subsanación: " + archivo.getOriginalFilename());
            evidencia.setUsuarioRegistra(usuarioActual);
            evidencia.setFechaCarga(LocalDateTime.now());
            evidencia.setEstado("ACTIVO");
            evidencia.setEliminado(false);
            evidencia.setEsObligatoria(true);
            
            evidenciaRepository.save(evidencia);
            
            response.setId(sistema.getId());
            response.setExito(true);
            response.setMensaje("Evidencia subida correctamente: " + archivo.getOriginalFilename());
            
        } catch (Exception e) {
            response.setExito(false);
            response.setMensaje("Error al subir evidencia: " + e.getMessage());
        }
        
        return response;
    }
    
    @Override
    @Transactional
    public SubsanarObservacionesResponseDTO reenviarValidacion(Long id) {
        SubsanarObservacionesResponseDTO response = new SubsanarObservacionesResponseDTO();
        String usuarioActual = obtenerUsuarioActual();
        
        try {
            SistemaEntity sistema = sistemaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
            
            if (!sistema.getResponsableTecnico().equals(usuarioActual)) {
                throw new RuntimeException("No tiene permisos para reenviar este sistema");
            }
            
            if (!"SUBSANADO".equals(sistema.getEstado())) {
                throw new RuntimeException("El sistema debe estar en estado SUBSANADO para reenviar");
            }
            
            // Cambiar estado a ENVIADO
            sistema.setEstado("ENVIADO");
            sistema.setUsuarioModificador(usuarioActual);
            sistema.setFechaActualizacion(LocalDateTime.now());
            
            // Crear registro de reenvío
            ValidacionEntity nuevaValidacion = new ValidacionEntity();
            // ✅ Usar sistemaId en lugar de setSistema
            nuevaValidacion.setSistemaId(sistema.getId());  // ← CAMBIADO
            nuevaValidacion.setEstadoValidacion("REENVIADO");
            nuevaValidacion.setValidador(usuarioActual);
            nuevaValidacion.setFechaValidacion(LocalDateTime.now());
            nuevaValidacion.setEsUltima(true);
            nuevaValidacion.setObservacion("Sistema reenviado a validación después de subsanar observaciones");
            
            // Marcar validaciones anteriores como no últimas
            validacionRepository.findBySistemaIdAndEsUltimaTrue(sistema.getId())
                    .ifPresent(v -> {
                        v.setEsUltima(false);
                        validacionRepository.save(v);
                    });
            
            validacionRepository.save(nuevaValidacion);
            sistemaRepository.save(sistema);
            
            response.setId(sistema.getId());
            response.setCodigo(sistema.getCodigo());
            response.setNombre(sistema.getNombre());
            response.setEstado(sistema.getEstado());
            response.setFechaSubsanacion(LocalDateTime.now());
            response.setExito(true);
            response.setMensaje("Sistema reenviado a validación correctamente");
            
        } catch (Exception e) {
            response.setExito(false);
            response.setMensaje("Error al reenviar: " + e.getMessage());
        }
        
        return response;
    }
    
    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================
    
    private SistemaObservadoDTO convertirASistemaObservadoDTO(SistemaEntity sistema) {
        SistemaObservadoDTO dto = new SistemaObservadoDTO();
        dto.setId(sistema.getId());
        dto.setCodigo(sistema.getCodigo());
        dto.setNombre(sistema.getNombre());
        dto.setEstado(sistema.getEstado());
        dto.setAreaUsuaria(sistema.getAreaUsuaria());
        
        // Obtener observaciones de la última validación
        validacionRepository.findBySistemaIdAndEsUltimaTrue(sistema.getId())
                .ifPresent(validacion -> {
                    dto.setFechaObservacion(validacion.getFechaValidacion());
                    dto.setValidador(validacion.getValidador());
                    
                    if (validacion.getObservacion() != null) {
                        String[] lines = validacion.getObservacion().split("\\n");
                        List<String> resumen = new ArrayList<>();
                        for (String line : lines) {
                            if (!line.trim().isEmpty()) {
                                resumen.add(line.trim());
                            }
                        }
                        dto.setObservacionesResumen(resumen);
                        dto.setCantidadObservaciones(resumen.size());
                    }
                });
        
        return dto;
    }
    
    private String obtenerUsuarioActual() {
        // TODO: Implementar obtención del usuario desde el contexto de seguridad
        return "desarrollador1";
    }
}
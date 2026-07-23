package pe.edu.unas.ctic.diagti.desarrollador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EnvioValidacionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaValidacionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaDesarrolloRepository;
import pe.edu.unas.ctic.diagti.desarrollador.repository.DesarrolladorValidacionRepository;  // ← CAMBIADO

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Verifica la completitud de los sistemas del propietario y registra el envío
 * en el historial de validaciones del módulo Desarrollo.
 */
@Service
@RequiredArgsConstructor
public class EnviarValidacionService {
    
    private final SistemaDesarrolloRepository sistemaRepository;
    private final DesarrolladorValidacionRepository validacionRepository;  // ← CAMBIADO
    
    @Transactional(readOnly = true)
    public List<SistemaValidacionDTO> obtenerSistemasPendientes() {
        String usuarioActual = obtenerUsuarioActual();
        
        // Obtener sistemas del usuario en estado BORRADOR u OBSERVADO
        List<SistemaEntity> sistemas = sistemaRepository
                .findByPropietarioAndEliminadoFalse(usuarioActual);
        
        return sistemas.stream()
                .filter(s -> "BORRADOR".equals(s.getEstado()) || "OBSERVADO".equals(s.getEstado()))
                .map(this::convertirASistemaValidacionDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public EnvioValidacionDTO.Response solicitarValidacion(EnvioValidacionDTO.Request request) {
        SistemaEntity sistema = sistemaRepository.findById(request.getSistemaId())
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        
        // Verificar que el usuario es el responsable técnico
        if (!pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.esPropietario(sistema, usuarioActual)) {
            throw new RuntimeException("No tiene permisos para enviar este sistema a validación");
        }
        
        // Verificar que el sistema está en estado válido
        if (!"BORRADOR".equals(sistema.getEstado()) && !"OBSERVADO".equals(sistema.getEstado())) {
            throw new RuntimeException("El sistema no está en estado borrador u observado");
        }
        
        // Verificar completitud
        SistemaValidacionDTO validacion = verificarCompletitud(sistema.getId());
        if (!validacion.getPuedeEnviar()) {
            throw new RuntimeException("El sistema no está completo: " + validacion.getMensajeCompletitud());
        }
        
        // Cambiar estado a ENVIADO
        sistema.setEstado("ENVIADO");
        sistema.setUsuarioModificador(usuarioActual);
        sistema.setFechaActualizacion(LocalDateTime.now());
        sistemaRepository.save(sistema);
        
        // Crear registro de validación
        ValidacionEntity nuevaValidacion = new ValidacionEntity();
        // ✅ Usar sistemaId en lugar de setSistema
        nuevaValidacion.setSistemaId(sistema.getId());  // ← CAMBIADO
        nuevaValidacion.setEstadoValidacion("ENVIADO");
        nuevaValidacion.setValidador(usuarioActual);
        nuevaValidacion.setFechaValidacion(LocalDateTime.now());
        nuevaValidacion.setEsUltima(true);
        nuevaValidacion.setObservacion(request.getComentario() != null ? request.getComentario() : "Sistema enviado a validación");
        
        // Buscar y marcar validaciones anteriores como no últimas
        validacionRepository.findBySistemaIdAndEsUltimaTrue(sistema.getId())
            .ifPresent(v -> {
                v.setEsUltima(false);
                validacionRepository.save(v);
            });
        validacionRepository.save(nuevaValidacion);
        
        EnvioValidacionDTO.Response response = new EnvioValidacionDTO.Response();
        response.setId(sistema.getId());
        response.setEstado(sistema.getEstado());
        response.setFechaEnvio(LocalDateTime.now());
        response.setExito(true);
        response.setMensaje("Sistema enviado a validación exitosamente");
        
        return response;
    }
    
    @Transactional(readOnly = true)
    public SistemaValidacionDTO verificarCompletitud(Long id) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        return calcularCompletitud(sistema);
    }
    
    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================
    
    private SistemaValidacionDTO convertirASistemaValidacionDTO(SistemaEntity sistema) {
        SistemaValidacionDTO dto = new SistemaValidacionDTO();
        dto.setId(sistema.getId());
        dto.setCodigo(sistema.getCodigo());
        dto.setNombre(sistema.getNombre());
        dto.setEstado(sistema.getEstado());
        dto.setArea(sistema.getAreaUsuaria());
        dto.setRiesgo(sistema.getNivelRiesgo());
        
        // Calcular completitud
        SistemaValidacionDTO completitud = calcularCompletitud(sistema);
        dto.setCompletitud(completitud.getCompletitud());
        dto.setPuedeEnviar(completitud.getPuedeEnviar());
        dto.setEvidenciasFaltantes(completitud.getEvidenciasFaltantes());
        dto.setMensajeCompletitud(completitud.getMensajeCompletitud());
        
        return dto;
    }
    
    private SistemaValidacionDTO calcularCompletitud(SistemaEntity sistema) {
        SistemaValidacionDTO dto = new SistemaValidacionDTO();
        dto.setId(sistema.getId());
        
        int totalCampos = 0;
        int camposCompletos = 0;
        List<String> camposFaltantes = new ArrayList<>();
        
        // 1. Información General (7 campos)
        totalCampos += 7;
        if (sistema.getNombre() != null && !sistema.getNombre().isEmpty()) {
            camposCompletos++;
        } else {
            camposFaltantes.add("Nombre");
        }
        if (sistema.getCodigo() != null && !sistema.getCodigo().isEmpty()) {
            camposCompletos++;
        } else {
            camposFaltantes.add("Código");
        }
        if (sistema.getTipoAplicativo() != null && !sistema.getTipoAplicativo().isEmpty()) {
            camposCompletos++;
        } else {
            camposFaltantes.add("Tipo de aplicativo");
        }
        if (sistema.getAreaUsuaria() != null && !sistema.getAreaUsuaria().isEmpty()) {
            camposCompletos++;
        } else {
            camposFaltantes.add("Área usuaria");
        }
        if (sistema.getResponsableTecnico() != null && !sistema.getResponsableTecnico().isEmpty()) {
            camposCompletos++;
        } else {
            camposFaltantes.add("Responsable técnico");
        }
        if (sistema.getCriticidad() != null && !sistema.getCriticidad().isEmpty()) {
            camposCompletos++;
        } else {
            camposFaltantes.add("Criticidad");
        }
        if (sistema.getEstado() != null && !sistema.getEstado().isEmpty()) {
            camposCompletos++;
        } else {
            camposFaltantes.add("Estado");
        }
        
        // 2. Arquitectura (si existe)
        if (sistema.getArquitectura() != null) {
            totalCampos += 4;
            if (sistema.getArquitectura().getLenguajeProgramacion() != null && 
                !sistema.getArquitectura().getLenguajeProgramacion().isEmpty()) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Lenguaje de programación");
            }
            if (sistema.getArquitectura().getFramework() != null && 
                !sistema.getArquitectura().getFramework().isEmpty()) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Framework");
            }
            if (sistema.getArquitectura().getMotorBaseDatos() != null && 
                !sistema.getArquitectura().getMotorBaseDatos().isEmpty()) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Motor de base de datos");
            }
            if (sistema.getArquitectura().getRepositorio() != null && 
                !sistema.getArquitectura().getRepositorio().isEmpty()) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Repositorio");
            }
        } else {
            camposFaltantes.add("Arquitectura completa");
        }
        
        // 3. Infraestructura (si existe)
        if (sistema.getInfraestructura() != null) {
            totalCampos += 3;
            if (sistema.getInfraestructura().getPlataforma() != null && 
                !sistema.getInfraestructura().getPlataforma().isEmpty()) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Plataforma");
            }
            if (sistema.getInfraestructura().getSistemaOperativo() != null && 
                !sistema.getInfraestructura().getSistemaOperativo().isEmpty()) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Sistema operativo");
            }
            if (sistema.getInfraestructura().getAmbiente() != null && 
                !sistema.getInfraestructura().getAmbiente().isEmpty()) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Ambiente");
            }
        } else {
            camposFaltantes.add("Infraestructura completa");
        }
        
        // 4. Seguridad (si existe)
        if (sistema.getSeguridad() != null) {
            totalCampos += 3;
            if (sistema.getSeguridad().getSslTls() != null) {
                camposCompletos++;
            } else {
                camposFaltantes.add("SSL/TLS");
            }
            if (sistema.getSeguridad().getAutenticacionActiva() != null) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Autenticación");
            }
            if (sistema.getSeguridad().getLogsActivos() != null) {
                camposCompletos++;
            } else {
                camposFaltantes.add("Logs activos");
            }
        } else {
            camposFaltantes.add("Seguridad completa");
        }
        
        // 5. Evidencias (mínimo 1 evidencia para sistemas normales, 2 para críticos)
        long evidencias = sistema.getEvidencias() != null ? 
                sistema.getEvidencias().stream()
                        .filter(e -> !Boolean.TRUE.equals(e.getEliminado()))
                        .count() : 0;
        
        int evidenciasRequeridas = "CRITICA".equals(sistema.getCriticidad()) ? 2 : 1;
        totalCampos += evidenciasRequeridas;
        
        if (evidencias >= evidenciasRequeridas) {
            camposCompletos += evidenciasRequeridas;
        } else {
            camposFaltantes.add(evidenciasRequeridas + " evidencia(s) requerida(s)");
            dto.setEvidenciasFaltantes((int) (evidenciasRequeridas - evidencias));
        }
        
        // Calcular porcentaje
        int completitud = (int) Math.round((double) camposCompletos / totalCampos * 100);
        dto.setCompletitud(Math.min(completitud, 100));
        
        // Determinar si puede enviar
        boolean puedeEnviar = dto.getCompletitud() == 100;
        dto.setPuedeEnviar(puedeEnviar);
        
        // Mensaje de completitud
        if (puedeEnviar) {
            dto.setMensajeCompletitud("✅ Sistema completo, listo para validación");
        } else if (dto.getCompletitud() >= 80) {
            dto.setMensajeCompletitud("⚠️ Completa los campos faltantes: " + String.join(", ", camposFaltantes));
        } else {
            dto.setMensajeCompletitud("❌ Faltan varios campos: " + String.join(", ", camposFaltantes));
        }
        
        return dto;
    }
    
    private String obtenerUsuarioActual() {
        return pe.edu.unas.ctic.diagti.desarrollador.util.UsuarioActual.obtener();
    }
}

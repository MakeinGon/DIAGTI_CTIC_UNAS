
package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EnviarValidacionRequestDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.EnviarValidacionResponseDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.SistemaValidacionDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.desarrollador.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.desarrollador.service.EnviarValidacionService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnviarValidacionServiceImpl implements EnviarValidacionService {
    
    private final SistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<SistemaValidacionDTO> obtenerSistemasPendientes() {
        String usuarioActual = obtenerUsuarioActual();
        
        // Obtener sistemas del usuario en estado BORRADOR u OBSERVADO
        List<SistemaEntity> sistemas = sistemaRepository
                .findByResponsableTecnicoAndEliminadoFalse(usuarioActual);
        
        return sistemas.stream()
                .filter(s -> "BORRADOR".equals(s.getEstado()) || "OBSERVADO".equals(s.getEstado()))
                .map(this::convertirASistemaValidacionDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public EnviarValidacionResponseDTO solicitarValidacion(EnviarValidacionRequestDTO request) {
        SistemaEntity sistema = sistemaRepository.findById(request.getSistemaId())
                .orElseThrow(() -> new RuntimeException("Sistema no encontrado"));
        
        String usuarioActual = obtenerUsuarioActual();
        
        // Verificar que el usuario es el responsable técnico
        if (!sistema.getResponsableTecnico().equals(usuarioActual)) {
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
        nuevaValidacion.setSistema(sistema);
        nuevaValidacion.setEstadoValidacion("ENVIADO");
        nuevaValidacion.setValidador(usuarioActual);
        nuevaValidacion.setFechaValidacion(LocalDateTime.now());
        nuevaValidacion.setEsUltima(true);
        nuevaValidacion.setObservacion(request.getComentario() != null ? request.getComentario() : "Sistema enviado a validación");
        
        // ✅ CORRECTO: validacionRepository (con c) y nuevaValidacion (con c)
        validacionRepository.findBySistemaIdAndEsUltimaTrue(sistema.getId())
            .ifPresent(v -> {
                v.setEsUltima(false);
                validacionRepository.save(v);
            });
        validacionRepository.save(nuevaValidacion);
        
        EnviarValidacionResponseDTO response = new EnviarValidacionResponseDTO();
        response.setId(sistema.getId());
        response.setEstado(sistema.getEstado());
        response.setFechaEnvio(LocalDateTime.now());
        response.setExito(true);
        response.setMensaje("Sistema enviado a validación exitosamente");
        
        return response;
    }
    
    @Override
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
        // TODO: Implementar obtención del usuario desde el contexto de seguridad
        return "desarrollador1";
    }
}
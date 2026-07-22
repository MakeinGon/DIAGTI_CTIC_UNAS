package pe.edu.unas.ctic.diagti.desarrollador.util;

import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;

import java.time.LocalDateTime;

@Component
public class RiesgoCalculator {
    
    /**
     * Calcula el riesgo de un sistema y actualiza sus campos
     * @param sistema El sistema a evaluar
     */
    public void calcularRiesgo(SistemaEntity sistema) {
        if (sistema == null) return;
        
        int puntaje = 0;
        
        // 1. Factor: Legacy
        if (Boolean.TRUE.equals(sistema.getEsLegacy())) {
            puntaje += 20;
        }
        
        // 2. Factor: Sin soporte
        if (sistema.getFechaVencimientoSoporte() != null && 
            sistema.getFechaVencimientoSoporte().isBefore(LocalDateTime.now())) {
            puntaje += 15;
        }
        
        // 3. Factor: Tecnología obsoleta
        if (sistema.getArquitectura() != null) {
            String lenguaje = sistema.getArquitectura().getLenguajeProgramacion();
            if (lenguaje != null && esLenguajeObsoleto(lenguaje)) {
                puntaje += 15;
            }
            
            // 4. Factor: Sin repositorio
            if (sistema.getArquitectura().getRepositorio() == null || 
                sistema.getArquitectura().getRepositorio().isEmpty()) {
                puntaje += 10;
            }
        }
        
        // 5. Factor: Sin SSL/TLS
        if (sistema.getSeguridad() != null) {
            if (!Boolean.TRUE.equals(sistema.getSeguridad().getSslTls())) {
                puntaje += 15;
            }
            
            // 6. Factor: Sin backup seguro
            if (!Boolean.TRUE.equals(sistema.getSeguridad().getBackupSeguro())) {
                puntaje += 10;
            }
            
            // 7. Factor: Sin logs
            if (!Boolean.TRUE.equals(sistema.getSeguridad().getLogsActivos())) {
                puntaje += 5;
            }
        }
        
        // 8. Factor: Proveedor sin contrato
        if (!Boolean.TRUE.equals(sistema.getContratoVigente())) {
            puntaje += 10;
        }
        
        // 9. Factor: Criticidad
        if ("CRITICA".equals(sistema.getCriticidad())) {
            puntaje += 15;
        } else if ("ALTA".equals(sistema.getCriticidad())) {
            puntaje += 10;
        }
        
        // 10. Factor: Responsable técnico no identificado
        if (sistema.getResponsableTecnico() == null || 
            sistema.getResponsableTecnico().isEmpty()) {
            puntaje += 10;
        }
        
        // Guardar puntaje
        sistema.setPuntajeRiesgo(puntaje);
        
        // Determinar nivel de riesgo
        String nivelRiesgo;
        if (puntaje >= 70) {
            nivelRiesgo = "CRITICO";
        } else if (puntaje >= 50) {
            nivelRiesgo = "ALTO";
        } else if (puntaje >= 30) {
            nivelRiesgo = "MEDIO";
        } else {
            nivelRiesgo = "BAJO";
        }
        sistema.setNivelRiesgo(nivelRiesgo);
    }
    
    /**
     * Calcula el riesgo y retorna el resultado sin modificar el sistema
     */
    public String calcularNivelRiesgo(SistemaEntity sistema) {
        if (sistema == null) return "BAJO";
        calcularRiesgo(sistema);
        return sistema.getNivelRiesgo();
    }
    
    /**
     * Retorna el puntaje de riesgo sin modificar el sistema
     */
    public int calcularPuntajeRiesgo(SistemaEntity sistema) {
        if (sistema == null) return 0;
        calcularRiesgo(sistema);
        return sistema.getPuntajeRiesgo() != null ? sistema.getPuntajeRiesgo() : 0;
    }
    
    private boolean esLenguajeObsoleto(String lenguaje) {
        if (lenguaje == null) return false;
        String lang = lenguaje.toLowerCase();
        return lang.contains("cobol") || 
               lang.contains("fortran") || 
               lang.contains("pascal") ||
               lang.contains("visual basic") ||
               lang.contains("delphi") ||
               lang.contains("coldfusion") ||
               lang.contains("classic asp") ||
               lang.contains("perl") ||
               lang.contains("foxpro");
    }
}
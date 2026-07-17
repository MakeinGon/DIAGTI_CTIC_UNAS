package pe.edu.unas.ctic.diagti.director.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class RiesgoMapper {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<RiesgoDTO> calcularRiesgos(SistemaEntity sistema, List<ValidacionEntity> validaciones, List<SeguridadEntity> seguridades) {
        List<RiesgoDTO> riesgos = new ArrayList<>();

        // 1. Riesgo por validación observada o rechazada
        if (validaciones != null) {
            for (ValidacionEntity v : validaciones) {
                if ("OBSERVADO".equalsIgnoreCase(v.getEstadoValidacion()) || "RECHAZADO".equalsIgnoreCase(v.getEstadoValidacion())) {
                    RiesgoDTO riesgo = new RiesgoDTO();
                    riesgo.setCodigo(sistema.getCodigoUnico());
                    riesgo.setTitulo("Validación " + v.getEstadoValidacion().toLowerCase() + " - " + sistema.getNombre());
                    riesgo.setArea(sistema.getAreaUsuarioNombre());
                    riesgo.setCategoria("Validación");
                    riesgo.setNivel("advertencia");
                    riesgo.setEstado("abierto");
                    riesgo.setEtapa(v.getEstadoValidacion());
                    riesgo.setResponsable("Validador CTIC");
                    if (v.getFechaValidacion() != null) {
                        riesgo.setDetectado(v.getFechaValidacion().format(DATE_FORMAT));
                    }
                    riesgo.setRecomendacion("Revisar observaciones y subsanar.");
                    riesgo.setVulnerabilidad(false);
                    riesgo.setCuelloBotella(false);
                    riesgos.add(riesgo);
                }
            }
        }

        // 2. Riesgo por seguridad: si no tiene SSL/TLS
        if (seguridades != null) {
            boolean tieneSSL = seguridades.stream().anyMatch(s -> "SSL/TLS".equalsIgnoreCase(s.getTipoControl()));
            if (!tieneSSL) {
                RiesgoDTO riesgo = new RiesgoDTO();
                riesgo.setCodigo(sistema.getCodigoUnico());
                riesgo.setTitulo("Falta SSL/TLS - " + sistema.getNombre());
                riesgo.setArea(sistema.getAreaUsuarioNombre());
                riesgo.setCategoria("Seguridad");
                riesgo.setNivel("critico");
                riesgo.setEstado("abierto");
                riesgo.setEtapa("Revisión de seguridad");
                riesgo.setResponsable("Seguridad TI");
                if (sistema.getFechaCreacion() != null) {
                    riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
                }
                riesgo.setRecomendacion("Implementar certificado SSL/TLS.");
                riesgo.setVulnerabilidad(true);
                riesgo.setCuelloBotella(false);
                riesgos.add(riesgo);
            }
        }

        // 3. Riesgo por contrato vencido o sin soporte
        if (sistema.getContratoVigente() == null || !sistema.getContratoVigente()) {
            RiesgoDTO riesgo = new RiesgoDTO();
            riesgo.setCodigo(sistema.getCodigoUnico());
            riesgo.setTitulo("Contrato sin vigencia - " + sistema.getNombre());
            riesgo.setArea(sistema.getAreaUsuarioNombre());
            riesgo.setCategoria("Contractual");
            riesgo.setNivel("advertencia");
            riesgo.setEstado("abierto");
            riesgo.setEtapa("Gestión contractual");
            riesgo.setResponsable("Administración");
            if (sistema.getFechaCreacion() != null) {
                riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
            }
            riesgo.setRecomendacion("Renovar contrato o gestionar nuevo soporte.");
            riesgo.setVulnerabilidad(false);
            riesgo.setCuelloBotella(true);
            riesgos.add(riesgo);
        }

        // 4. Riesgo por sistema legacy
        if (sistema.getEsLegacy() != null && sistema.getEsLegacy()) {
            RiesgoDTO riesgo = new RiesgoDTO();
            riesgo.setCodigo(sistema.getCodigoUnico());
            riesgo.setTitulo("Sistema legacy - " + sistema.getNombre());
            riesgo.setArea(sistema.getAreaUsuarioNombre());
            riesgo.setCategoria("Obsolescencia");
            riesgo.setNivel("critico");
            riesgo.setEstado("abierto");
            riesgo.setEtapa("Migración");
            riesgo.setResponsable("Área de Desarrollo");
            if (sistema.getFechaCreacion() != null) {
                riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
            }
            riesgo.setRecomendacion("Planificar migración a tecnologías modernas.");
            riesgo.setVulnerabilidad(true);
            riesgo.setCuelloBotella(false);
            riesgos.add(riesgo);
        }

        // 5. Riesgo por estado de flujo en "Borrador" por más de 30 días
        if ("BORRADOR".equalsIgnoreCase(sistema.getEstadoFlujo()) && sistema.getFechaCreacion() != null) {
            if (sistema.getFechaCreacion().plusDays(30).isBefore(java.time.LocalDateTime.now())) {
                RiesgoDTO riesgo = new RiesgoDTO();
                riesgo.setCodigo(sistema.getCodigoUnico());
                riesgo.setTitulo("Registro en borrador prolongado - " + sistema.getNombre());
                riesgo.setArea(sistema.getAreaUsuarioNombre());
                riesgo.setCategoria("Proceso");
                riesgo.setNivel("advertencia");
                riesgo.setEstado("abierto");
                riesgo.setEtapa("Borrador");
                riesgo.setResponsable("Área de Desarrollo");
                riesgo.setDetectado(sistema.getFechaCreacion().format(DATE_FORMAT));
                riesgo.setRecomendacion("Completar el registro y enviar a validación.");
                riesgo.setVulnerabilidad(false);
                riesgo.setCuelloBotella(true);
                riesgos.add(riesgo);
            }
        }

        return riesgos;
    }
}
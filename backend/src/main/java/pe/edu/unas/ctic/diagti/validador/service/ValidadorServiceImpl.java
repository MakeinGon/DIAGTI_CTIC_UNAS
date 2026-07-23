package pe.edu.unas.ctic.diagti.validador.service;

import pe.edu.unas.ctic.diagti.validador.dto.ValidadorDTO;
import pe.edu.unas.ctic.diagti.validador.entity.Validacion;
import pe.edu.unas.ctic.diagti.validador.repository.ValidadorValidacionRepository;
import pe.edu.unas.ctic.diagti.sistemas.model.Sistema;
import pe.edu.unas.ctic.diagti.sistemas.repository.ssSistemaRepository;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ValidadorServiceImpl implements ValidadorService {

    @Autowired
    private ValidadorValidacionRepository validacionRepository;  // ✅ NOMBRE CORRECTO

    @Autowired
    private ssSistemaRepository sistemaRepository;

    @Autowired
    private LoginUsuarioRepository usuarioRepository;

    @Override
    public List<ValidadorDTO> getPendientes() {
        List<Validacion> validaciones = validacionRepository.findPendientes();
        return validaciones.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ValidadorDTO> getEnSubsanacion() {
        List<Validacion> validaciones = validacionRepository.findEnSubsanacion();
        return validaciones.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ValidadorDTO> getValidados() {
        List<Validacion> validaciones = validacionRepository.findValidados();
        return validaciones.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ValidadorDTO validarSistema(Validacion validacion) {
        validacion.setEstadoValidacion("VALIDADO");
        validacion.setResultado("APROBADO");
        validacion.setFechaValidacion(LocalDateTime.now());
        validacion.setFechaActualizacion(LocalDateTime.now());
        
        Validacion saved = validacionRepository.save(validacion);
        return convertirADTO(saved);
    }

    @Override
    @Transactional
    public ValidadorDTO observarSistema(Validacion validacion) {
        validacion.setEstadoValidacion("OBSERVADO");
        validacion.setResultado("OBSERVADO");
        validacion.setFechaValidacion(LocalDateTime.now());
        validacion.setFechaActualizacion(LocalDateTime.now());
        
        Validacion saved = validacionRepository.save(validacion);
        return convertirADTO(saved);
    }

    @Override
    @Transactional
    public ValidadorDTO rechazarSistema(Validacion validacion) {
        validacion.setEstadoValidacion("RECHAZADO");
        validacion.setResultado("RECHAZADO");
        validacion.setFechaValidacion(LocalDateTime.now());
        validacion.setFechaActualizacion(LocalDateTime.now());
        
        Validacion saved = validacionRepository.save(validacion);
        return convertirADTO(saved);
    }

    @Override
    public Map<String, Long> getEstadisticas() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pendientes", validacionRepository.countByEstadoValidacion("PENDIENTE"));
        stats.put("observados", validacionRepository.countByEstadoValidacion("OBSERVADO"));
        stats.put("validados", validacionRepository.countByEstadoValidacion("VALIDADO"));
        stats.put("rechazados", validacionRepository.countByEstadoValidacion("RECHAZADO"));
        return stats;
    }

    @Override
    public Validacion getValidacionBySistema(Long idSistema) {
        List<Validacion> validaciones = validacionRepository.findBySistemaIdSistema(idSistema);
        return validaciones.isEmpty() ? null : validaciones.get(0);
    }

    private ValidadorDTO convertirADTO(Validacion validacion) {
        ValidadorDTO dto = new ValidadorDTO();
        dto.setIdValidacion(validacion.getIdValidacion());
        dto.setIdSistema(validacion.getIdSistema());
        dto.setIdValidador(validacion.getIdValidador());
        dto.setEstadoValidacion(validacion.getEstadoValidacion());
        dto.setResultado(validacion.getResultado());
        dto.setObservacionGeneral(validacion.getObservacionGeneral());
        dto.setFechaValidacion(validacion.getFechaValidacion());
        dto.setFechaSubsanacion(validacion.getFechaSubsanacion());
        dto.setFechaCreacion(validacion.getFechaCreacion());
        dto.setFechaActualizacion(validacion.getFechaActualizacion());

        // Obtener nombre del sistema
        Optional<Sistema> sistemaOpt = sistemaRepository.findById(validacion.getIdSistema());
        if (sistemaOpt.isPresent()) {
            dto.setNombreSistema(sistemaOpt.get().getNombre());
        }

        // Obtener nombre del validador
        if (validacion.getIdValidador() != null) {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(validacion.getIdValidador());
            if (usuarioOpt.isPresent()) {
                dto.setNombreValidador(usuarioOpt.get().getNombres() + " " + usuarioOpt.get().getApellidos());
            }
        }

        return dto;
    }
}
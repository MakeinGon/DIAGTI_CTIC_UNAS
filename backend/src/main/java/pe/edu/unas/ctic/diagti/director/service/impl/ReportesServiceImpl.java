package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteRiesgoDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.mapper.RiesgoMapper;
import pe.edu.unas.ctic.diagti.director.repository.SeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.service.ReportesService;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesServiceImpl implements ReportesService {

    private final SistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    private final SeguridadRepository seguridadRepository;
    private final CatalogoRepository catalogoRepository;
    private final RiesgoMapper riesgoMapper;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private String getAreaNombre(SistemaEntity sistema) {
        if (sistema == null || sistema.getIdAreaUsuario() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(sistema.getIdAreaUsuario())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    private String getCriticidadNombre(SistemaEntity sistema) {
        if (sistema == null || sistema.getIdCriticidad() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(sistema.getIdCriticidad())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteInventarioDTO> obtenerInventario(String area, String criticidad) {
        List<SistemaEntity> sistemas = sistemaRepository.findAll();
        sistemas.forEach(s -> {
            Hibernate.initialize(s.getValidaciones());
            Hibernate.initialize(s.getObservaciones());
        });

        return sistemas.stream()
                .filter(s -> area == null || area.isEmpty() || "all".equals(area) || area.equalsIgnoreCase(getAreaNombre(s)))
                .filter(s -> criticidad == null || criticidad.isEmpty() || "all".equals(criticidad) || criticidad.equalsIgnoreCase(getCriticidadNombre(s)))
                .map(s -> {
                    ReporteInventarioDTO dto = new ReporteInventarioDTO();
                    dto.setCodigo(s.getCodigoUnico());
                    dto.setNombre(s.getNombre());
                    dto.setTipo("No especificado");
                    dto.setCriticidad(getCriticidadNombre(s));
                    dto.setEstadoValidacion(s.getEstadoValidacion());
                    dto.setEstadoOperativo("Activo");
                    dto.setIdAreaUsuario(s.getIdAreaUsuario());
                    dto.setArea(getAreaNombre(s));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteValidacionDTO> obtenerValidacion(String area, String estado, String validationStatus) {
        List<ValidacionEntity> validaciones = validacionRepository.findAll();
        validaciones.forEach(v -> Hibernate.initialize(v.getSistema()));

        return validaciones.stream()
                .filter(v -> {
                    if (area == null || area.isEmpty() || "all".equals(area)) return true;
                    SistemaEntity s = v.getSistema();
                    return s != null && area.equalsIgnoreCase(getAreaNombre(s));
                })
                .filter(v -> {
                    if (estado == null || estado.isEmpty() || "all".equals(estado)) return true;
                    return estado.equalsIgnoreCase(v.getEstadoValidacion());
                })
                .filter(v -> {
                    if (validationStatus == null || validationStatus.isEmpty() || "all".equals(validationStatus)) return true;
                    return validationStatus.equalsIgnoreCase(v.getEstadoValidacion());
                })
                .map(v -> {
                    ReporteValidacionDTO dto = new ReporteValidacionDTO();
                    SistemaEntity s = v.getSistema();
                    dto.setCodigo(s != null ? s.getCodigoUnico() : "N/A");
                    dto.setNombre(s != null ? s.getNombre() : "N/A");
                    dto.setEstadoValidacion(v.getEstadoValidacion());
                    dto.setFechaValidacion(v.getFechaValidacion() != null ? v.getFechaValidacion().format(DATE_FORMAT) : "No reportada");
                    dto.setArea(s != null ? getAreaNombre(s) : "N/A");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteRiesgoDTO> obtenerRiesgos(String area, String criticidad) {
        List<SistemaEntity> sistemas = sistemaRepository.findAll();
        List<ReporteRiesgoDTO> resultados = new ArrayList<>();

        for (SistemaEntity sistema : sistemas) {
            Hibernate.initialize(sistema.getValidaciones());
            Hibernate.initialize(sistema.getObservaciones());
            
            List<ValidacionEntity> validaciones = validacionRepository.findByIdSistema(sistema.getIdSistema());
            List<SeguridadEntity> seguridades = seguridadRepository.findByIdSistema(sistema.getIdSistema());

            List<RiesgoDTO> riesgos = riesgoMapper.calcularRiesgos(sistema, validaciones, seguridades);

            for (RiesgoDTO riesgo : riesgos) {
                ReporteRiesgoDTO dto = new ReporteRiesgoDTO();
                dto.setCodigoSistema(riesgo.getCodigo());
                dto.setRiesgo(riesgo.getTitulo());
                dto.setCategoria(riesgo.getCategoria());
                dto.setEstado(riesgo.getEstado());
                dto.setCriticidad(getCriticidadNombre(sistema));
                dto.setArea(getAreaNombre(sistema));
                dto.setFechaIso(riesgo.getDetectado());
                dto.setRiesgoNivel(riesgo.getNivel()); // Para el nivel de riesgo en la tabla
                resultados.add(dto);
            }
        }

        return resultados.stream()
                .filter(r -> area == null || area.isEmpty() || "all".equals(area) || area.equalsIgnoreCase(r.getArea()))
                .filter(r -> criticidad == null || criticidad.isEmpty() || "all".equals(criticidad) || criticidad.equalsIgnoreCase(r.getCriticidad()))
                .collect(Collectors.toList());
    }
}
package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaSimpleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaListDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.AdministradorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.SistemaAdminService;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SistemaAdminServiceImpl implements SistemaAdminService {

    private final DirectorSistemaRepository sistemaRepository;
    private final AdministradorEvidenciaRepository evidenciaRepository;
    private final CatalogoRepository catalogoRepository;
    private final UsuarioRepository usuarioRepository;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public List<SistemaListDTO> listarSistemas(String busqueda, String area, String responsable, 
                                               String estado, String criticidad, String tipo, 
                                               String fechaDesde, String fechaHasta) {
        List<SistemaEntity> sistemas = sistemaRepository.findAll();
        
        if (sistemas.isEmpty()) {
            return new ArrayList<>();
        }
        
        return sistemas.stream()
                .filter(s -> {
                    if (busqueda != null && !busqueda.isEmpty()) {
                        String nombre = s.getNombre() != null ? s.getNombre().toLowerCase() : "";
                        String codigo = s.getCodigoUnico() != null ? s.getCodigoUnico().toLowerCase() : "";
                        if (!nombre.contains(busqueda.toLowerCase()) && 
                            !codigo.contains(busqueda.toLowerCase())) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(this::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SistemaDetalleDTO obtenerPorId(Long id) {
        if (id == null) {
            return null;
        }
        return sistemaRepository.findById(id)
                .map(this::toDetalleDTO)
                .orElse(null);
    }

    @Override
    public Long contarSistemas() {
        return sistemaRepository.count();
    }

    @Override
    public Long contarActivos() {
        List<SistemaEntity> todos = sistemaRepository.findAll();
        if (todos.isEmpty()) {
            return 0L;
        }
        return todos.stream()
                .filter(s -> {
                    String estado = s.getEstadoFlujo() != null ? s.getEstadoFlujo().toUpperCase() : "";
                    return "ACTIVO".equals(estado) || "VALIDADO".equals(estado);
                })
                .count();
    }

    // ------------------------------------------------------------
    // RESOLUCIÓN DE LLAVES FORÁNEAS (catálogos y usuarios)
    // ------------------------------------------------------------

    private String resolverValorCatalogo(Long idCatalogo, String etiquetaPorDefecto) {
        if (idCatalogo == null) return etiquetaPorDefecto;
        return catalogoRepository.findById(idCatalogo)
                .map(CatalogoEntity::getValor)
                .orElse(etiquetaPorDefecto);
    }

    private String resolverNombreUsuario(Long idUsuario) {
        if (idUsuario == null) return null;
        return usuarioRepository.findById(idUsuario)
                .map(u -> (u.getNombres() + " " + u.getApellidos()).trim())
                .orElse(null);
    }

    private String resolverResponsable(SistemaEntity entity) {
        // Prioridad: responsable funcional, luego responsable técnico
        String funcional = resolverNombreUsuario(entity.getIdResponsableFuncional());
        if (funcional != null && !funcional.isEmpty()) {
            return funcional;
        }
        String tecnico = resolverNombreUsuario(entity.getIdResponsableTecnico());
        if (tecnico != null && !tecnico.isEmpty()) {
            return tecnico;
        }
        return "Sin responsable";
    }

    private SistemaListDTO toListDTO(SistemaEntity entity) {
        SistemaListDTO dto = new SistemaListDTO();
        dto.setId(entity.getIdSistema());
        dto.setCodigo(entity.getCodigoUnico() != null ? entity.getCodigoUnico() : "N/A");
        dto.setNombre(entity.getNombre() != null ? entity.getNombre() : "Sin nombre");
        dto.setArea(resolverValorCatalogo(entity.getIdAreaUsuario(), "Área no definida"));
        dto.setResponsable(resolverResponsable(entity));
        dto.setEstado(entity.getEstadoFlujo() != null ? entity.getEstadoFlujo() : "N/A");
        
        // Nivel de riesgo (para el badge de riesgo)
        dto.setCriticidad(entity.getNivelRiesgo() != null ? entity.getNivelRiesgo() : "No definida");
        
        // ✅ NUEVO: Criticidad real desde el catálogo
        dto.setCriticidadNombre(resolverValorCatalogo(entity.getIdCriticidad(), "No especificada"));
        
        if (entity.getFechaActualizacion() != null) {
            dto.setFechaActualizacion(entity.getFechaActualizacion().format(DATE_FORMAT));
        } else if (entity.getFechaCreacion() != null) {
            dto.setFechaActualizacion(entity.getFechaCreacion().format(DATE_FORMAT));
        } else {
            dto.setFechaActualizacion("N/A");
        }
        return dto;
    }

    private SistemaDetalleDTO toDetalleDTO(SistemaEntity entity) {
        SistemaDetalleDTO dto = new SistemaDetalleDTO();
        dto.setId(entity.getIdSistema());
        dto.setCodigo(entity.getCodigoUnico() != null ? entity.getCodigoUnico() : "N/A");
        dto.setNombre(entity.getNombre() != null ? entity.getNombre() : "Sin nombre");
        dto.setArea(resolverValorCatalogo(entity.getIdAreaUsuario(), "Área no definida"));
        dto.setResponsable(resolverResponsable(entity));
        dto.setEstado(entity.getEstadoFlujo() != null ? entity.getEstadoFlujo() : "N/A");
        dto.setCriticidad(entity.getNivelRiesgo() != null ? entity.getNivelRiesgo() : "No definida");
        dto.setTipo(resolverValorCatalogo(entity.getIdTipoAplicativo(), "No especificado"));
        dto.setHeredado(Boolean.TRUE.equals(entity.getEsLegacy()));
        if (entity.getFechaActualizacion() != null) {
            dto.setFechaActualizacion(entity.getFechaActualizacion().format(DATE_FORMAT));
        } else {
            dto.setFechaActualizacion("");
        }
        
        // Evidencias asociadas
        List<EvidenciaSimpleDTO> evidencias = evidenciaRepository.findByIdSistema(entity.getIdSistema())
                .stream()
                .map(e -> {
                    EvidenciaSimpleDTO ev = new EvidenciaSimpleDTO();
                    ev.setNombre(e.getNombreArchivo() != null ? e.getNombreArchivo() : e.getUrlEvidencia());
                    ev.setTipo(e.getTipoEvidencia());
                    ev.setFecha(e.getFechaCarga() != null ? e.getFechaCarga().format(DATE_FORMAT) : "");
                    return ev;
                })
                .collect(Collectors.toList());
        dto.setEvidencias(evidencias);
        
        return dto;
    }
}
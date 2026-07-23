package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.EvidenciaSimpleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaAdminUpdateDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaDetalleDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaListDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.SistemaResponsablesRequestDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AdministradorEvidenciaRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.SistemaAdminService;
import pe.edu.unas.ctic.diagti.administrador.support.AdminAuditoriaWriter;
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;

import java.time.LocalDate;
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
    private final AdminAuditoriaWriter auditoriaWriter;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional(readOnly = true)
    public List<SistemaListDTO> listarSistemas(String busqueda, String area, String responsable,
                                               String estado, String criticidad, String tipo,
                                               String fechaDesde, String fechaHasta) {
        List<SistemaEntity> sistemas = sistemaRepository.findAll();
        if (sistemas.isEmpty()) {
            return new ArrayList<>();
        }

        LocalDate desde = parseFecha(fechaDesde);
        LocalDate hasta = parseFecha(fechaHasta);

        return sistemas.stream()
                .filter(s -> s.getFechaEliminacion() == null)
                .filter(s -> coincideBusqueda(s, busqueda))
                .map(this::toListDTO)
                .filter(dto -> coincideTexto(area, dto.getArea()))
                .filter(dto -> coincideTexto(responsable, dto.getResponsable()))
                .filter(dto -> coincideEstado(estado, dto.getEstado()))
                .filter(dto -> coincideTexto(criticidad, dto.getCriticidadNombre())
                        || coincideTexto(criticidad, dto.getCriticidad()))
                .filter(dto -> coincideTexto(tipo, dto.getTipo()))
                .filter(dto -> coincideRangoFecha(dto.getFechaActualizacion(), desde, hasta))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SistemaDetalleDTO obtenerPorId(Long id) {
        return toDetalleDTO(buscarActivo(id));
    }

    @Override
    @Transactional
    public SistemaDetalleDTO actualizarAdministrativo(Long id, SistemaAdminUpdateDTO dto) {
        SistemaEntity entity = buscarActivo(id);
        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            entity.setNombre(dto.getNombre().trim());
        }
        if (dto.getDescripcion() != null) {
            entity.setDescripcion(dto.getDescripcion());
        }
        if (dto.getIdAreaUsuario() != null) {
            validarCatalogo(dto.getIdAreaUsuario());
            entity.setIdAreaUsuario(dto.getIdAreaUsuario());
        }
        if (dto.getIdTipoAplicativo() != null) {
            validarCatalogo(dto.getIdTipoAplicativo());
            entity.setIdTipoAplicativo(dto.getIdTipoAplicativo());
        }
        if (dto.getIdCriticidad() != null) {
            validarCatalogo(dto.getIdCriticidad());
            entity.setIdCriticidad(dto.getIdCriticidad());
        }
        if (dto.getFormaAdquisicion() != null) {
            entity.setFormaAdquisicion(dto.getFormaAdquisicion());
        }
        // No se modifica estado_flujo ni evaluaciones técnicas.
        entity = sistemaRepository.save(entity);
        auditoriaWriter.registrar("sistema actualizado",
                "Datos administrativos actualizados: " + entity.getCodigoUnico());
        return toDetalleDTO(entity);
    }

    @Override
    @Transactional
    public SistemaDetalleDTO asignarResponsables(Long id, SistemaResponsablesRequestDTO dto) {
        SistemaEntity entity = buscarActivo(id);
        if (dto.getIdResponsableTecnico() != null) {
            entity.setIdResponsableTecnico(validarUsuarioActivo(dto.getIdResponsableTecnico()).getIdUsuario());
        }
        if (dto.getIdResponsableFuncional() != null) {
            entity.setIdResponsableFuncional(validarUsuarioActivo(dto.getIdResponsableFuncional()).getIdUsuario());
        }
        entity = sistemaRepository.save(entity);
        auditoriaWriter.registrar("responsable asignado",
                "Responsables asignados en sistema " + entity.getCodigoUnico()
                        + " (técnico=" + entity.getIdResponsableTecnico()
                        + ", funcional=" + entity.getIdResponsableFuncional() + ")");
        return toDetalleDTO(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Long contarSistemas() {
        return sistemaRepository.findAll().stream()
                .filter(s -> s.getFechaEliminacion() == null)
                .count();
    }

    @Override
    @Transactional(readOnly = true)
    public Long contarActivos() {
        return sistemaRepository.findAll().stream()
                .filter(s -> s.getFechaEliminacion() == null)
                .filter(s -> {
                    String estado = s.getEstadoFlujo() != null ? s.getEstadoFlujo().toUpperCase() : "";
                    return "ACTIVO".equals(estado) || "VALIDADO".equals(estado);
                })
                .count();
    }

    private SistemaEntity buscarActivo(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Sistema no encontrado");
        }
        SistemaEntity entity = sistemaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sistema no encontrado"));
        if (entity.getFechaEliminacion() != null) {
            throw new ResourceNotFoundException("Sistema no encontrado");
        }
        return entity;
    }

    private UsuarioEntity validarUsuarioActivo(Long idUsuario) {
        UsuarioEntity usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario responsable no encontrado"));
        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new ConflictException("No se puede asignar un usuario desactivado como responsable");
        }
        return usuario;
    }

    private void validarCatalogo(Long idCatalogo) {
        if (!catalogoRepository.existsById(idCatalogo)) {
            throw new ResourceNotFoundException("Catálogo no encontrado");
        }
    }

    private boolean coincideBusqueda(SistemaEntity s, String busqueda) {
        if (busqueda == null || busqueda.isEmpty()) return true;
        String nombre = s.getNombre() != null ? s.getNombre().toLowerCase() : "";
        String codigo = s.getCodigoUnico() != null ? s.getCodigoUnico().toLowerCase() : "";
        String q = busqueda.toLowerCase();
        return nombre.contains(q) || codigo.contains(q);
    }

    private boolean coincideTexto(String filtro, String valor) {
        if (filtro == null || filtro.isEmpty()) return true;
        return valor != null && valor.equalsIgnoreCase(filtro);
    }

    private boolean coincideEstado(String filtro, String valor) {
        if (filtro == null || filtro.isEmpty()) return true;
        if (valor == null) return false;
        return valor.equalsIgnoreCase(filtro)
                || normalizarEstadoUi(valor).equalsIgnoreCase(filtro);
    }

    private String normalizarEstadoUi(String estado) {
        if (estado == null) return "";
        return switch (estado.toUpperCase()) {
            case "BORRADOR" -> "Borrador";
            case "ENVIADO" -> "Enviado";
            case "OBSERVADO" -> "Observado";
            case "SUBSANADO" -> "Subsanado";
            case "VALIDADO", "ACTIVO" -> "Validado";
            case "RECHAZADO" -> "Rechazado";
            case "CERRADO" -> "Cerrado";
            case "PENDIENTE", "EN_REVISION", "EN_REVISIÓN" -> "Pendiente";
            default -> estado;
        };
    }

    private boolean coincideRangoFecha(String fechaDto, LocalDate desde, LocalDate hasta) {
        if (desde == null && hasta == null) return true;
        if (fechaDto == null || fechaDto.isBlank() || "N/A".equals(fechaDto)) return false;
        try {
            LocalDate fecha = LocalDate.parse(fechaDto, DATE_FORMAT);
            if (desde != null && fecha.isBefore(desde)) return false;
            if (hasta != null && fecha.isAfter(hasta)) return false;
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private LocalDate parseFecha(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return LocalDate.parse(valor);
        } catch (Exception e) {
            return null;
        }
    }

    private String resolverValorCatalogo(Long idCatalogo, String etiquetaPorDefecto) {
        if (idCatalogo == null) return etiquetaPorDefecto;
        return catalogoRepository.findById(idCatalogo)
                .map(CatalogoEntity::getValor)
                .orElse(etiquetaPorDefecto);
    }

    private String resolverNombreUsuario(Long idUsuario) {
        if (idUsuario == null) return null;
        return usuarioRepository.findById(idUsuario)
                .map(u -> ((u.getNombres() != null ? u.getNombres() : "") + " "
                        + (u.getApellidos() != null ? u.getApellidos() : "")).trim())
                .orElse(null);
    }

    private String resolverResponsable(SistemaEntity entity) {
        String funcional = resolverNombreUsuario(entity.getIdResponsableFuncional());
        if (funcional != null && !funcional.isEmpty()) return funcional;
        String tecnico = resolverNombreUsuario(entity.getIdResponsableTecnico());
        if (tecnico != null && !tecnico.isEmpty()) return tecnico;
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
        dto.setCriticidad(entity.getNivelRiesgo() != null ? entity.getNivelRiesgo() : "No definida");
        dto.setCriticidadNombre(resolverValorCatalogo(entity.getIdCriticidad(), "No especificada"));
        dto.setTipo(resolverValorCatalogo(entity.getIdTipoAplicativo(), "No especificado"));
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
        dto.setCriticidadNombre(resolverValorCatalogo(entity.getIdCriticidad(), "No especificada"));
        dto.setTipo(resolverValorCatalogo(entity.getIdTipoAplicativo(), "No especificado"));
        dto.setHeredado(Boolean.TRUE.equals(entity.getEsLegacy()));
        if (entity.getFechaActualizacion() != null) {
            dto.setFechaActualizacion(entity.getFechaActualizacion().format(DATE_FORMAT));
        } else {
            dto.setFechaActualizacion("");
        }

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

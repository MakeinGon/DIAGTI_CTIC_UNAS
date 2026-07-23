package pe.edu.unas.ctic.diagti.desarrollador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasDTO;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.desarrollador.repository.SistemaDesarrolloRepository;

import java.util.List;
import java.util.Locale;

/**
 * Lista únicamente los sistemas visibles para el usuario de Desarrollo,
 * aplica filtros y calcula las estadísticas de su bandeja.
 */
@Service
@RequiredArgsConstructor
public class MisSistemasService {
    private final SistemaDesarrolloRepository sistemaRepository;

    @Transactional(readOnly = true)
    public List<MisSistemasDTO> listarMisSistemas(MisSistemasDTO.Filter filtros) {
        String usuario = filtros == null ? null : filtros.getUsuario();
        List<SistemaEntity> sistemas = usuario == null || usuario.isBlank()
                ? sistemaRepository.findByEliminadoFalse()
                : sistemaRepository.findByPropietarioAndEliminadoFalse(usuario.trim());
        return sistemas.stream().filter(s -> aplicarFiltros(s, filtros)).map(this::convertirADTO).toList();
    }

    @Transactional(readOnly = true)
    public MisSistemasDTO obtenerSistema(Long id) {
        SistemaEntity sistema = sistemaRepository.findById(id)
                .filter(s -> !Boolean.TRUE.equals(s.getEliminado()))
                .orElseThrow(() -> new java.util.NoSuchElementException("Sistema no encontrado"));
        return convertirADTO(sistema);
    }

    @Transactional(readOnly = true)
    public MisSistemasDTO.EstadisticasDTO obtenerEstadisticas(String usuario) {
        List<SistemaEntity> sistemas = usuario == null || usuario.isBlank()
                ? sistemaRepository.findByEliminadoFalse()
                : sistemaRepository.findByPropietarioAndEliminadoFalse(usuario.trim());
        return new MisSistemasDTO.EstadisticasDTO(
                (long) sistemas.size(), contar(sistemas, "BORRADOR"), contar(sistemas, "ENVIADO"),
                contar(sistemas, "OBSERVADO"), contar(sistemas, "VALIDADO"),
                sistemas.stream().filter(s -> Boolean.TRUE.equals(s.getEsLegacy())).count(),
                sistemas.stream().filter(s -> "CRITICO".equals(normal(s.getNivelRiesgo()))
                        || "CRITICA".equals(normal(s.getCriticidad()))).count());
    }

    private long contar(List<SistemaEntity> sistemas, String estado) {
        return sistemas.stream().filter(s -> estado.equals(normal(s.getEstado()))).count();
    }

    private boolean aplicarFiltros(SistemaEntity sistema, MisSistemasDTO.Filter filtros) {
        if (filtros == null) return true;
        if (tiene(filtros.getEstado()) && !normal(sistema.getEstado()).equals(normal(filtros.getEstado()))) return false;
        if (tiene(filtros.getArea()) && !normal(sistema.getAreaUsuaria()).contains(normal(filtros.getArea()))) return false;
        if (tiene(filtros.getTipo()) && !normal(sistema.getTipoAplicativo()).equals(normal(filtros.getTipo()))) return false;
        if (tiene(filtros.getCriticidad()) && !normal(sistema.getCriticidad()).equals(normal(filtros.getCriticidad()))) return false;
        if (tiene(filtros.getBusqueda())) {
            String texto = normal(sistema.getCodigo() + " " + sistema.getNombre() + " " + sistema.getDescripcion());
            if (!texto.contains(normal(filtros.getBusqueda()))) return false;
        }
        return true;
    }

    private MisSistemasDTO convertirADTO(SistemaEntity sistema) {
        MisSistemasDTO dto = new MisSistemasDTO();
        dto.setId(sistema.getId());
        dto.setCodigo(sistema.getCodigo());
        dto.setNombre(sistema.getNombre());
        dto.setDescripcion(sistema.getDescripcion());
        dto.setEstado(sistema.getEstado());
        dto.setTipoAplicativo(sistema.getTipoAplicativo());
        dto.setAreaUsuaria(sistema.getAreaUsuaria());
        dto.setCriticidad(sistema.getCriticidad());
        dto.setNivelRiesgo(sistema.getNivelRiesgo());
        dto.setPuntajeRiesgo(sistema.getPuntajeRiesgo());
        dto.setEsLegacy(sistema.getEsLegacy());
        dto.setFechaActualizacion(sistema.getFechaActualizacion());
        List<ValidacionEntity> validaciones = sistema.getValidaciones();
        ValidacionEntity ultima = validaciones == null ? null : validaciones.stream()
                .filter(v -> Boolean.TRUE.equals(v.getEsUltima())).findFirst().orElse(null);
        dto.setUltimaValidacion(ultima == null ? null : ultima.getEstadoValidacion());
        dto.setCantidadEvidencias(sistema.getEvidencias() == null ? 0 : (int) sistema.getEvidencias().stream()
                .filter(e -> !Boolean.TRUE.equals(e.getEliminado())).count());
        String estado = normal(sistema.getEstado());
        dto.setPuedeEditar(List.of("BORRADOR", "OBSERVADO", "SUBSANADO", "CORREGIDO").contains(estado));
        dto.setPuedeEnviar(List.of("BORRADOR", "SUBSANADO", "CORREGIDO").contains(estado));
        return dto;
    }

    private boolean tiene(String valor) { return valor != null && !valor.isBlank(); }
    private String normal(String valor) { return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT); }
}

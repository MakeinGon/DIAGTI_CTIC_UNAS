package pe.edu.unas.ctic.diagti.desarrollador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.MisSistemasFilterDTO;
import pe.edu.unas.ctic.diagti.desarrollador.dto.frontend.SistemaFrontendDTO;
import pe.edu.unas.ctic.diagti.desarrollador.service.DesarrolladorInventarioService;
import pe.edu.unas.ctic.diagti.desarrollador.service.MisSistemasService;
import pe.edu.unas.ctic.diagti.desarrollador.support.DesarrolladorUsuarioResolver;
import pe.edu.unas.ctic.diagti.desarrollador.support.EstadoFlujoNormalizer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MisSistemasServiceImpl implements MisSistemasService {

    private final DesarrolladorInventarioService inventarioService;
    private final DesarrolladorUsuarioResolver usuarioResolver;

    /**
     * Listado oficial. Requiere username en filtros.busqueda? No:
     * se usa thread-local via filtro extendido — el controller pasa username.
     */
    private final ThreadLocal<String> usernameHolder = new ThreadLocal<>();

    public void setUsernameContexto(String username) {
        usernameHolder.set(username);
    }

    public void clearUsernameContexto() {
        usernameHolder.remove();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MisSistemasDTO> listarMisSistemas(MisSistemasFilterDTO filtros) {
        String username = usernameHolder.get();
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }

        Map<String, String> map = new HashMap<>();
        if (filtros != null) {
            if (filtros.getEstado() != null) map.put("estado", filtros.getEstado());
            if (filtros.getBusqueda() != null) map.put("busqueda", filtros.getBusqueda());
            if (filtros.getCriticidad() != null) map.put("riesgo", filtros.getCriticidad());
        }

        return inventarioService.listarSistemasDelDesarrollador(username, map).stream()
                .map(this::toMisSistemasDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MisSistemasDTO obtenerSistema(Long id) {
        String username = usernameHolder.get();
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return toMisSistemasDto(inventarioService.obtenerSistemaDelDesarrollador(username, id));
    }

    @Override
    @Transactional(readOnly = true)
    public MisSistemasDTO.EstadisticasDTO obtenerEstadisticas() {
        String username = usernameHolder.get();
        Usuario desarrollador = usuarioResolver.requireActiveDeveloper(username);
        List<SistemaFrontendDTO> sistemas = inventarioService.listarSistemasDelDesarrollador(
                desarrollador.getUsername(), Map.of());

        long total = sistemas.size();
        long borrador = sistemas.stream().filter(s -> "Borrador".equalsIgnoreCase(s.getEstado())).count();
        long enviado = sistemas.stream().filter(s -> "Enviado".equalsIgnoreCase(s.getEstado())).count();
        long observado = sistemas.stream().filter(s -> "Observado".equalsIgnoreCase(s.getEstado())).count();
        long validado = sistemas.stream().filter(s -> "Validado".equalsIgnoreCase(s.getEstado())).count();

        return new MisSistemasDTO.EstadisticasDTO(total, borrador, enviado, observado, validado, 0L, 0L);
    }

    private MisSistemasDTO toMisSistemasDto(SistemaFrontendDTO src) {
        MisSistemasDTO dto = new MisSistemasDTO();
        try {
            dto.setId(src.getId() != null ? Long.parseLong(src.getId()) : null);
        } catch (NumberFormatException ex) {
            dto.setId(null);
        }
        dto.setCodigo(src.getCodigo());
        dto.setNombre(src.getNombre());
        dto.setDescripcion(src.getDescripcion());
        dto.setTipoAplicativo(src.getTipo());
        dto.setAreaUsuaria(src.getArea());
        dto.setEstado(EstadoFlujoNormalizer.toBd(src.getEstado()));
        dto.setCriticidad(src.getCriticidad());
        dto.setNivelRiesgo(src.getRiesgo());
        dto.setPuedeEditar("BORRADOR".equals(dto.getEstado()) || "OBSERVADO".equals(dto.getEstado()) || "SUBSANADO".equals(dto.getEstado()));
        dto.setPuedeEnviar("BORRADOR".equals(dto.getEstado()) || "SUBSANADO".equals(dto.getEstado()));
        dto.setCantidadEvidencias(src.getEvidencias() != null ? src.getEvidencias().size() : 0);
        return dto;
    }
}

package pe.edu.unas.ctic.diagti.infraestructura.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.infraestructura.dto.HistorialDTO;
import pe.edu.unas.ctic.diagti.infraestructura.entity.HistorialInfraestructura;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Sistema;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Usuario;
import pe.edu.unas.ctic.diagti.infraestructura.repository.HistorialInfraestructuraRepository;
import pe.edu.unas.ctic.diagti.infraestructura.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HistorialService {

    private final HistorialInfraestructuraRepository historialRepository;
    private final UsuarioRepository usuarioRepository;

    /** Usuario que actúa por defecto en este módulo mientras no exista login (RF-01 pertenece a otra rama). */
    public static final String USUARIO_ACTOR_DEFAULT = "crojas";
    public static final String USUARIO_VALIDADOR_DEFAULT = "vctic";

    @Transactional
    public void registrar(Sistema sistema, String accion, String seccion, String detalle,
                           String estadoResultante, String valorAnterior, String valorNuevo, String username) {
        HistorialInfraestructura h = new HistorialInfraestructura();
        h.setSistema(sistema);
        h.setAccion(accion);
        h.setSeccion(seccion);
        h.setDetalle(detalle);
        h.setEstadoResultante(estadoResultante);
        h.setValorAnterior(valorAnterior);
        h.setValorNuevo(valorNuevo);
        usuarioRepository.findByUsername(username).ifPresent(u -> h.setIdUsuario(u.getIdUsuario()));
        historialRepository.save(h);
    }

    @Transactional(readOnly = true)
    public List<HistorialDTO> listar(String q, String codigoSistema, String accion, String estado,
                                      LocalDate desde, LocalDate hasta) {
        String query = q == null ? "" : q.trim().toLowerCase();

        return historialRepository.findAllByOrderByFechaEventoDesc().stream()
                .map(this::toDTO)
                .filter(h -> codigoSistema == null || codigoSistema.isBlank() || codigoSistema.equals(h.getCode()))
                .filter(h -> accion == null || accion.isBlank() || accion.equalsIgnoreCase(h.getAction()))
                .filter(h -> estado == null || estado.isBlank() || estado.equalsIgnoreCase(h.getState()))
                .filter(h -> desde == null || !LocalDate.parse(h.getDate().substring(0, 10)).isBefore(desde))
                .filter(h -> hasta == null || !LocalDate.parse(h.getDate().substring(0, 10)).isAfter(hasta))
                .filter(h -> query.isEmpty() || matches(h, query))
                .toList();
    }

    private boolean matches(HistorialDTO h, String query) {
        String haystack = String.join(" ",
                nullToEmpty(h.getCode()), nullToEmpty(h.getName()), nullToEmpty(h.getAction()),
                nullToEmpty(h.getDetail()), nullToEmpty(h.getUser()), nullToEmpty(h.getState())).toLowerCase();
        return haystack.contains(query);
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private HistorialDTO toDTO(HistorialInfraestructura h) {
        Optional<Usuario> usuario = h.getIdUsuario() == null ? Optional.empty() : usuarioRepository.findById(h.getIdUsuario());
        return HistorialDTO.builder()
                .id("h" + h.getIdHistorial())
                .date(h.getFechaEvento().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .code(h.getSistema().getCodigoUnico())
                .name(h.getSistema().getNombre())
                .action(h.getAccion())
                .detail(h.getDetalle())
                .user(usuario.map(Usuario::getNombreCompleto).orElse("Sistema"))
                .state(h.getEstadoResultante())
                .section(h.getSeccion())
                .before(h.getValorAnterior())
                .after(h.getValorNuevo())
                .build();
    }
}

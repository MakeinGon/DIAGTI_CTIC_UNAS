package pe.edu.unas.ctic.diagti.administrador.support;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.AuditoriaRepository;

/**
 * Registra eventos administrativos en la tabla oficial {@code auditoria}.
 * Solo se usa en operaciones de escritura (nunca en GET).
 */
@Component
@RequiredArgsConstructor
public class AdminAuditoriaWriter {

    public static final String MODULO = "Administrador";

    private final AuditoriaRepository auditoriaRepository;

    public void registrar(String accion, String descripcion) {
        AuditoriaEntity evento = new AuditoriaEntity();
        evento.setModulo(MODULO);
        evento.setAccion(accion);
        evento.setDescripcion(descripcion);
        auditoriaRepository.save(evento);
    }

    public void registrar(Long idUsuario, String accion, String descripcion) {
        AuditoriaEntity evento = new AuditoriaEntity();
        evento.setIdUsuario(idUsuario);
        evento.setModulo(MODULO);
        evento.setAccion(accion);
        evento.setDescripcion(descripcion);
        auditoriaRepository.save(evento);
    }
}

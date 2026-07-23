package pe.edu.unas.ctic.diagti.director.support;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import pe.edu.unas.ctic.diagti.Login.repository.LoginUsuarioRepository;

@Component
@RequiredArgsConstructor
public class DirectorCatalogHelper {

    private final CatalogoRepository catalogoRepository;
    private final LoginUsuarioRepository usuarioRepository;

    public String valorCatalogo(Long id) {
        if (id == null) {
            return "No especificada";
        }
        return catalogoRepository.findById(id)
                .map(CatalogoEntity::getValor)
                .filter(v -> v != null && !v.isBlank())
                .orElse("No especificada");
    }

    public String nombreUsuario(Long id) {
        if (id == null) {
            return "No asignado";
        }
        return usuarioRepository.findById(id)
                .map(this::formatoNombre)
                .orElse("No asignado");
    }

    private String formatoNombre(Usuario u) {
        String nombres = DirectorTexto.safe(u.getNombres());
        String apellidos = DirectorTexto.safe(u.getApellidos());
        String full = (nombres + " " + apellidos).trim();
        return full.isEmpty() ? DirectorTexto.safe(u.getUsername()) : full;
    }
}

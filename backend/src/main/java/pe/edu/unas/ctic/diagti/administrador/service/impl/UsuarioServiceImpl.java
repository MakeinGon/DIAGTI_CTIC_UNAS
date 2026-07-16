package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import pe.edu.unas.ctic.diagti.administrador.mapper.UsuarioMapper;
import pe.edu.unas.ctic.diagti.administrador.repository.RolRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.UsuarioService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> listar(String search, Long rolId, Boolean estado, String origen) {
        Specification<UsuarioEntity> spec = buildSpecification(search, rolId, estado, origen);
        return usuarioRepository.findAll(spec)
                .stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    private Specification<UsuarioEntity> buildSpecification(String search, Long rolId, Boolean estado, String origen) {
        Specification<UsuarioEntity> spec = (root, query, cb) -> cb.conjunction(); // empieza con condición siempre verdadera

        if (search != null && !search.isEmpty()) {
            spec = spec.and(UsuarioSpecification.search(search));
        }
        if (rolId != null) {
            spec = spec.and(UsuarioSpecification.rolEquals(rolId));
        }
        if (estado != null) {
            spec = spec.and(UsuarioSpecification.estadoEquals(estado));
        }
        if (origen != null && !origen.isEmpty()) {
            spec = spec.and(UsuarioSpecification.origenEquals(origen));
        }
        return spec;
    }

    @Override
    @Transactional
    public UsuarioDTO crear(UsuarioDTO dto, Long rolId) {
        // Validaciones
        if (dto.getNombreCompleto() == null || dto.getNombreCompleto().isBlank()) {
            throw new RuntimeException("El nombre completo es obligatorio");
        }
        if (dto.getCorreo() == null || dto.getCorreo().isBlank()) {
            throw new RuntimeException("El correo es obligatorio");
        }
        if (dto.getDni() != null && usuarioRepository.existsByDni(dto.getDni())) {
            throw new RuntimeException("DNI ya registrado");
        }
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("Correo ya registrado");
        }

        RolEntity rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        UsuarioEntity entity = new UsuarioEntity();
        entity.setDni(dto.getDni());
        // Asumiendo que el DTO tiene nombre completo, se separa (ajusta según tu frontend)
        String[] nombreApellido = dto.getNombreCompleto().split(" ", 2);
        entity.setNombres(nombreApellido[0]);
        entity.setApellidos(nombreApellido.length > 1 ? nombreApellido[1] : "");
        entity.setCorreo(dto.getCorreo());
        entity.setUsername(dto.getCorreo().split("@")[0]);
        entity.setArea(dto.getArea());
        entity.setOrigen(dto.getOrigen() != null ? dto.getOrigen() : "LDAP");
        entity.setEstado("Activo".equals(dto.getEstado()));
        entity.getRoles().add(rol);

        entity = usuarioRepository.save(entity);
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO actualizar(String dni, UsuarioDTO dto, Long rolId) {
        UsuarioEntity entity = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (dto.getNombreCompleto() == null || dto.getNombreCompleto().isBlank()) {
            throw new RuntimeException("El nombre completo es obligatorio");
        }
        if (dto.getCorreo() == null || dto.getCorreo().isBlank()) {
            throw new RuntimeException("El correo es obligatorio");
        }
        if (!dto.getCorreo().equalsIgnoreCase(entity.getCorreo())
                && usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("Correo ya registrado por otro usuario");
        }

        // Actualizar nombre y apellido a partir del "nombre completo" del formulario
        String[] nombreApellido = dto.getNombreCompleto().trim().split(" ", 2);
        entity.setNombres(nombreApellido[0]);
        entity.setApellidos(nombreApellido.length > 1 ? nombreApellido[1] : "");

        // Actualizar campos básicos (no se actualiza DNI)
        entity.setCorreo(dto.getCorreo());
        entity.setArea(dto.getArea());
        entity.setOrigen(dto.getOrigen());
        entity.setEstado("Activo".equals(dto.getEstado()));

        // Actualizar rol: eliminar todos y agregar el nuevo
        entity.getRoles().clear();
        RolEntity rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        entity.getRoles().add(rol);

        entity = usuarioRepository.save(entity);
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public void eliminar(String dni) {
        UsuarioEntity entity = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        // Se limpia la tabla puente usuarios_roles explicitamente antes de
        // borrar: no depende de que la FK de la base de datos tenga
        // ON DELETE CASCADE correctamente configurado.
        usuarioRepository.desasignarRolesDelUsuario(entity.getIdUsuario());
        usuarioRepository.delete(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO cambiarEstado(String dni, boolean estado) {
        UsuarioEntity entity = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        entity.setEstado(estado);
        entity = usuarioRepository.save(entity);
        return mapper.toDTO(entity);
    }
}
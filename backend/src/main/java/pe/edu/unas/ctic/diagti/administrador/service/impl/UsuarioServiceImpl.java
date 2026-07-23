package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import pe.edu.unas.ctic.diagti.administrador.mapper.UsuarioMapper;
import pe.edu.unas.ctic.diagti.administrador.repository.RolRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.UsuarioService;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioMapper mapper;
    private final PasswordEncoder passwordEncoder;

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
        validarDatosBasicos(dto);
        String dni = dto.getDni().trim();
        String password = dto.getPassword();
        if (password == null || password.length() < 6) {
            throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
        }
        if (usuarioRepository.existsByDni(dni)) {
            throw new RuntimeException("DNI ya registrado");
        }
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("Correo ya registrado");
        }
        if (usuarioRepository.existsByUsername(dni)) {
            throw new RuntimeException("El DNI ya está siendo utilizado como usuario");
        }

        RolEntity rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        validarAreaRol(dto.getArea(), rol.getNombre());

        UsuarioEntity entity = new UsuarioEntity();
        entity.setDni(dni);
        String[] nombreApellido = dto.getNombreCompleto().trim().split(" ", 2);
        entity.setNombres(nombreApellido[0]);
        entity.setApellidos(nombreApellido.length > 1 ? nombreApellido[1] : "");
        entity.setCorreo(dto.getCorreo().trim());
        // El login del sistema usa el DNI como nombre de usuario.
        entity.setUsername(dni);
        entity.setPasswordHash(passwordEncoder.encode(password));
        entity.setArea(dto.getArea());
        entity.setOrigen(valorO(dto.getOrigen(), "Local"));
        entity.setEstado(!"Inactivo".equalsIgnoreCase(dto.getEstado()));
        entity.getRoles().add(rol);

        entity = usuarioRepository.save(entity);
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO actualizar(String dni, UsuarioDTO dto, Long rolId) {
        UsuarioEntity entity = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validarDatosBasicos(dto);
        if (!dto.getCorreo().equalsIgnoreCase(entity.getCorreo())
                && usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("Correo ya registrado por otro usuario");
        }
        if (!dni.equalsIgnoreCase(entity.getUsername()) && usuarioRepository.existsByUsername(dni)) {
            throw new RuntimeException("El DNI ya está siendo utilizado como usuario");
        }

        String[] nombreApellido = dto.getNombreCompleto().trim().split(" ", 2);
        entity.setNombres(nombreApellido[0]);
        entity.setApellidos(nombreApellido.length > 1 ? nombreApellido[1] : "");

        entity.setCorreo(dto.getCorreo().trim());
        entity.setUsername(dni);
        entity.setArea(dto.getArea());
        entity.setOrigen(valorO(dto.getOrigen(), "Local"));
        entity.setEstado(!"Inactivo".equalsIgnoreCase(dto.getEstado()));
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6) {
                throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
            }
            entity.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        entity.getRoles().clear();
        RolEntity rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        validarAreaRol(dto.getArea(), rol.getNombre());
        entity.getRoles().add(rol);

        entity = usuarioRepository.save(entity);
        return mapper.toDTO(entity);
    }

    private void validarDatosBasicos(UsuarioDTO dto) {
        if (dto.getDni() == null || !dto.getDni().trim().matches("\\d{8}")) {
            throw new RuntimeException("El DNI debe tener exactamente 8 dígitos");
        }
        if (dto.getNombreCompleto() == null || dto.getNombreCompleto().isBlank()) {
            throw new RuntimeException("El nombre completo es obligatorio");
        }
        if (dto.getCorreo() == null || dto.getCorreo().isBlank()) {
            throw new RuntimeException("El correo es obligatorio");
        }
    }

    private String valorO(String valor, String defecto) {
        return valor == null || valor.isBlank() ? defecto : valor.trim();
    }

    /**
     * El área define la información visible y el rol define las acciones.
     * Evita cuentas incoherentes, por ejemplo Infraestructura con rol desarrollo.
     */
    private void validarAreaRol(String area, String rol) {
        String areaNormal = normalizar(area);
        String rolNormal = normalizar(rol);
        Set<String> permitidos;
        if (areaNormal.contains("desarrollo")) {
            permitidos = Set.of("desarrollo", "desarrollador", "area de desarrollo");
        } else if (areaNormal.contains("infraestructura")) {
            permitidos = Set.of("infraestructura", "area de infraestructura");
        } else if (areaNormal.contains("direccion academica")) {
            permitidos = Set.of("funcional", "responsable funcional");
        } else if (areaNormal.contains("control interno")) {
            permitidos = Set.of("validacion", "validador", "validador tecnico",
                    "validador ctic", "auditor");
        } else if (areaNormal.contains("rectorado")) {
            permitidos = Set.of("directivo");
        } else if (areaNormal.contains("administracion")) {
            permitidos = Set.of("admin", "administrador", "administrador ctic");
        } else {
            throw new RuntimeException("El área seleccionada no está configurada");
        }
        if (!permitidos.contains(rolNormal)) {
            throw new RuntimeException("El rol '" + rol + "' no corresponde al área '" + area + "'");
        }
    }

    private String normalizar(String valor) {
        if (valor == null) return "";
        String sinTildes = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return sinTildes.toLowerCase(Locale.ROOT)
                .replace('–', '-')
                .replaceAll("\\s+", " ")
                .trim();
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

package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.RestablecerPasswordRequestDTO;
import pe.edu.unas.ctic.diagti.administrador.dto.UsuarioDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import pe.edu.unas.ctic.diagti.administrador.mapper.UsuarioMapper;
import pe.edu.unas.ctic.diagti.administrador.repository.RolRepository;
import pe.edu.unas.ctic.diagti.administrador.repository.UsuarioRepository;
import pe.edu.unas.ctic.diagti.administrador.service.UsuarioService;
import pe.edu.unas.ctic.diagti.administrador.support.AdminAuditoriaWriter;
import pe.edu.unas.ctic.diagti.administrador.support.PasswordPolicyValidator;
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioMapper mapper;
    private final AdminAuditoriaWriter auditoriaWriter;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> listar(String search, Long rolId, Boolean estado, String origen) {
        Specification<UsuarioEntity> spec = buildSpecification(search, rolId, estado, origen);
        return usuarioRepository.findAll(spec)
                .stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO obtenerPorDni(String dni) {
        return mapper.toDTO(buscarPorDni(dni));
    }

    private Specification<UsuarioEntity> buildSpecification(String search, Long rolId, Boolean estado, String origen) {
        Specification<UsuarioEntity> spec = (root, query, cb) -> cb.conjunction();

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
        if (dto.getDni() == null || dto.getDni().isBlank()) {
            throw new IllegalArgumentException("El DNI es obligatorio");
        }
        if (!dto.getDni().matches("\\d{8}")) {
            throw new IllegalArgumentException("El DNI debe tener exactamente 8 dígitos numéricos");
        }
        if (usuarioRepository.existsByDni(dto.getDni())) {
            throw new ConflictException("DNI ya registrado");
        }
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new ConflictException("Correo ya registrado");
        }

        String username = resolverUsername(dto);
        if (usuarioRepository.existsByUsername(username)) {
            throw new ConflictException("Username ya registrado");
        }

        String origen = normalizarOrigen(dto.getOrigen());
        validarArea(dto.getArea());

        RolEntity rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        UsuarioEntity entity = new UsuarioEntity();
        entity.setDni(dto.getDni());
        aplicarNombre(entity, dto);
        entity.setCorreo(dto.getCorreo().trim());
        entity.setUsername(username);
        entity.setArea(dto.getArea() != null ? dto.getArea().trim() : null);
        entity.setOrigen(origen);
        entity.setEstado(dto.getEstado() == null || "Activo".equalsIgnoreCase(dto.getEstado())
                || "ACTIVO".equalsIgnoreCase(dto.getEstado()));

        if ("Local".equals(origen)) {
            String errorPwd = PasswordPolicyValidator.validar(dto.getPassword(), dto.getConfirmPassword(), dto.getDni());
            if (errorPwd != null) {
                throw new IllegalArgumentException(errorPwd);
            }
            entity.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        } else {
            // LDAP: no se almacena contraseña local (ni vacía ni enviada por error).
            entity.setPasswordHash(null);
        }

        entity.getRoles().add(rol);

        entity = usuarioRepository.save(entity);
        auditoriaWriter.registrar(entity.getIdUsuario(), "usuario creado",
                "Usuario creado: " + entity.getUsername() + " (" + entity.getCorreo() + ")");
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO actualizar(String dni, UsuarioDTO dto, Long rolId) {
        UsuarioEntity entity = buscarPorDni(dni);
        validarDatosBasicos(dto);

        if (!dto.getCorreo().equalsIgnoreCase(entity.getCorreo())
                && usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new ConflictException("Correo ya registrado por otro usuario");
        }

        String passwordHashPrevio = entity.getPasswordHash();

        aplicarNombre(entity, dto);
        entity.setCorreo(dto.getCorreo().trim());
        entity.setArea(dto.getArea() != null ? dto.getArea().trim() : entity.getArea());
        if (dto.getOrigen() != null && !dto.getOrigen().isBlank()) {
            entity.setOrigen(normalizarOrigen(dto.getOrigen()));
        }
        if (dto.getEstado() != null) {
            entity.setEstado("Activo".equalsIgnoreCase(dto.getEstado())
                    || "ACTIVO".equalsIgnoreCase(dto.getEstado()));
        }

        // Edición NUNCA cambia la contraseña (aunque el cliente envíe password vacía).
        entity.setPasswordHash(passwordHashPrevio);

        if (rolId != null) {
            RolEntity rol = rolRepository.findById(rolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
            entity.getRoles().clear();
            entity.getRoles().add(rol);
        }

        entity = usuarioRepository.save(entity);
        auditoriaWriter.registrar(entity.getIdUsuario(), "usuario actualizado",
                "Usuario actualizado: " + entity.getUsername());
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO restablecerPassword(String dni, RestablecerPasswordRequestDTO request) {
        UsuarioEntity entity = buscarPorDni(dni);
        if (!esOrigenLocal(entity.getOrigen())) {
            throw new IllegalArgumentException(
                    "Solo las cuentas Local pueden restablecer contraseña local");
        }
        String errorPwd = PasswordPolicyValidator.validar(
                request != null ? request.getPassword() : null,
                request != null ? request.getConfirmPassword() : null,
                entity.getDni());
        if (errorPwd != null) {
            throw new IllegalArgumentException(errorPwd);
        }
        entity.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        entity = usuarioRepository.save(entity);
        auditoriaWriter.registrar(entity.getIdUsuario(), "contraseña restablecida",
                "Contraseña local restablecida para usuario " + entity.getUsername());
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO desactivar(String dni) {
        UsuarioEntity entity = buscarPorDni(dni);
        entity.setEstado(false);
        entity = usuarioRepository.save(entity);
        auditoriaWriter.registrar(entity.getIdUsuario(), "usuario desactivado",
                "Usuario desactivado (soft-delete): " + entity.getUsername());
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO cambiarEstado(String dni, boolean estado) {
        UsuarioEntity entity = buscarPorDni(dni);
        entity.setEstado(estado);
        entity = usuarioRepository.save(entity);
        String accion = estado ? "usuario activado" : "usuario desactivado";
        auditoriaWriter.registrar(entity.getIdUsuario(), accion,
                "Cambio de estado de " + entity.getUsername() + " a " + (estado ? "Activo" : "Inactivo"));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO asignarRol(String dni, Long rolId) {
        UsuarioEntity entity = buscarPorDni(dni);
        RolEntity rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
        boolean yaAsignado = entity.getRoles().stream()
                .anyMatch(r -> r.getIdRol().equals(rolId));
        if (yaAsignado) {
            return mapper.toDTO(entity); // idempotente
        }
        entity.getRoles().add(rol);
        entity = usuarioRepository.save(entity);
        auditoriaWriter.registrar(entity.getIdUsuario(), "rol asignado",
                "Rol '" + rol.getNombre() + "' asignado a " + entity.getUsername());
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public UsuarioDTO retirarRol(String dni, Long rolId) {
        UsuarioEntity entity = buscarPorDni(dni);
        RolEntity rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
        boolean removed = entity.getRoles().removeIf(r -> r.getIdRol().equals(rolId));
        if (!removed) {
            return mapper.toDTO(entity); // idempotente
        }
        entity = usuarioRepository.save(entity);
        auditoriaWriter.registrar(entity.getIdUsuario(), "rol retirado",
                "Rol '" + rol.getNombre() + "' retirado de " + entity.getUsername());
        return mapper.toDTO(entity);
    }

    private UsuarioEntity buscarPorDni(String dni) {
        return usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private void validarDatosBasicos(UsuarioDTO dto) {
        if (dto.getNombreCompleto() == null || dto.getNombreCompleto().isBlank()) {
            if ((dto.getNombres() == null || dto.getNombres().isBlank())
                    && (dto.getApellidos() == null || dto.getApellidos().isBlank())) {
                throw new IllegalArgumentException("El nombre completo es obligatorio");
            }
        }
        if (dto.getCorreo() == null || dto.getCorreo().isBlank()) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }
        if (!dto.getCorreo().contains("@")) {
            throw new IllegalArgumentException("El correo no es válido");
        }
    }

    private void validarArea(String area) {
        if (area == null || area.isBlank()) {
            throw new IllegalArgumentException("El área es obligatoria");
        }
    }

    /**
     * Normaliza a valores canónicos del sistema: Local | LDAP.
     * Acepta alias LOCAL / local / ldap.
     */
    private String normalizarOrigen(String origen) {
        if (origen == null || origen.isBlank()) {
            throw new IllegalArgumentException("El origen de cuenta es obligatorio");
        }
        String o = origen.trim();
        if ("LOCAL".equalsIgnoreCase(o) || "Local".equalsIgnoreCase(o)) {
            return "Local";
        }
        if ("LDAP".equalsIgnoreCase(o)) {
            return "LDAP";
        }
        throw new IllegalArgumentException("Origen inválido. Use LOCAL o LDAP");
    }

    private boolean esOrigenLocal(String origen) {
        return origen != null && "Local".equalsIgnoreCase(origen.trim());
    }

    private void aplicarNombre(UsuarioEntity entity, UsuarioDTO dto) {
        if (dto.getNombres() != null && !dto.getNombres().isBlank()) {
            entity.setNombres(dto.getNombres().trim());
            entity.setApellidos(dto.getApellidos() != null ? dto.getApellidos().trim() : "");
            return;
        }
        String[] partes = dto.getNombreCompleto().trim().split("\\s+", 2);
        entity.setNombres(partes[0]);
        entity.setApellidos(partes.length > 1 ? partes[1] : "");
    }

    /**
     * Convención del seed oficial: username = DNI.
     * Si no hay DNI, se usa la parte local del correo.
     */
    private String resolverUsername(UsuarioDTO dto) {
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            return dto.getUsername().trim();
        }
        if (dto.getDni() != null && !dto.getDni().isBlank()) {
            return dto.getDni().trim();
        }
        return dto.getCorreo().split("@")[0].trim();
    }
}

package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.RolDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.RolRepository;
import pe.edu.unas.ctic.diagti.administrador.service.RolService;
import pe.edu.unas.ctic.diagti.administrador.support.AdminAuditoriaWriter;
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolServiceImpl implements RolService {

    private final RolRepository repository;
    private final AdminAuditoriaWriter auditoriaWriter;

    @Override
    @Transactional(readOnly = true)
    public List<RolDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RolDTO crear(RolDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del rol es obligatorio");
        }
        if (repository.existsByNombre(dto.getNombre().trim())) {
            throw new ConflictException("Ya existe un rol con ese nombre");
        }
        RolEntity entity = new RolEntity();
        entity.setNombre(dto.getNombre().trim());
        entity.setDescripcion(dto.getDescripcion());
        entity.setEstado(dto.getEstado() == null || "Activo".equalsIgnoreCase(dto.getEstado()));
        entity = repository.save(entity);
        auditoriaWriter.registrar("rol creado", "Rol creado: " + entity.getNombre());
        return toDTO(entity);
    }

    @Override
    @Transactional
    public RolDTO actualizar(Long id, RolDTO dto) {
        RolEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            String nuevoNombre = dto.getNombre().trim();
            if (!nuevoNombre.equalsIgnoreCase(entity.getNombre()) && repository.existsByNombre(nuevoNombre)) {
                throw new ConflictException("Ya existe un rol con ese nombre");
            }
            entity.setNombre(nuevoNombre);
        }
        entity.setDescripcion(dto.getDescripcion());
        if (dto.getEstado() != null) {
            entity.setEstado("Activo".equalsIgnoreCase(dto.getEstado()));
        }
        entity = repository.save(entity);
        auditoriaWriter.registrar("rol actualizado", "Rol actualizado: " + entity.getNombre());
        return toDTO(entity);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        RolEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
        // Soft-delete: desactiva sin borrar asignaciones ni el rol.
        entity.setEstado(false);
        repository.save(entity);
        auditoriaWriter.registrar("rol desactivado", "Rol desactivado: " + entity.getNombre());
    }

    @Override
    @Transactional(readOnly = true)
    public RolDTO obtenerPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
    }

    private RolDTO toDTO(RolEntity entity) {
        RolDTO dto = new RolDTO();
        dto.setId(entity.getIdRol());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(Boolean.TRUE.equals(entity.getEstado()) ? "Activo" : "Inactivo");
        dto.setCantidadUsuarios((int) repository.contarUsuariosPorRol(entity.getIdRol()));
        return dto;
    }
}

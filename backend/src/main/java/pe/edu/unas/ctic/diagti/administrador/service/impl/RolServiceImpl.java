package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.RolDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.RolRepository;
import pe.edu.unas.ctic.diagti.administrador.service.RolService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolServiceImpl implements RolService {

    private final RolRepository repository;

    @Override
    public List<RolDTO> listar() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RolDTO crear(RolDTO dto) {
        if (repository.existsByNombre(dto.getNombre())) {
            throw new RuntimeException("Ya existe un rol con ese nombre");
        }
        RolEntity entity = new RolEntity();
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setEstado("Activo".equals(dto.getEstado()));
        entity = repository.save(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    public RolDTO actualizar(Long id, RolDTO dto) {
        RolEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setEstado("Activo".equals(dto.getEstado()));
        entity = repository.save(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (repository.existsUsuariosByRolId(id)) {
            throw new RuntimeException("No se puede eliminar el rol porque tiene usuarios asignados");
        }
        repository.deleteById(id);
    }

    @Override
    public RolDTO obtenerPorId(Long id) {
        return repository.findById(id).map(this::toDTO).orElse(null);
    }

    private RolDTO toDTO(RolEntity entity) {
        RolDTO dto = new RolDTO();
        dto.setId(entity.getIdRol());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado() ? "Activo" : "Inactivo");
        dto.setCantidadUsuarios(entity.getUsuarios().size());
        return dto;
    }
}
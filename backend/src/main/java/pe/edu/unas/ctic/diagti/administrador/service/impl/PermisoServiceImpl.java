package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.PermisoDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.PermisoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.PermisoRepository;
import pe.edu.unas.ctic.diagti.administrador.service.PermisoService;
import pe.edu.unas.ctic.diagti.administrador.support.AdminAuditoriaWriter;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermisoServiceImpl implements PermisoService {

    private final PermisoRepository repository;
    private final AdminAuditoriaWriter auditoriaWriter;

    @Override
    @Transactional(readOnly = true)
    public List<PermisoDTO> obtenerPorRol(Long rolId) {
        return repository.findByIdRol(rolId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void actualizarPermisos(Long rolId, List<PermisoDTO> permisos) {
        repository.deleteByIdRol(rolId);
        for (PermisoDTO dto : permisos) {
            PermisoEntity entity = new PermisoEntity();
            entity.setIdRol(rolId);
            entity.setModulo(dto.getModulo());
            entity.setVer(dto.getVer());
            entity.setCrear(dto.getCrear());
            entity.setEditar(dto.getEditar());
            entity.setEliminar(dto.getEliminar());
            entity.setValidar(dto.getValidar());
            entity.setExportar(dto.getExportar());
            repository.save(entity);
        }
        auditoriaWriter.registrar("permisos actualizados",
                "Permisos actualizados para rol id=" + rolId);
    }

    private PermisoDTO toDTO(PermisoEntity entity) {
        PermisoDTO dto = new PermisoDTO();
        dto.setModulo(entity.getModulo());
        dto.setVer(entity.getVer());
        dto.setCrear(entity.getCrear());
        dto.setEditar(entity.getEditar());
        dto.setEliminar(entity.getEliminar());
        dto.setValidar(entity.getValidar());
        dto.setExportar(entity.getExportar());
        return dto;
    }
}
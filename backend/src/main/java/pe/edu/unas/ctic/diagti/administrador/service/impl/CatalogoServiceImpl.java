package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.CatalogoDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.mapper.CatalogoMapper;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.administrador.service.CatalogoService;
import pe.edu.unas.ctic.diagti.administrador.support.AdminAuditoriaWriter;
import pe.edu.unas.ctic.diagti.common.exception.ConflictException;
import pe.edu.unas.ctic.diagti.common.exception.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogoServiceImpl implements CatalogoService {

    private final CatalogoRepository repository;
    private final CatalogoMapper mapper;
    private final AdminAuditoriaWriter auditoriaWriter;

    @Override
    @Transactional(readOnly = true)
    public List<CatalogoDTO> listarTodos() {
        return repository.findAllByOrderByTipoCatalogoAscOrdenAsc()
                .stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogoDTO> listarPorTipo(String tipo) {
        return repository.findByTipoCatalogoOrderByOrdenAsc(tipo)
                .stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CatalogoDTO crear(String tipo, CatalogoDTO dto) {
        if (dto.getCodigo() == null || dto.getCodigo().isBlank()) {
            throw new IllegalArgumentException("El código del catálogo es obligatorio");
        }
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del catálogo es obligatorio");
        }
        String codigo = dto.getCodigo().trim().toUpperCase();
        if (repository.existsByTipoCatalogoAndCodigo(tipo, codigo)) {
            throw new ConflictException("Ya existe un ítem con el código '" + codigo + "' en este catálogo.");
        }
        dto.setCodigo(codigo);
        CatalogoEntity entity = mapper.toEntity(dto, tipo);
        entity = repository.save(entity);
        auditoriaWriter.registrar("catálogo creado",
                "Catálogo creado: " + tipo + "/" + entity.getCodigo());
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public CatalogoDTO actualizar(String tipo, String codigo, CatalogoDTO dto) {
        CatalogoEntity entity = repository.findByTipoCatalogoAndCodigo(tipo, codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado."));

        if (dto.getCodigo() != null && !entity.getCodigo().equalsIgnoreCase(dto.getCodigo())
                && repository.existsByTipoCatalogoAndCodigo(tipo, dto.getCodigo().trim().toUpperCase())) {
            throw new ConflictException("Ya existe otro ítem con ese código.");
        }

        if (dto.getCodigo() != null && !dto.getCodigo().isBlank()) {
            entity.setCodigo(dto.getCodigo().trim().toUpperCase());
        }
        if (dto.getNombre() != null) {
            entity.setValor(dto.getNombre());
        }
        entity.setDescripcion(dto.getDescripcion());
        if (dto.getEstado() != null) {
            entity.setEstado("Activo".equalsIgnoreCase(dto.getEstado()));
        }
        if (dto.getOrden() != null) {
            entity.setOrden(dto.getOrden());
        }

        CatalogoEntity saved = repository.save(entity);
        auditoriaWriter.registrar("catálogo actualizado",
                "Catálogo actualizado: " + tipo + "/" + saved.getCodigo());
        return mapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void eliminar(String tipo, String codigo) {
        CatalogoEntity entity = repository.findByTipoCatalogoAndCodigo(tipo, codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem no encontrado."));
        // Soft-delete: desactiva para no romper FKs de sistemas.
        entity.setEstado(false);
        repository.save(entity);
        auditoriaWriter.registrar("catálogo desactivado",
                "Catálogo desactivado: " + tipo + "/" + codigo);
    }
}

package pe.edu.unas.ctic.diagti.administrador.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.dto.CatalogoDTO;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.mapper.CatalogoMapper;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.administrador.service.CatalogoService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogoServiceImpl implements CatalogoService {

    private final CatalogoRepository repository;
    private final CatalogoMapper mapper;

    @Override
    public List<CatalogoDTO> listarPorTipo(String tipo) {
        return repository.findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc(tipo)
                .stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CatalogoDTO crear(String tipo, CatalogoDTO dto) {
        if (repository.existsByTipoCatalogoAndCodigo(tipo, dto.getCodigo())) {
            throw new RuntimeException("Ya existe un ítem con el código '" + dto.getCodigo() + "' en este catálogo.");
        }
        CatalogoEntity entity = mapper.toEntity(dto, tipo);
        entity = repository.save(entity);
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    public CatalogoDTO actualizar(String tipo, String codigo, CatalogoDTO dto) {
        CatalogoEntity entity = repository.findByTipoCatalogoAndCodigo(tipo, codigo)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado."));

        if (!entity.getCodigo().equals(dto.getCodigo()) &&
            repository.existsByTipoCatalogoAndCodigo(tipo, dto.getCodigo())) {
            throw new RuntimeException("Ya existe otro ítem con ese código.");
        }

        entity.setCodigo(dto.getCodigo());
        entity.setValor(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setEstado("Activo".equals(dto.getEstado()));
        entity.setOrden(dto.getOrden());

        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    public void eliminar(String tipo, String codigo) {
        CatalogoEntity entity = repository.findByTipoCatalogoAndCodigo(tipo, codigo)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado."));
        entity.setEstado(false);
        repository.save(entity);
    }
}
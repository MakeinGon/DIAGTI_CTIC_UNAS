package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.mapper.RiesgoMapper;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.DirectorSistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ObservacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.service.RiesgosService;
import pe.edu.unas.ctic.diagti.director.support.DirectorTexto;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiesgosServiceImpl implements RiesgosService {

    private final DirectorSistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    private final DirectorSeguridadRepository seguridadRepository;
    private final ObservacionRepository observacionRepository;
    private final RiesgoMapper riesgoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RiesgoDTO> obtenerRiesgos(String area, String nivel, String estado, String categoria) {
        List<SistemaEntity> sistemas = sistemaRepository.findAllActivos();
        if (sistemas == null || sistemas.isEmpty()) {
            return List.of();
        }

        List<RiesgoDTO> todosRiesgos = new ArrayList<>();
        for (SistemaEntity sistema : sistemas) {
            List<ValidacionEntity> validaciones = validacionRepository.findByIdSistema(sistema.getIdSistema());
            List<SeguridadEntity> seguridades = seguridadRepository.findByIdSistema(sistema.getIdSistema());
            List<ObservacionEntity> observaciones = observacionRepository.findByIdSistema(sistema.getIdSistema());
            todosRiesgos.addAll(riesgoMapper.calcularRiesgos(sistema, validaciones, seguridades, observaciones));
        }

        return todosRiesgos.stream()
                .filter(r -> DirectorTexto.matchesFilter(area, r.getArea()))
                .filter(r -> DirectorTexto.matchesFilter(nivel, r.getNivel()))
                .filter(r -> DirectorTexto.matchesFilter(estado, r.getEstado()))
                .filter(r -> DirectorTexto.matchesFilter(categoria, r.getCategoria()))
                .collect(Collectors.toList());
    }
}

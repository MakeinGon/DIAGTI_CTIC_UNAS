package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.mapper.RiesgoMapper;
import pe.edu.unas.ctic.diagti.director.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
import pe.edu.unas.ctic.diagti.director.repository.SeguridadRepository;
import pe.edu.unas.ctic.diagti.director.service.RiesgosService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiesgosServiceImpl implements RiesgosService {

    private final SistemaRepository sistemaRepository;
    private final ValidacionRepository validacionRepository;
    private final SeguridadRepository seguridadRepository;
    private final RiesgoMapper riesgoMapper;

    @Override
    public List<RiesgoDTO> obtenerRiesgos(String area, String nivel, String estado) {
        List<SistemaEntity> sistemas = sistemaRepository.findAll();
        List<RiesgoDTO> todosRiesgos = new ArrayList<>();

        for (SistemaEntity sistema : sistemas) {
            List<ValidacionEntity> validaciones = validacionRepository.findByIdSistema(sistema.getIdSistema());
            List<SeguridadEntity> seguridades = seguridadRepository.findByIdSistema(sistema.getIdSistema());
            List<RiesgoDTO> riesgosSistema = riesgoMapper.calcularRiesgos(sistema, validaciones, seguridades);
            todosRiesgos.addAll(riesgosSistema);
        }

        // Filtrar por área, nivel y estado
        return todosRiesgos.stream()
                .filter(r -> area == null || area.isEmpty() || "all".equals(area) || area.equalsIgnoreCase(r.getArea()))
                .filter(r -> nivel == null || nivel.isEmpty() || "all".equals(nivel) || nivel.equalsIgnoreCase(r.getNivel()))
                .filter(r -> estado == null || estado.isEmpty() || "all".equals(estado) || estado.equalsIgnoreCase(r.getEstado()))
                .collect(Collectors.toList());
    }
}
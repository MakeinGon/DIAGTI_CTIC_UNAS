package pe.edu.unas.ctic.diagti.director.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.dto.RiesgoDTO;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import pe.edu.unas.ctic.diagti.director.mapper.RiesgoMapper;
import pe.edu.unas.ctic.diagti.director.repository.SeguridadRepository;
import pe.edu.unas.ctic.diagti.director.repository.SistemaRepository;
import pe.edu.unas.ctic.diagti.director.repository.ValidacionRepository;
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
    private final CatalogoRepository catalogoRepository;  // ← NUEVO
    private final RiesgoMapper riesgoMapper;

    /**
     * Obtiene el nombre del área desde el catálogo usando el id_area_usuario
     */
    private String getAreaNombre(SistemaEntity sistema) {
        if (sistema == null || sistema.getIdAreaUsuario() == null) {
            return "No especificada";
        }
        try {
            return catalogoRepository.findById(sistema.getIdAreaUsuario())
                    .map(CatalogoEntity::getValor)
                    .orElse("No especificada");
        } catch (Exception e) {
            return "No especificada";
        }
    }

    @Override
    @Transactional(readOnly = true)  // ← NUEVO: mantiene la sesión de Hibernate
    public List<RiesgoDTO> obtenerRiesgos(String area, String nivel, String estado, String categoria) {
        List<SistemaEntity> sistemas = sistemaRepository.findAll();
        List<RiesgoDTO> todosRiesgos = new ArrayList<>();

        for (SistemaEntity sistema : sistemas) {
            List<ValidacionEntity> validaciones = validacionRepository.findByIdSistema(sistema.getIdSistema());
            List<SeguridadEntity> seguridades = seguridadRepository.findByIdSistema(sistema.getIdSistema());
            
            // Calcular riesgos
            List<RiesgoDTO> riesgosSistema = riesgoMapper.calcularRiesgos(sistema, validaciones, seguridades);
            
            // Asignar el nombre del área real
            String nombreArea = getAreaNombre(sistema);
            for (RiesgoDTO riesgo : riesgosSistema) {
                riesgo.setArea(nombreArea);
            }
            
            todosRiesgos.addAll(riesgosSistema);
        }

        // Aplicar filtros
        return todosRiesgos.stream()
                .filter(r -> area == null || area.isEmpty() || "all".equals(area) || area.equalsIgnoreCase(r.getArea()))
                .filter(r -> nivel == null || nivel.isEmpty() || "all".equals(nivel) || nivel.equalsIgnoreCase(r.getNivel()))
                .filter(r -> estado == null || estado.isEmpty() || "all".equals(estado) || estado.equalsIgnoreCase(r.getEstado()))
                .filter(r -> categoria == null || categoria.isEmpty() || "all".equals(categoria) || categoria.equalsIgnoreCase(r.getCategoria()))
                .collect(Collectors.toList());
    }
}
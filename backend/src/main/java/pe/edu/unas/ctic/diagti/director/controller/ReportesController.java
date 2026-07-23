package pe.edu.unas.ctic.diagti.director.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import pe.edu.unas.ctic.diagti.administrador.repository.CatalogoRepository;
import pe.edu.unas.ctic.diagti.director.dto.CatalogoDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteInventarioDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteRiesgoDTO;
import pe.edu.unas.ctic.diagti.director.dto.ReporteValidacionDTO;
import pe.edu.unas.ctic.diagti.director.service.ReportesService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/director/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService reportesService;
    private final CatalogoRepository catalogoRepository;

    @GetMapping("/inventario")
    public List<ReporteInventarioDTO> getInventario(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String criticidad) {
        return reportesService.obtenerInventario(area, criticidad);
    }

    @GetMapping("/validacion")
    public List<ReporteValidacionDTO> getValidacion(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String validationStatus) {
        return reportesService.obtenerValidacion(area, estado, validationStatus);
    }

    @GetMapping("/riesgos")
    public List<ReporteRiesgoDTO> getRiesgos(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String criticidad) {
        return reportesService.obtenerRiesgos(area, criticidad);
    }

    @GetMapping("/catalogos/areas")
    public List<CatalogoDTO> getAreasUsuarias() {
        List<CatalogoDTO> areas = cargarCatalogo("AREA_USUARIO");
        if (!areas.isEmpty()) {
            return areas;
        }
        // Compatibilidad temporal con tipografía incorrecta previa
        return cargarCatalogo("AREA_USUARIA");
    }

    @GetMapping("/catalogos/criticidades")
    public List<CatalogoDTO> getCriticidades() {
        return cargarCatalogo("CRITICIDAD");
    }

    @GetMapping("/catalogos/tipos")
    public List<CatalogoDTO> getTiposAplicativo() {
        return cargarCatalogo("TIPO_APLICATIVO");
    }

    @GetMapping("/catalogos/riesgos")
    public List<CatalogoDTO> getNivelesRiesgo() {
        List<CatalogoDTO> fromDb = cargarCatalogo("NIVEL_RIESGO");
        if (!fromDb.isEmpty()) {
            return fromDb;
        }
        return nivelesRiesgoEstaticos();
    }

    @GetMapping("/catalogos/estados-validacion")
    public List<CatalogoDTO> getEstadosValidacion() {
        // Estados oficiales del flujo (no dependen de catálogo ESTADO_LEVANTAMIENTO).
        List<CatalogoDTO> list = new ArrayList<>();
        list.add(estatico("BORRADOR", "Borrador", 1));
        list.add(estatico("PENDIENTE", "Pendiente", 2));
        list.add(estatico("ENVIADO", "Enviado", 3));
        list.add(estatico("EN_VALIDACION", "En validación", 4));
        list.add(estatico("OBSERVADO", "Observado", 5));
        list.add(estatico("SUBSANADO", "Subsanado", 6));
        list.add(estatico("VALIDADO", "Validado", 7));
        list.add(estatico("RECHAZADO", "Rechazado", 8));
        return list;
    }

    private List<CatalogoDTO> cargarCatalogo(String tipo) {
        List<CatalogoEntity> activos = catalogoRepository
                .findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc(tipo);
        if (activos != null && !activos.isEmpty()) {
            return activos.stream().map(this::toDTO).collect(Collectors.toList());
        }
        // Fallback: incluye filas con estado null (datos legacy / seed parcial)
        List<CatalogoEntity> todos = catalogoRepository.findByTipoCatalogoOrderByOrdenAsc(tipo);
        if (todos == null || todos.isEmpty()) {
            return List.of();
        }
        return todos.stream()
                .filter(c -> c.getEstado() == null || Boolean.TRUE.equals(c.getEstado()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CatalogoDTO toDTO(CatalogoEntity entity) {
        CatalogoDTO dto = new CatalogoDTO();
        dto.setId(entity.getIdCatalogo());
        dto.setTipoCatalogo(entity.getTipoCatalogo());
        dto.setCodigo(entity.getCodigo());
        dto.setValor(entity.getValor());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado() == null || Boolean.TRUE.equals(entity.getEstado()));
        dto.setOrden(entity.getOrden());
        return dto;
    }

    private List<CatalogoDTO> nivelesRiesgoEstaticos() {
        List<CatalogoDTO> list = new ArrayList<>();
        list.add(estatico("BAJO", "Bajo", 1));
        list.add(estatico("MEDIO", "Medio", 2));
        list.add(estatico("ALTO", "Alto", 3));
        list.add(estatico("CRITICO", "Crítico", 4));
        return list;
    }

    private CatalogoDTO estatico(String codigo, String valor, int orden) {
        CatalogoDTO dto = new CatalogoDTO();
        dto.setId(null);
        dto.setTipoCatalogo("ESTADO_FLUJO");
        dto.setCodigo(codigo);
        dto.setValor(valor);
        dto.setDescripcion(valor);
        dto.setEstado(true);
        dto.setOrden(orden);
        return dto;
    }
}

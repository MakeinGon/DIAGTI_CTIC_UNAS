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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/director/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportesController {

    private final ReportesService reportesService;
    private final CatalogoRepository catalogoRepository;

    // ============================================
    // ENDPOINTS DE REPORTES
    // ============================================
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

    // ============================================
    // ENDPOINTS DE CATÁLOGOS PARA FILTROS
    // ============================================
    @GetMapping("/catalogos/areas")
    public List<CatalogoDTO> getAreasUsuarias() {
        return catalogoRepository
                .findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc("AREA_USUARIA")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/catalogos/criticidades")
    public List<CatalogoDTO> getCriticidades() {
        return catalogoRepository
                .findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc("CRITICIDAD")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/catalogos/tipos")
    public List<CatalogoDTO> getTiposAplicativo() {
        return catalogoRepository
                .findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc("TIPO_APLICATIVO")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/catalogos/riesgos")
    public List<CatalogoDTO> getNivelesRiesgo() {
        return catalogoRepository
                .findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc("NIVEL_RIESGO")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/catalogos/estados-validacion")
    public List<CatalogoDTO> getEstadosValidacion() {
        return catalogoRepository
                .findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc("ESTADO_LEVANTAMIENTO")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ============================================
    // MÉTODO AUXILIAR
    // ============================================
    private CatalogoDTO toDTO(CatalogoEntity entity) {
        CatalogoDTO dto = new CatalogoDTO();
        dto.setId(entity.getIdCatalogo());
        dto.setTipoCatalogo(entity.getTipoCatalogo());
        dto.setCodigo(entity.getCodigo());
        dto.setValor(entity.getValor());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        dto.setOrden(entity.getOrden());
        return dto;
    }
}
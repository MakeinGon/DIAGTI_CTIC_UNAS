
package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EditarSistemaRequestDTO {
    private String codigo;
    private String nombre;
    private String descripcion;
    private String tipoAplicativo;
    private String areaUsuaria;
    private String responsableFuncional;
    private String responsableTecnico;
    private String estado;
    private String criticidad;
    private Integer anioDesarrollo;
    private String formaAdquisicion;
    private String empresaDesarrolladora;
    private Boolean contratoVigente;
    private LocalDateTime fechaVencimientoSoporte;
    private String observaciones;
    private Boolean esLegacy;
    
    // Arquitectura
    private ArquitecturaDTO arquitectura;
    
    // Infraestructura
    private InfraestructuraDTO infraestructura;
    
    // Seguridad
    private SeguridadDTO seguridad;
    
    // Listas para modificar
    private List<Long> integracionesEliminar;
    private List<Long> evidenciasEliminar;
    private List<Long> urlsEliminar;
}//-
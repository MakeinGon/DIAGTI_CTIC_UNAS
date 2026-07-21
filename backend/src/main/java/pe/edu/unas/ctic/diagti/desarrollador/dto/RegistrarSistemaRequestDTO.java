package pe.edu.unas.ctic.diagti.desarrollador.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RegistrarSistemaRequestDTO {
    
    @NotBlank(message = "El código es obligatorio")
    private String codigo;
    
    @NotBlank(message = "El estado es obligatorio")
    private String estado;
    
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    
    private String descripcion;
    
    @NotBlank(message = "El tipo de aplicativo es obligatorio")
    private String tipoAplicativo;
    
    private String areaUsuaria;
    private String responsableFuncional;
    
    @NotBlank(message = "El responsable técnico es obligatorio")
    private String responsableTecnico;
    
    private String criticidad;
    private Integer anioDesarrollo;
    private String formaAdquisicion;
    private String empresaDesarrolladora;
    private Boolean contratoVigente;
    private LocalDateTime fechaVencimientoSoporte;
    private String observaciones;
    private Boolean esLegacy;
    
    // Datos de arquitectura
    private ArquitecturaDTO arquitectura;
    
    // Datos de infraestructura
    private InfraestructuraDTO infraestructura;
    
    // Datos de seguridad
    private SeguridadDTO seguridad;
    
    // Lista de integraciones
    private List<IntegracionDTO> integraciones;
}
package pe.edu.unas.ctic.diagti.validador.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "validaciones")
public class Validacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_validacion")
    private Long idValidacion;
    
    @Column(name = "id_sistema", nullable = false)
    private Long idSistema;
    
    @Column(name = "id_validador")
    private Long idValidador;
    
    @Column(name = "estado_validacion", nullable = false, length = 50)
    private String estadoValidacion;  // ✅ NOMBRE CORRECTO
    
    @Column(name = "resultado", length = 50)
    private String resultado;
    
    @Column(name = "observacion_general", columnDefinition = "TEXT")
    private String observacionGeneral;
    
    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;
    
    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Transient
    private String nombreSistema;
    
    @Transient
    private String nombreValidador;
    
    // Getters y Setters
    public Long getIdValidacion() { return idValidacion; }
    public void setIdValidacion(Long idValidacion) { this.idValidacion = idValidacion; }
    
    public Long getIdSistema() { return idSistema; }
    public void setIdSistema(Long idSistema) { this.idSistema = idSistema; }
    
    public Long getIdValidador() { return idValidador; }
    public void setIdValidador(Long idValidador) { this.idValidador = idValidador; }
    
    public String getEstadoValidacion() { return estadoValidacion; }
    public void setEstadoValidacion(String estadoValidacion) { this.estadoValidacion = estadoValidacion; }
    
    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }
    
    public String getObservacionGeneral() { return observacionGeneral; }
    public void setObservacionGeneral(String observacionGeneral) { this.observacionGeneral = observacionGeneral; }
    
    public LocalDateTime getFechaValidacion() { return fechaValidacion; }
    public void setFechaValidacion(LocalDateTime fechaValidacion) { this.fechaValidacion = fechaValidacion; }
    
    public LocalDateTime getFechaSubsanacion() { return fechaSubsanacion; }
    public void setFechaSubsanacion(LocalDateTime fechaSubsanacion) { this.fechaSubsanacion = fechaSubsanacion; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
    
    public String getNombreSistema() { return nombreSistema; }
    public void setNombreSistema(String nombreSistema) { this.nombreSistema = nombreSistema; }
    
    public String getNombreValidador() { return nombreValidador; }
    public void setNombreValidador(String nombreValidador) { this.nombreValidador = nombreValidador; }
}
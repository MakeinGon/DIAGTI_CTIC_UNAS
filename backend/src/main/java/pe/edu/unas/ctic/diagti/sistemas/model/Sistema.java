package pe.edu.unas.ctic.diagti.sistemas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sistemas")
public class Sistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sistema")
    private Long idSistema;

    @Column(name = "codigo_unico", unique = true, length = 50)
    private String codigoUnico;

    @Column(name = "nombre", length = 255)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "id_area_usuario")
    private Long idAreaUsuario;

    @Column(name = "id_tipo_aplicativo")
    private Long idTipoAplicativo;

    @Column(name = "id_criticidad")
    private Long idCriticidad;

    @Column(name = "forma_adquisicion", length = 100)
    private String formaAdquisicion;

    @Column(name = "id_responsable_funcional")
    private Long idResponsableFuncional;

    @Column(name = "id_responsable_tecnico")
    private Long idResponsableTecnico;

    @Column(name = "ano_adquisicion")
    private Integer anoAdquisicion;

    @Column(name = "desarrollador_nombre", length = 255)
    private String desarrolladorNombre;

    @Column(name = "contrato_vigente")
    private Boolean contratoVigente = false;

    @Column(name = "fecha_vencimiento_soporte")
    private LocalDateTime fechaVencimientoSoporte;

    @Column(name = "es_legacy")
    private Boolean esLegacy = false;

    @Column(name = "estado_flujo", length = 50)
    private String estadoFlujo;

    @Column(name = "nivel_riesgo", length = 20)
    private String nivelRiesgo;

    @Column(name = "prioridad_migracion", length = 20)
    private String prioridadMigracion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @Column(name = "fecha_eliminacion")
    private LocalDateTime fechaEliminacion;

    // Getters y Setters
    public Long getIdSistema() { return idSistema; }
    public void setIdSistema(Long idSistema) { this.idSistema = idSistema; }

    public String getCodigoUnico() { return codigoUnico; }
    public void setCodigoUnico(String codigoUnico) { this.codigoUnico = codigoUnico; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Long getIdAreaUsuario() { return idAreaUsuario; }
    public void setIdAreaUsuario(Long idAreaUsuario) { this.idAreaUsuario = idAreaUsuario; }

    public Long getIdTipoAplicativo() { return idTipoAplicativo; }
    public void setIdTipoAplicativo(Long idTipoAplicativo) { this.idTipoAplicativo = idTipoAplicativo; }

    public Long getIdCriticidad() { return idCriticidad; }
    public void setIdCriticidad(Long idCriticidad) { this.idCriticidad = idCriticidad; }

    public String getFormaAdquisicion() { return formaAdquisicion; }
    public void setFormaAdquisicion(String formaAdquisicion) { this.formaAdquisicion = formaAdquisicion; }

    public Long getIdResponsableFuncional() { return idResponsableFuncional; }
    public void setIdResponsableFuncional(Long idResponsableFuncional) { this.idResponsableFuncional = idResponsableFuncional; }

    public Long getIdResponsableTecnico() { return idResponsableTecnico; }
    public void setIdResponsableTecnico(Long idResponsableTecnico) { this.idResponsableTecnico = idResponsableTecnico; }

    public Integer getAnoAdquisicion() { return anoAdquisicion; }
    public void setAnoAdquisicion(Integer anoAdquisicion) { this.anoAdquisicion = anoAdquisicion; }

    public String getDesarrolladorNombre() { return desarrolladorNombre; }
    public void setDesarrolladorNombre(String desarrolladorNombre) { this.desarrolladorNombre = desarrolladorNombre; }

    public Boolean getContratoVigente() { return contratoVigente; }
    public void setContratoVigente(Boolean contratoVigente) { this.contratoVigente = contratoVigente; }

    public LocalDateTime getFechaVencimientoSoporte() { return fechaVencimientoSoporte; }
    public void setFechaVencimientoSoporte(LocalDateTime fechaVencimientoSoporte) { this.fechaVencimientoSoporte = fechaVencimientoSoporte; }

    public Boolean getEsLegacy() { return esLegacy; }
    public void setEsLegacy(Boolean esLegacy) { this.esLegacy = esLegacy; }

    public String getEstadoFlujo() { return estadoFlujo; }
    public void setEstadoFlujo(String estadoFlujo) { this.estadoFlujo = estadoFlujo; }

    public String getNivelRiesgo() { return nivelRiesgo; }
    public void setNivelRiesgo(String nivelRiesgo) { this.nivelRiesgo = nivelRiesgo; }

    public String getPrioridadMigracion() { return prioridadMigracion; }
    public void setPrioridadMigracion(String prioridadMigracion) { this.prioridadMigracion = prioridadMigracion; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public LocalDateTime getFechaEliminacion() { return fechaEliminacion; }
    public void setFechaEliminacion(LocalDateTime fechaEliminacion) { this.fechaEliminacion = fechaEliminacion; }
}
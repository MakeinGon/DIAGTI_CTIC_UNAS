package pe.edu.unas.ctic.diagti.validador.dto;

import java.time.LocalDateTime;

public class ValidadorDTO {
    private Long idValidacion;
    private Long idSistema;
    private String nombreSistema;
    private String codigo;
    private String area;
    private Long idValidador;
    private String nombreValidador;
    private String estadoValidacion;
    private String resultado;
    private String observacionGeneral;
    private LocalDateTime fechaValidacion;
    private LocalDateTime fechaSubsanacion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // Getters y Setters
    public Long getIdValidacion() { return idValidacion; }
    public void setIdValidacion(Long idValidacion) { this.idValidacion = idValidacion; }
    public Long getIdSistema() { return idSistema; }
    public void setIdSistema(Long idSistema) { this.idSistema = idSistema; }
    public String getNombreSistema() { return nombreSistema; }
    public void setNombreSistema(String nombreSistema) { this.nombreSistema = nombreSistema; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public Long getIdValidador() { return idValidador; }
    public void setIdValidador(Long idValidador) { this.idValidador = idValidador; }
    public String getNombreValidador() { return nombreValidador; }
    public void setNombreValidador(String nombreValidador) { this.nombreValidador = nombreValidador; }
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
}
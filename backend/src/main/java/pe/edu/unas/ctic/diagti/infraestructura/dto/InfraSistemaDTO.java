package pe.edu.unas.ctic.diagti.infraestructura.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class InfraSistemaDTO {
    private Long idRegistro;
    private String codigoSistema;
    private String nombreSistema;
    private String areaUsuaria;
    private String responsableDesarrollo;
    private String responsableInfraestructura;
    private String usuarioInfraestructura;
    private String estado;
    private Map<String, Object> datosDesarrollo;
    private Map<String, Object> datosInfraestructura;
    private String comentarioRevision;
    private String observacionesJson;
    private String revisadoPor;
    private LocalDateTime fechaEnvioDesarrollo;
    private LocalDateTime fechaEnvioInfraestructura;
    private LocalDateTime fechaRevision;
    private LocalDateTime fechaActualizacion;

    public Long getIdRegistro() { return idRegistro; }
    public void setIdRegistro(Long idRegistro) { this.idRegistro = idRegistro; }
    public String getCodigoSistema() { return codigoSistema; }
    public void setCodigoSistema(String codigoSistema) { this.codigoSistema = codigoSistema; }
    public String getNombreSistema() { return nombreSistema; }
    public void setNombreSistema(String nombreSistema) { this.nombreSistema = nombreSistema; }
    public String getAreaUsuaria() { return areaUsuaria; }
    public void setAreaUsuaria(String areaUsuaria) { this.areaUsuaria = areaUsuaria; }
    public String getResponsableDesarrollo() { return responsableDesarrollo; }
    public void setResponsableDesarrollo(String responsableDesarrollo) { this.responsableDesarrollo = responsableDesarrollo; }
    public String getResponsableInfraestructura() { return responsableInfraestructura; }
    public void setResponsableInfraestructura(String responsableInfraestructura) { this.responsableInfraestructura = responsableInfraestructura; }
    public String getUsuarioInfraestructura() { return usuarioInfraestructura; }
    public void setUsuarioInfraestructura(String usuarioInfraestructura) { this.usuarioInfraestructura = usuarioInfraestructura; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Map<String, Object> getDatosDesarrollo() { return datosDesarrollo; }
    public void setDatosDesarrollo(Map<String, Object> datosDesarrollo) { this.datosDesarrollo = datosDesarrollo; }
    public Map<String, Object> getDatosInfraestructura() { return datosInfraestructura; }
    public void setDatosInfraestructura(Map<String, Object> datosInfraestructura) { this.datosInfraestructura = datosInfraestructura; }
    public String getComentarioRevision() { return comentarioRevision; }
    public void setComentarioRevision(String comentarioRevision) { this.comentarioRevision = comentarioRevision; }
    public String getObservacionesJson() { return observacionesJson; }
    public void setObservacionesJson(String observacionesJson) { this.observacionesJson = observacionesJson; }
    public String getRevisadoPor() { return revisadoPor; }
    public void setRevisadoPor(String revisadoPor) { this.revisadoPor = revisadoPor; }
    public LocalDateTime getFechaEnvioDesarrollo() { return fechaEnvioDesarrollo; }
    public void setFechaEnvioDesarrollo(LocalDateTime fechaEnvioDesarrollo) { this.fechaEnvioDesarrollo = fechaEnvioDesarrollo; }
    public LocalDateTime getFechaEnvioInfraestructura() { return fechaEnvioInfraestructura; }
    public void setFechaEnvioInfraestructura(LocalDateTime fechaEnvioInfraestructura) { this.fechaEnvioInfraestructura = fechaEnvioInfraestructura; }
    public LocalDateTime getFechaRevision() { return fechaRevision; }
    public void setFechaRevision(LocalDateTime fechaRevision) { this.fechaRevision = fechaRevision; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}

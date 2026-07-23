package pe.edu.unas.ctic.diagti.flujo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity(name = "FlujoSolicitudValidacion")
@Table(name = "solicitudes_validacion")
public class SolicitudValidacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long id;

    @Column(name = "codigo_sistema", nullable = false, length = 80)
    private String codigoSistema;

    @Column(name = "nombre_sistema", nullable = false, length = 200)
    private String nombreSistema;

    @Column(name = "area_origen", nullable = false, length = 60)
    private String areaOrigen;

    @Column(name = "area_usuaria", length = 150)
    private String areaUsuaria;

    @Column(name = "responsable", length = 180)
    private String responsable;

    @Column(name = "usuario_origen", length = 100)
    private String usuarioOrigen;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "comentario_revision", columnDefinition = "TEXT")
    private String comentarioRevision;

    /**
     * Lista JSON de observaciones estructuradas. Cada elemento conserva
     * responsable, sección, campo, detalle y si requiere evidencia.
     */
    @Column(name = "observaciones_json", columnDefinition = "TEXT")
    private String observacionesJson;

    @Column(name = "revisado_por", length = 180)
    private String revisadoPor;

    @Column(name = "usuario_revisor", length = 100)
    private String usuarioRevisor;

    @Column(name = "datos_json", nullable = false, columnDefinition = "TEXT")
    private String datosJson;

    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_revision")
    private LocalDateTime fechaRevision;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigoSistema() { return codigoSistema; }
    public void setCodigoSistema(String codigoSistema) { this.codigoSistema = codigoSistema; }
    public String getNombreSistema() { return nombreSistema; }
    public void setNombreSistema(String nombreSistema) { this.nombreSistema = nombreSistema; }
    public String getAreaOrigen() { return areaOrigen; }
    public void setAreaOrigen(String areaOrigen) { this.areaOrigen = areaOrigen; }
    public String getAreaUsuaria() { return areaUsuaria; }
    public void setAreaUsuaria(String areaUsuaria) { this.areaUsuaria = areaUsuaria; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    public String getUsuarioOrigen() { return usuarioOrigen; }
    public void setUsuarioOrigen(String usuarioOrigen) { this.usuarioOrigen = usuarioOrigen; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public String getComentarioRevision() { return comentarioRevision; }
    public void setComentarioRevision(String comentarioRevision) { this.comentarioRevision = comentarioRevision; }
    public String getObservacionesJson() { return observacionesJson; }
    public void setObservacionesJson(String observacionesJson) { this.observacionesJson = observacionesJson; }
    public String getRevisadoPor() { return revisadoPor; }
    public void setRevisadoPor(String revisadoPor) { this.revisadoPor = revisadoPor; }
    public String getUsuarioRevisor() { return usuarioRevisor; }
    public void setUsuarioRevisor(String usuarioRevisor) { this.usuarioRevisor = usuarioRevisor; }
    public String getDatosJson() { return datosJson; }
    public void setDatosJson(String datosJson) { this.datosJson = datosJson; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public LocalDateTime getFechaRevision() { return fechaRevision; }
    public void setFechaRevision(LocalDateTime fechaRevision) { this.fechaRevision = fechaRevision; }
}

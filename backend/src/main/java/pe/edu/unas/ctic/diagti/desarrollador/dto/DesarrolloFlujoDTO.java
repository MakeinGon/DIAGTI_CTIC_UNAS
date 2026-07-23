package pe.edu.unas.ctic.diagti.desarrollador.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Datos persistidos del flujo Desarrollo y contrato de entrada relacionado.
 *
 * <p>La clase anidada {@link Request} conserva los mismos campos JSON que el
 * antiguo archivo de solicitud, pero evita mantener dos archivos para el mismo
 * caso de uso.</p>
 */
public class DesarrolloFlujoDTO {
    private Long id;
    private String codigoSistema;
    private String nombreSistema;
    private String areaUsuaria;
    private String responsable;
    private String usuarioOrigen;
    private String estado;
    private Map<String, Object> datos;
    private String comentarioRevision;
    private String observacionesJson;
    private String revisadoPor;
    private String usuarioRevisor;
    private LocalDateTime fechaEnvio;
    private LocalDateTime fechaRevision;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigoSistema() { return codigoSistema; }
    public void setCodigoSistema(String codigoSistema) { this.codigoSistema = codigoSistema; }
    public String getNombreSistema() { return nombreSistema; }
    public void setNombreSistema(String nombreSistema) { this.nombreSistema = nombreSistema; }
    public String getAreaUsuaria() { return areaUsuaria; }
    public void setAreaUsuaria(String areaUsuaria) { this.areaUsuaria = areaUsuaria; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    public String getUsuarioOrigen() { return usuarioOrigen; }
    public void setUsuarioOrigen(String usuarioOrigen) { this.usuarioOrigen = usuarioOrigen; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Map<String, Object> getDatos() { return datos; }
    public void setDatos(Map<String, Object> datos) { this.datos = datos; }
    public String getComentarioRevision() { return comentarioRevision; }
    public void setComentarioRevision(String comentarioRevision) { this.comentarioRevision = comentarioRevision; }
    public String getObservacionesJson() { return observacionesJson; }
    public void setObservacionesJson(String observacionesJson) { this.observacionesJson = observacionesJson; }
    public String getRevisadoPor() { return revisadoPor; }
    public void setRevisadoPor(String revisadoPor) { this.revisadoPor = revisadoPor; }
    public String getUsuarioRevisor() { return usuarioRevisor; }
    public void setUsuarioRevisor(String usuarioRevisor) { this.usuarioRevisor = usuarioRevisor; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public LocalDateTime getFechaRevision() { return fechaRevision; }
    public void setFechaRevision(LocalDateTime fechaRevision) { this.fechaRevision = fechaRevision; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public static class Request {
        @NotBlank private String codigoSistema;
        @NotBlank private String nombreSistema;
        private String areaUsuaria;
        private String responsable;
        private String usuarioOrigen;
        private String comentario;
        private Map<String, Object> datos = new HashMap<>();

        public String getCodigoSistema() { return codigoSistema; }
        public void setCodigoSistema(String codigoSistema) { this.codigoSistema = codigoSistema; }
        public String getNombreSistema() { return nombreSistema; }
        public void setNombreSistema(String nombreSistema) { this.nombreSistema = nombreSistema; }
        public String getAreaUsuaria() { return areaUsuaria; }
        public void setAreaUsuaria(String areaUsuaria) { this.areaUsuaria = areaUsuaria; }
        public String getResponsable() { return responsable; }
        public void setResponsable(String responsable) { this.responsable = responsable; }
        public String getUsuarioOrigen() { return usuarioOrigen; }
        public void setUsuarioOrigen(String usuarioOrigen) { this.usuarioOrigen = usuarioOrigen; }
        public String getComentario() { return comentario; }
        public void setComentario(String comentario) { this.comentario = comentario; }
        public Map<String, Object> getDatos() { return datos; }
        public void setDatos(Map<String, Object> datos) {
            this.datos = datos == null ? new HashMap<>() : datos;
        }
    }
}

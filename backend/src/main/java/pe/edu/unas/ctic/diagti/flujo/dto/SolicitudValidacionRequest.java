package pe.edu.unas.ctic.diagti.flujo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class SolicitudValidacionRequest {
    @NotBlank private String codigoSistema;
    @NotBlank private String nombreSistema;
    @NotBlank private String areaOrigen;
    private String areaUsuaria;
    private String responsable;
    private String usuarioOrigen;
    private String comentario;
    @NotNull private Map<String, Object> datos;

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
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public Map<String, Object> getDatos() { return datos; }
    public void setDatos(Map<String, Object> datos) { this.datos = datos; }
}

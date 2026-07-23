package pe.edu.unas.ctic.diagti.infraestructura.dto;

import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;

public class InfraTecnicoResponseDTO {
    private boolean exito;
    private String mensaje;
    private InfraSistemaDTO sistema;
    private SolicitudValidacion solicitud;

    public boolean isExito() { return exito; }
    public void setExito(boolean exito) { this.exito = exito; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public InfraSistemaDTO getSistema() { return sistema; }
    public void setSistema(InfraSistemaDTO sistema) { this.sistema = sistema; }
    public SolicitudValidacion getSolicitud() { return solicitud; }
    public void setSolicitud(SolicitudValidacion solicitud) { this.solicitud = solicitud; }
}

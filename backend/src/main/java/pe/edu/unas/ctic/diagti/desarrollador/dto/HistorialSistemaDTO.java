package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HistorialSistemaDTO {
    private ResumenSistemaDTO sistema;
    private List<EventoDTO> trazabilidad;
    
    @Data
    public static class ResumenSistemaDTO {
        private Long id;
        private String codigo;
        private String nombre;
        private String estadoActual;
        private String areaUsuaria;
        private String responsableTecnico;
        private String responsableFuncional;
        private String criticidad;
        private String nivelRiesgo;
        private Integer puntajeRiesgo;
        private LocalDateTime fechaCreacion;
        private LocalDateTime fechaActualizacion;
        private String usuarioCreador;
        private String usuarioModificador;
    }
    
    @Data
    public static class EventoDTO {
        private LocalDateTime fecha;
        private String usuario;
        private String accion;
        private String estado;
        private String descripcion;
        private String tipoEvento; // CREACION, ACTUALIZACION, VALIDACION, OBSERVACION, SUBSANACION, ENVIO
        private Object valorAnterior;
        private Object valorNuevo;
        private String entidadAfectada;
    }
}//-
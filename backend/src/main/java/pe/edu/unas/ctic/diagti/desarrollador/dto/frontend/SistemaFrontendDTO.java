package pe.edu.unas.ctic.diagti.desarrollador.dto.frontend;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Contrato JSON alineado al frontend Luis Lara (dashboard / mis-sistemas / observaciones).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SistemaFrontendDTO {

    private String id;
    private String codigo;
    private String nombre;
    private String tipo;
    private String estado;
    private String criticidad;
    private String fecha;
    private String area;

    @JsonProperty("responsable_tecnico")
    private String responsableTecnico;

    @JsonProperty("responsable_funcional")
    private String responsableFuncional;

    private String descripcion;

    @JsonProperty("anio_desarrollo")
    private String anioDesarrollo;

    private String adquisicion;
    private String empresa;
    private String contrato;

    @JsonProperty("fecha_soporte")
    private String fechaSoporte;

    private String observaciones;
    private String arquitectura;

    @JsonProperty("motor_bd")
    private String motorBd;

    @JsonProperty("tiene_integraciones")
    private Boolean tieneIntegraciones;

    private String riesgo;

    @Builder.Default
    private List<Object> evidencias = new ArrayList<>();

    @Builder.Default
    private List<Object> urls = new ArrayList<>();

    @Builder.Default
    @JsonProperty("observaciones_validador")
    private List<ObservacionFrontendDTO> observacionesValidador = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ObservacionFrontendDTO {
        private Long id;
        private String campo;
        private String mensaje;
        private String estado;
        private String area;
        @JsonProperty("fecha_creacion")
        private String fechaCreacion;
        @JsonProperty("fecha_atencion")
        private String fechaAtencion;
    }
}

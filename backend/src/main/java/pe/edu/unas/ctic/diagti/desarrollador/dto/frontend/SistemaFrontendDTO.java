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
 * Contrato JSON alineado al frontend (dashboard / mis-sistemas / observaciones).
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
    private String tipoCodigo;
    private String estado;
    private String criticidad;
    private String criticidadCodigo;
    private String fecha;
    private String area;
    private String areaCodigo;

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
    private String lenguaje;

    @JsonProperty("version_lenguaje")
    private String versionLenguaje;

    private String framework;

    @JsonProperty("version_framework")
    private String versionFramework;

    private String patron;
    private String repositorio;
    private String tecnologias;

    @JsonProperty("motor_bd")
    private String motorBd;

    @JsonProperty("version_bd")
    private String versionBd;

    @JsonProperty("tipo_bd")
    private String tipoBd;

    private String servidor;
    private String esquema;
    private String backup;
    private String frecuencia;

    @JsonProperty("cifrado")
    private String cifrado;

    @JsonProperty("responsable_bd")
    private String responsableBd;

    @JsonProperty("tiene_integraciones")
    private Boolean tieneIntegraciones;

    private String riesgo;

    @Builder.Default
    private List<Object> integraciones = new ArrayList<>();

    @Builder.Default
    private List<Object> evidencias = new ArrayList<>();

    @Builder.Default
    private List<Object> urls = new ArrayList<>();

    @Builder.Default
    @JsonProperty("observaciones_validador")
    private List<ObservacionFrontendDTO> observacionesValidador = new ArrayList<>();

    /** Metadato honesto: carga física de archivos aún no disponible. */
    @JsonProperty("archivos_fisicos_soportados")
    private Boolean archivosFisicosSoportados;

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

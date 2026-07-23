package pe.edu.unas.ctic.diagti.desarrollador.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Alta oficial sobre {@code sistemas} + ficha técnica relacionada.
 * Mantiene campos planos de compatibilidad y secciones anidadas.
 */
@Data
public class RegistrarSistemaOficialRequestDTO {

    @NotBlank(message = "El código único es obligatorio")
    private String codigoUnico;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotBlank(message = "El área usuaria es obligatoria")
    private String areaCodigo;

    @NotBlank(message = "El tipo de aplicativo es obligatorio")
    private String tipoCodigo;

    @NotBlank(message = "La criticidad es obligatoria")
    private String criticidadCodigo;

    @NotBlank(message = "La forma de adquisición es obligatoria")
    private String formaAdquisicion;

    @NotNull(message = "El año de adquisición es obligatorio")
    private Integer anoAdquisicion;

    @NotBlank(message = "El estado de flujo es obligatorio")
    private String estadoFlujo;

    @NotBlank(message = "El nivel de riesgo es obligatorio")
    private String nivelRiesgo;

    @NotBlank(message = "La prioridad de migración es obligatoria")
    private String prioridadMigracion;

    private String desarrolladorNombre;
    private Boolean contratoVigente;
    private String fechaVencimientoSoporte;
    private Boolean esLegacy;
    private String observacionesDesarrollo;

    @Valid
    private ArquitecturaSeccionDTO arquitectura;

    @Valid
    private BaseDatosSeccionDTO baseDatos;

    @Valid
    private IntegracionesSeccionDTO integraciones;

    @Valid
    private EvidenciasSeccionDTO evidencias;

    @Data
    public static class ArquitecturaSeccionDTO {
        private String lenguaje;
        private String versionLenguaje;
        private String framework;
        private String versionFramework;
        private String tipoArquitectura;
        private String patron;
        private String repositorioGit;
        private String tecnologiasComplementarias;
        private String observaciones;
    }

    @Data
    public static class BaseDatosSeccionDTO {
        private String motor;
        private String version;
        private String tipo;
        private String servidor;
        private String esquema;
        private Boolean tieneBackup;
        private String frecuenciaBackup;
        private Boolean cifrado;
        private String responsable;
    }

    @Data
    public static class IntegracionesSeccionDTO {
        private Boolean tieneIntegraciones;
        private List<IntegracionItemDTO> items = new ArrayList<>();
    }

    @Data
    public static class IntegracionItemDTO {
        private String nombre;
        private String tipo;
        private String sistemaExterno;
        private String tecnologia;
        private String url;
        private String descripcion;
        private String estado;
        private String protocolo;
        private String metodo;
        private String frecuencia;
        private String responsable;
        private String destino;
    }

    @Data
    public static class EvidenciasSeccionDTO {
        private List<EvidenciaUrlDTO> urls = new ArrayList<>();
        private List<EvidenciaArchivoDTO> archivos = new ArrayList<>();
    }

    @Data
    public static class EvidenciaUrlDTO {
        private String url;
        private String descripcion;
        private String tipo;
    }

    @Data
    public static class EvidenciaArchivoDTO {
        private String tipo;
        private String nombre;
        private Long size;
    }
}

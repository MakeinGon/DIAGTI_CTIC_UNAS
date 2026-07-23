package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MisSistemasDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String tipoAplicativo;
    private String areaUsuaria;
    private String estado;
    private String criticidad;
    private String nivelRiesgo;
    private Integer puntajeRiesgo;
    private Boolean esLegacy;
    private LocalDateTime fechaActualizacion;
    private String ultimaValidacion;
    private Integer cantidadEvidencias;
    private Boolean puedeEditar;
    private Boolean puedeEnviar;
    
    // ============================================================
    // ESTADÍSTICAS (para el dashboard)
    // ============================================================
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstadisticasDTO {
        private Long total;
        private Long borrador;
        private Long enviado;
        private Long observado;
        private Long validado;
        private Long legacy;
        private Long riesgoCritico;
    }

    /**
     * Filtros opcionales de la bandeja. Se agrupan aquí porque solo construyen
     * la consulta que devuelve objetos {@code MisSistemasDTO}.
     */
    @Data
    @NoArgsConstructor
    public static class Filter {
        private String usuario;
        private String estado;
        private String busqueda;
        private String area;
        private String tipo;
        private String criticidad;
    }
}//-

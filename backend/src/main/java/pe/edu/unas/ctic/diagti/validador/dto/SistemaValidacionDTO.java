package pe.edu.unas.ctic.diagti.validador.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SistemaValidacionDTO {

    private Long id;
    private Long idSistema;
    private Long idValidacion;
    private String codigo;
    private String nombreSistema;
    private String nombre;
    private String area;
    private String responsableTecnico;
    private String responsable;
    private String responsableFuncional;
    private String estado;
    private String estadoValidacion;
    private String criticidad;
    private String nivelRiesgo;
    private String observacionGeneral;
    private String nombreValidador;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaValidacion;
    private LocalDateTime fechaEnvio;
    private String descripcion;
    private Integer observacionesPendientes;

    @Builder.Default
    private List<ObservacionValidacionDTO> observaciones = new ArrayList<>();
}

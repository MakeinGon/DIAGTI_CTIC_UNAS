package pe.edu.unas.ctic.diagti.validador.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ObservacionValidacionDTO {
    private Long id;
    private Long idObservacion;
    private Long idSistema;
    private Long idValidacion;
    private String area;
    private String titulo;
    private String descripcion;
    private String estado;
    private String estadoObservacion;
    private String respuestaSubsanacion;
    private Long idUsuarioObserva;
    private Long idUsuarioSubsana;
    private LocalDateTime fechaObservacion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaSubsanacion;
    private LocalDateTime fechaAtencion;
}

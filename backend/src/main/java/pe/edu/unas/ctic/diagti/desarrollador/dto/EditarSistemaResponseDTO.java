package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EditarSistemaResponseDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String estado;
    private String nivelRiesgo;
    private Integer puntajeRiesgo;
    private LocalDateTime fechaActualizacion;
    private boolean exito;
    private String mensaje;
}
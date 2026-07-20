package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EnviarValidacionResponseDTO {
    private Long id;
    private String estado;
    private LocalDateTime fechaEnvio;
    private String mensaje;
    private boolean exito;
    private String observacionesPendientes;
}
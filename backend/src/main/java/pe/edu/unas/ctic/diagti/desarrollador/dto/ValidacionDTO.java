package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionDTO {
    private Long id;
    private String estadoValidacion;
    private String observacion;
    private String validador;
    private LocalDateTime fechaValidacion;
    private LocalDateTime fechaSubsanacion;
    private String usuarioSubsanacion;
    private String comentarioSubsanacion;
    private Boolean esUltima;
}
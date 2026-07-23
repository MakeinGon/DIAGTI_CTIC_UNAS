package pe.edu.unas.ctic.diagti.validador.dto;

import lombok.Data;

@Data
public class DecisionValidacionRequestDTO {
    private Long idSistema;
    private Long sistemaId;
    private Long idValidacion;
    private Long idValidador;
    private String username;
    private String comentario;
    private String observacionGeneral;
    private String estado; // aprobado | observado | rechazado
}

package pe.edu.unas.ctic.diagti.validador.dto;

import lombok.Data;

@Data
public class ObservacionRequestDTO {
    private Long sistemaId;
    private Long idSistema;
    private Long idValidacion;
    private Long idValidador;
    private String username;
    private String area;
    private String titulo;
    private String descripcion;
    private String detalle;
    private String sistema;
}

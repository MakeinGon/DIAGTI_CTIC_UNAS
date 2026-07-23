package pe.edu.unas.ctic.diagti.director.dto;

import lombok.Data;

@Data
public class CatalogoDTO {
    private Long id;
    private String tipoCatalogo;
    private String codigo;
    private String valor;       // ← nombre del ítem
    private String descripcion;
    private Boolean estado;     // ← true/false
    private Integer orden;
}
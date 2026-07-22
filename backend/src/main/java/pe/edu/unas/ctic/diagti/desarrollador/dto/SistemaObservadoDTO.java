package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SistemaObservadoDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String estado;
    private LocalDateTime fechaObservacion;
    private String areaUsuaria;
    private String validador;
    private Integer cantidadObservaciones;
    private List<String> observacionesResumen;
}//-
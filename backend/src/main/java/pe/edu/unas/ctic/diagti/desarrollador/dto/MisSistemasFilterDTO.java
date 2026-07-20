package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.Data;

@Data
public class MisSistemasFilterDTO {
    private String estado;
    private String busqueda;
    private String area;
    private String tipo;
    private String criticidad;
}
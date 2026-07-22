package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegracionDTO {
    private Long id;
    private String sistemaOrigen;
    private String sistemaDestino;
    private String protocolo;
    private String metodoIntercambio;
    private String frecuencia;
    private String estado;
    private String responsable;
    private String descripcion;
}//-
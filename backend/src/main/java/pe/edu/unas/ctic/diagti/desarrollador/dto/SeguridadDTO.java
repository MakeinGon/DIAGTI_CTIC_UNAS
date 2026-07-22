package pe.edu.unas.ctic.diagti.desarrollador.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeguridadDTO {
    private Long id;
    private Boolean sslTls;
    private Boolean autenticacionActiva;
    private Boolean mfa;
    private Boolean logsActivos;
    private Boolean auditoriaActiva;
    private Boolean owaspCumple;
    private Boolean cifradoActivo;
    private Boolean controlAcceso;
    private Boolean restriccionIP;
    private Boolean controlSesiones;
    private Boolean backupSeguro;
    private String observaciones;
}//-
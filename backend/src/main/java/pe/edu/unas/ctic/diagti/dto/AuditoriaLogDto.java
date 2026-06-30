package pe.edu.unas.ctic.diagti.dto;

import java.time.LocalDateTime;

public record AuditoriaLogDto(
        Integer idAuditoria,
        Integer idUsuario,
        String nombreUsuario,
        String modulo,
        String accion,
        String descripcion,
        LocalDateTime fechaEvento,
        String direccionIp) {}

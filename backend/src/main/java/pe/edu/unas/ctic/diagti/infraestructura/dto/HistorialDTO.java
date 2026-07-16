package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Un movimiento del historial, con las mismas claves que baseHistory[] en
 * historial.js (id, date, code, name, action, detail, user, state, section,
 * before, after) para que el frontend no tenga que remapear nada.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistorialDTO {
    private String id;
    private String date;
    private String code;
    private String name;
    private String action;
    private String detail;
    private String user;
    private String state;
    private String section;
    private String before;
    private String after;
}

package pe.edu.unas.ctic.diagti.infraestructura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfraHistorialDTO {
    private Long id;
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
    private Long sistemaId;
}

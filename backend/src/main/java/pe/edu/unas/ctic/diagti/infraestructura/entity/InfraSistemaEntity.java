package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sistemas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfraSistemaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "codigo")
    private String codigo;
    
    @Column(name = "nombre")
    private String nombre;
    
    @Column(name = "estado")
    private String estado;
    
    @Column(name = "nivel_riesgo")
    private String nivelRiesgo;
    
    @Column(name = "tipo_aplicativo")
    private String tipoAplicativo;
    
    @Column(name = "area_usuaria")
    private String areaUsuaria;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
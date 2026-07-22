package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity(name = "DesarrolladorValidacionEntity")
@Table(name = "validaciones_tecnicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "sistema_id")
    private Long sistemaId;
    
    // ✅ AGREGAR RELACIÓN CON SISTEMA
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sistema_id", insertable = false, updatable = false)
    private SistemaEntity sistema;
    
    @Column(name = "es_ultima")
    private Boolean esUltima;
    
    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;
    
    @Column(name = "observacion")
    private String observacion;
    
    @Column(name = "comentario_subsanacion")
    private String comentarioSubsanacion;
    
    @Column(name = "estado_validacion")
    private String estadoValidacion;
    
    @Column(name = "validador")
    private String validador;
    
    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;
    
    @Column(name = "usuario_subsanacion")
    private String usuarioSubsanacion;
}
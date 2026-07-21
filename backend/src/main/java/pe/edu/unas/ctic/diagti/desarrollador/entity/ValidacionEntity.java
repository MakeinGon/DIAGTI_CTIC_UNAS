package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "validaciones_tecnicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sistema_id", nullable = false)
    private SistemaEntity sistema;
    
    @Column(name = "estado_validacion", nullable = false)
    private String estadoValidacion;
    
    @Column(columnDefinition = "TEXT")
    private String observacion;
    
    private String validador;
    
    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;
    
    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;
    
    @Column(name = "usuario_subsanacion")
    private String usuarioSubsanacion;
    
    @Column(name = "comentario_subsanacion", columnDefinition = "TEXT")
    private String comentarioSubsanacion;
    
    @Column(name = "es_ultima")
    private Boolean esUltima = true;
    
    @PrePersist
    protected void onCreate() {
        fechaValidacion = LocalDateTime.now();
        if (esUltima == null) esUltima = true;
    }
}
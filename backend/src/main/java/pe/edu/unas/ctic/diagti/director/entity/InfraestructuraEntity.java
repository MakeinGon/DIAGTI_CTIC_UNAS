package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity(name = "DirectorInfraestructuraEntity")
@Table(name = "infraestructura")
public class InfraestructuraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_infraestructura")
    private Long idInfraestructura;

    @Column(name = "id_sistema", nullable = false)
    private Long idSistema;

    @Column(name = "capacidad_recursos", nullable = false, columnDefinition = "TEXT")
    private String capacidadRecursos;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", insertable = false, updatable = false)
    private SistemaEntity sistema;
}
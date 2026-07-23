package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "observaciones")
public class ObservacionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_observacion")
    private Long idObservacion;

    @Column(name = "id_sistema", nullable = false)
    private Long idSistema;

    @Column(name = "id_validacion", nullable = false)
    private Long idValidacion;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "estado_observacion", length = 50)
    private String estadoObservacion;

    @Column(name = "respuesta_subsanacion", columnDefinition = "TEXT")
    private String respuestaSubsanacion;

    @Column(name = "id_usuario_observa")
    private Long idUsuarioObserva;

    @Column(name = "id_usuario_subsana")
    private Long idUsuarioSubsana;

    @Column(name = "fecha_observacion")
    private LocalDateTime fechaObservacion;

    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", insertable = false, updatable = false)
    private SistemaEntity sistema;
}
package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Observación del Validador CTIC y su subsanación (RF-18). Es la que
 * alimenta el modal "Subsanar observación" de mis-sistemas.html.
 */
@Entity
@Table(name = "observaciones")
@Getter
@Setter
@NoArgsConstructor
public class Observacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_observacion")
    private Integer idObservacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", nullable = false)
    private Sistema sistema;

    @Column(name = "id_validacion", nullable = false)
    private Integer idValidacion;

    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    @Column(name = "estado_observacion")
    private String estadoObservacion = "PENDIENTE";

    @Column(name = "respuesta_subsanacion")
    private String respuestaSubsanacion;

    @Column(name = "id_usuario_observa")
    private Integer idUsuarioObserva;

    @Column(name = "id_usuario_subsana")
    private Integer idUsuarioSubsana;

    @Column(name = "fecha_observacion")
    private LocalDateTime fechaObservacion;

    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;

    @PrePersist
    void prePersist() {
        if (fechaObservacion == null) fechaObservacion = LocalDateTime.now();
        if (estadoObservacion == null) estadoObservacion = "PENDIENTE";
    }
}

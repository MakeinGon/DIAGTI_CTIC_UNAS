package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Evento de validación técnica (RF-16, RF-17, RF-19). El módulo de
 * Infraestructura crea la validación en estado PENDIENTE al enviar un
 * registro; el módulo del Validador Técnico CTIC (fuera del alcance de
 * esta rama) la resuelve como APROBADO/OBSERVADO/RECHAZADO.
 */
@Entity
@Table(name = "validaciones")
@Getter
@Setter
@NoArgsConstructor
public class Validacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_validacion")
    private Integer idValidacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", nullable = false)
    private Sistema sistema;

    @Column(name = "id_validador")
    private Integer idValidador;

    @Column(name = "estado_validacion", nullable = false, length = 50)
    private String estadoValidacion;

    @Column(name = "resultado")
    private String resultado;

    @Column(name = "observacion_general")
    private String observacionGeneral;

    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;

    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (fechaCreacion == null) fechaCreacion = now;
        if (fechaValidacion == null) fechaValidacion = now;
        fechaActualizacion = now;
    }

    @PreUpdate
    void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}

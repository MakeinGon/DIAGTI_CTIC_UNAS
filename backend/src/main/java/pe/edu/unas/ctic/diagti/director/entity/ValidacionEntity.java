package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity(name = "DirectorValidacionEntity")
@Table(name = "validaciones")
public class ValidacionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_validacion")
    private Long idValidacion;

    @Column(name = "id_sistema", nullable = false)
    private Long idSistema;

    @Column(name = "id_validador")
    private Long idValidador;

    @Column(name = "estado_validacion", nullable = false, length = 50)
    private String estadoValidacion;

    @Column(length = 50)
    private String resultado;

    @Column(name = "observacion_general", columnDefinition = "TEXT")
    private String observacionGeneral;

    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;

    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", insertable = false, updatable = false)
    private SistemaEntity sistema;
}
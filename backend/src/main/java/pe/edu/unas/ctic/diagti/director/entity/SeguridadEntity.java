package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "seguridad")
public class SeguridadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguridad")
    private Long idSeguridad;

    @Column(name = "id_sistema", nullable = false)
    private Long idSistema;

    @Column(name = "tipo_control", nullable = false, length = 100)
    private String tipoControl;

    @Column(name = "mecanismo_autenticacion", nullable = false, length = 100)
    private String mecanismoAutenticacion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", insertable = false, updatable = false)
    private SistemaEntity sistema;
}
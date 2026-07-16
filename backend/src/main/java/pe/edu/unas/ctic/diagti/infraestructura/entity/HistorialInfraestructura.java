package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Bitácora propia del módulo de Infraestructura, usada por la pantalla
 * Historial (frontend/pages/infraestructura/html/historial.html).
 * Complementa (no reemplaza) la tabla genérica "auditoria" compartida
 * por todo el sistema (RNF-04).
 */
@Entity
@Table(name = "infraestructura_historial")
@Getter
@Setter
@NoArgsConstructor
public class HistorialInfraestructura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer idHistorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", nullable = false)
    private Sistema sistema;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Column(name = "seccion")
    private String seccion;

    @Column(name = "detalle", nullable = false)
    private String detalle;

    @Column(name = "estado_resultante", nullable = false, length = 20)
    private String estadoResultante;

    @Column(name = "valor_anterior")
    private String valorAnterior;

    @Column(name = "valor_nuevo")
    private String valorNuevo;

    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "fecha_evento")
    private LocalDateTime fechaEvento;

    @PrePersist
    void prePersist() {
        if (fechaEvento == null) fechaEvento = LocalDateTime.now();
    }
}

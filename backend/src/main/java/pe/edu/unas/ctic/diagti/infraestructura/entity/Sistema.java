package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Mapeo mínimo (solo lectura) de la tabla compartida "sistemas".
 * El módulo de Inventario de Sistemas (otro compañero) es dueño del CRUD
 * completo; el módulo de Infraestructura solo necesita leer el sistema
 * para asociar su registro técnico.
 */
@Entity
@Table(name = "sistemas")
@Getter
@Setter
@NoArgsConstructor
public class Sistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sistema")
    private Integer idSistema;

    @Column(name = "codigo_unico", nullable = false, unique = true, length = 50)
    private String codigoUnico;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "id_responsable_tecnico")
    private Integer idResponsableTecnico;

    @Column(name = "estado_flujo", length = 50)
    private String estadoFlujo;

    @Column(name = "nivel_riesgo", length = 20)
    private String nivelRiesgo;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}

package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Controles de seguridad del registro técnico (RF-12), paso 3 del
 * formulario ("Controles de seguridad").
 */
@Entity
@Table(name = "seguridad")
@Getter
@Setter
@NoArgsConstructor
public class Seguridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguridad")
    private Integer idSeguridad;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", nullable = false, unique = true)
    private Sistema sistema;

    @Column(name = "tipo_control", length = 100)
    private String tipoControl = "CONTROL_DESPLIEGUE";

    @Column(name = "mecanismo_autenticacion", length = 100)
    private String mecanismoAutenticacion;

    @Column(name = "ssl_tls")
    private String sslTls;

    @Column(name = "metodo_autenticacion")
    private String metodoAutenticacion;

    private String mfa;

    private String logs;

    private String cifrado;

    @Column(name = "restriccion_ip")
    private String restriccionIp;

    @Column(name = "control_sesiones")
    private String controlSesiones;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (fechaCreacion == null) fechaCreacion = now;
        fechaActualizacion = now;
        if (tipoControl == null) tipoControl = "CONTROL_DESPLIEGUE";
        if (mecanismoAutenticacion == null) mecanismoAutenticacion = metodoAutenticacion;
    }

    @PreUpdate
    void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
        if (mecanismoAutenticacion == null) mecanismoAutenticacion = metodoAutenticacion;
    }
}

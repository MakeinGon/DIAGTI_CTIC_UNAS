package pe.edu.unas.ctic.diagti.administrador.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "auditoria")
public class AuditoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false, length = 100)
    private String modulo;

    @Column(nullable = false, length = 50)
    private String accion;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_evento", updatable = false)
    private LocalDateTime fechaEvento;

    @Column(name = "direccion_ip", length = 50)
    private String direccionIp;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "sesion_id", length = 100)
    private String sesionId;

    @PrePersist
    protected void onCreate() {
        if (fechaEvento == null) {
            fechaEvento = LocalDateTime.now();
        }
    }
}
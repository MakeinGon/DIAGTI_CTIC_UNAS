package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "seguridad_sistemas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeguridadEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sistema_id", nullable = false)
    private SistemaEntity sistema;
    
    private Boolean sslTls;
    private Boolean autenticacionActiva;
    private Boolean mfa;
    private Boolean logsActivos;
    private Boolean auditoriaActiva;
    private Boolean owaspCumple;
    private Boolean cifradoActivo;
    private Boolean controlAcceso;
    private Boolean restriccionIP;
    private Boolean controlSesiones;
    private Boolean backupSeguro;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
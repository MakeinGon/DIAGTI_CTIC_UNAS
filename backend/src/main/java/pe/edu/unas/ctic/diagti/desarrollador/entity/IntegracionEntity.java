package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity(name = "DesarrolladorIntegracionEntity")
@Table(name = "integraciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegracionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sistema_id", nullable = false)
    private SistemaEntity sistema;
    
    @Column(name = "sistema_origen")
    private String sistemaOrigen;
    
    @Column(name = "sistema_destino")
    private String sistemaDestino;
    
    private String protocolo;
    
    @Column(name = "metodo_intercambio")
    private String metodoIntercambio;
    
    private String frecuencia;
    private String estado;
    private String responsable;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    private Boolean eliminado = false;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (eliminado == null) eliminado = false;
        if (estado == null) estado = "ACTIVO";
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity(name = "DesarrolladorSistemaEntity")
@Table(name = "sistemas_informaticos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SistemaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String codigo;
    
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "tipo_aplicativo", nullable = false)
    private String tipoAplicativo;
    
    @Column(name = "area_usuaria")
    private String areaUsuaria;
    
    @Column(name = "responsable_funcional")
    private String responsableFuncional;
    
    @Column(name = "responsable_tecnico", nullable = false)
    private String responsableTecnico;
    
    @Column(nullable = false)
    private String estado; // BORRADOR, ENVIADO, OBSERVADO, SUBSANADO, VALIDADO, CERRADO
    
    @Column(nullable = false)
    private String criticidad; // BAJA, MEDIA, ALTA, CRITICA
    
    @Column(name = "anio_desarrollo")
    private Integer anioDesarrollo;
    
    @Column(name = "forma_adquisicion")
    private String formaAdquisicion;
    
    @Column(name = "empresa_desarrolladora")
    private String empresaDesarrolladora;
    
    @Column(name = "contrato_vigente")
    private Boolean contratoVigente;
    
    @Column(name = "fecha_vencimiento_soporte")
    private LocalDateTime fechaVencimientoSoporte;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "nivel_riesgo")
    private String nivelRiesgo; // BAJO, MEDIO, ALTO, CRITICO
    
    @Column(name = "puntaje_riesgo")
    private Integer puntajeRiesgo;
    
    @Column(name = "es_legacy")
    private Boolean esLegacy = false;
    
    // Auditoría
    @Column(name = "fecha_creacion", updatable = false)
    @CreationTimestamp
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    @UpdateTimestamp
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "usuario_creador")
    private String usuarioCreador;
    
    @Column(name = "usuario_modificador")
    private String usuarioModificador;
    
    @Column(name = "fecha_eliminacion")
    private LocalDateTime fechaEliminacion;
    
    @Column(name = "eliminado")
    private Boolean eliminado = false;
    
    // ============================================================
    // RELACIONES
    // ============================================================
    
    @OneToOne(mappedBy = "sistema", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private ArquitecturaEntity arquitectura;
    
    @OneToOne(mappedBy = "sistema", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private InfraestructuraEntity infraestructura;
    
    @OneToOne(mappedBy = "sistema", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private SeguridadEntity seguridad;
    
    @OneToMany(mappedBy = "sistema", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EvidenciaEntity> evidencias;
    
    @OneToMany(mappedBy = "sistema", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ValidacionEntity> validaciones;
    
    @OneToMany(mappedBy = "sistema", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<IntegracionEntity> integraciones;
    
    // ============================================================
    // MÉTODOS DE AUDITORÍA AUTOMÁTICOS
    // ============================================================
    
    @PrePersist
    protected void onCreate() {
        if (estado == null) estado = "BORRADOR";
        if (esLegacy == null) esLegacy = false;
        if (eliminado == null) eliminado = false;
        if (criticidad == null) criticidad = "MEDIA";
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
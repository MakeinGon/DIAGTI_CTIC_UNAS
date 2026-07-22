package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity(name = "DesarrolladorArquitecturaEntity")
@Table(name = "arquitecturas_software")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArquitecturaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sistema_id", nullable = false)
    private SistemaEntity sistema;
    
    @Column(name = "lenguaje_programacion")
    private String lenguajeProgramacion;
    
    @Column(name = "version_lenguaje")
    private String versionLenguaje;
    
    private String framework;
    
    @Column(name = "version_framework")
    private String versionFramework;
    
    private String arquitectura;
    
    @Column(name = "patron_diseno")
    private String patronDiseno;
    
    private String repositorio;
    
    @Column(name = "tecnologias_complementarias", columnDefinition = "TEXT")
    private String tecnologiasComplementarias;
    
    @Column(name = "motor_base_datos")
    private String motorBaseDatos;
    
    @Column(name = "version_base_datos")
    private String versionBaseDatos;
    
    @Column(name = "tipo_base_datos")
    private String tipoBaseDatos;
    
    @Column(name = "servidor_base_datos")
    private String servidorBaseDatos;
    
    @Column(name = "esquema_base_datos")
    private String esquemaBaseDatos;
    
    @Column(name = "backup_activo")
    private Boolean backupActivo;
    
    @Column(name = "frecuencia_backup")
    private String frecuenciaBackup;
    
    @Column(name = "cifrado_base_datos")
    private Boolean cifradoBaseDatos;
    
    @Column(name = "responsable_base_datos")
    private String responsableBaseDatos;
    
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
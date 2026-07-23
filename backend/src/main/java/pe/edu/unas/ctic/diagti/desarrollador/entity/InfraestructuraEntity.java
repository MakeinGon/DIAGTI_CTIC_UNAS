package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity(name = "DesarrolladorInfraestructuraEntity")
@Table(name = "infraestructura_tecnologica")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfraestructuraEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sistema_id", nullable = false)
    private SistemaEntity sistema;
    
    private String plataforma;
    private String tipoServidor;
    private String sistemaOperativo;
    private String versionSO;
    private String ip;
    private Integer puerto;
    private String dominio;
    private String subdominio;
    private String ambiente;
    private Boolean usoDocker;
    private Boolean dockerCompose;
    private Boolean proxmox;
    private String proxyReverso;
    private String servidorWeb;
    private String ciCd;
    private String mecanismoPublicacion;
    private String exposicion;
    private String ipPublica;
    private String ipPrivada;
    private String subdominioInstitucional;
    
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

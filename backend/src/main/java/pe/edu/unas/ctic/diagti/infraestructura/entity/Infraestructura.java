package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Registro técnico de Infraestructura (RF-09, RF-10, RF-11): pasos
 * "Infraestructura tecnológica" y "Despliegue y exposición" del formulario
 * frontend/pages/infraestructura/html/infraestructura.html, más el control
 * de flujo propio del módulo (Nuevo -> Borrador -> Enviado -> Observado ->
 * Corregido -> Enviado -> Validado).
 */
@Entity
@Table(name = "infraestructura")
@Getter
@Setter
@NoArgsConstructor
public class Infraestructura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_infraestructura")
    private Integer idInfraestructura;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", nullable = false, unique = true)
    private Sistema sistema;

    // Paso 1: Infraestructura tecnológica (RF-09)
    private String plataforma;

    @Column(name = "tipo_servidor")
    private String tipoServidor;

    @Column(name = "sistema_operativo")
    private String sistemaOperativo;

    @Column(name = "version_so")
    private String versionSo;

    @Column(name = "ip_privada")
    private String ipPrivada;

    private String proxmox;

    private String backup;

    @Column(name = "frecuencia_backup")
    private String frecuenciaBackup;

    @Column(name = "observaciones_infra")
    private String observacionesInfra;

    // Paso 2: Despliegue y exposición (RF-10, RF-11)
    private String ambiente;

    private String servidor;

    private Integer puerto;

    private String dominio;

    @Column(name = "servidor_web")
    private String servidorWeb;

    @Column(name = "proxy_reverso")
    private String proxyReverso;

    private String docker;

    @Column(name = "docker_compose")
    private String dockerCompose;

    private String exposicion;

    private String cicd;

    // Control de flujo del módulo
    @Column(name = "estado_registro", nullable = false)
    private String estadoRegistro = "Nuevo";

    @Column(name = "ultimo_paso", nullable = false)
    private Integer ultimoPaso = 0;

    @Column(name = "id_usuario_registro")
    private Integer idUsuarioRegistro;

    @Column(name = "capacidad_recursos")
    private String capacidadRecursos;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (fechaCreacion == null) fechaCreacion = now;
        fechaActualizacion = now;
        if (estadoRegistro == null) estadoRegistro = "Nuevo";
        if (ultimoPaso == null) ultimoPaso = 0;
    }

    @PreUpdate
    void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}

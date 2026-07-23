package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Declaración de base de datos por Desarrollo (tabla {@code base_datos_sistema}).
 * Independiente de la evaluación técnica de Infraestructura.
 */
@Data
@Entity(name = "DirectorBaseDatosSistemaEntity")
@Table(name = "base_datos_sistema")
public class BaseDatosSistemaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_base_datos")
    private Long idBaseDatos;

    @Column(name = "id_sistema", nullable = false, unique = true)
    private Long idSistema;

    @Column(length = 100)
    private String motor;

    @Column(name = "version_bd", length = 100)
    private String versionBd;

    @Column(name = "tipo_bd", length = 100)
    private String tipoBd;

    @Column(length = 255)
    private String servidor;

    @Column(length = 255)
    private String esquema;

    @Column(name = "backup_activo")
    private Boolean backupActivo;

    @Column(name = "frecuencia_backup", length = 100)
    private String frecuenciaBackup;

    @Column
    private Boolean cifrado;

    @Column(length = 255)
    private String responsable;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}

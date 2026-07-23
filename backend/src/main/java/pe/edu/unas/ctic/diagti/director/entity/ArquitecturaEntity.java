package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity(name = "DirectorArquitecturaEntity")
@Table(name = "arquitectura")
public class ArquitecturaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_arquitectura")
    private Long idArquitectura;

    @Column(name = "id_sistema", nullable = false)
    private Long idSistema;

    @Column(name = "tipo_arquitectura", nullable = false, length = 100)
    private String tipoArquitectura;

    @Column(name = "patron_arquitectonico", length = 100)
    private String patronArquitectonico;

    @Column(name = "descripcion_tecnica", columnDefinition = "TEXT")
    private String descripcionTecnica;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "lenguaje_programacion", length = 255)
    private String lenguajeProgramacion;

    @Column(name = "version_lenguaje", length = 100)
    private String versionLenguaje;

    @Column(length = 255)
    private String framework;

    @Column(name = "version_framework", length = 100)
    private String versionFramework;

    @Column(length = 500)
    private String repositorio;

    @Column(name = "tecnologias_complementarias", columnDefinition = "TEXT")
    private String tecnologiasComplementarias;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", insertable = false, updatable = false)
    private SistemaEntity sistema;
}
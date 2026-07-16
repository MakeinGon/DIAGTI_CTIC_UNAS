package pe.edu.unas.ctic.diagti.infraestructura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Evidencia técnica (RF-14). Se usa tanto para el paso 4 del registro
 * ("Evidencias técnicas", contexto=REGISTRO) como para las evidencias
 * adjuntadas al subsanar una observación (contexto=SUBSANACION).
 */
@Entity
@Table(name = "evidencias")
@Getter
@Setter
@NoArgsConstructor
public class Evidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evidencia")
    private Integer idEvidencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", nullable = false)
    private Sistema sistema;

    @Column(name = "tipo_evidencia", nullable = false, length = 100)
    private String tipoEvidencia;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "nombre_archivo")
    private String nombreArchivo;

    @Column(name = "ruta_archivo")
    private String rutaArchivo;

    @Column(name = "url_evidencia")
    private String urlEvidencia;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "tamano_archivo")
    private Long tamanoArchivo;

    @Column(name = "extension_archivo")
    private String extensionArchivo;

    @Column(name = "estado_evidencia")
    private String estadoEvidencia = "ACTIVA";

    @Column(name = "contexto", nullable = false, length = 30)
    private String contexto = "REGISTRO";

    @Column(name = "id_observacion")
    private Integer idObservacion;

    @Column(name = "fecha_carga")
    private LocalDateTime fechaCarga;

    @Column(name = "id_usuario_carga")
    private Integer idUsuarioCarga;

    @PrePersist
    void prePersist() {
        if (fechaCarga == null) fechaCarga = LocalDateTime.now();
        if (contexto == null) contexto = "REGISTRO";
        if (estadoEvidencia == null) estadoEvidencia = "ACTIVA";
    }
}

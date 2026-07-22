package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity(name = "DirectorEvidenciaEntity")
@Table(name = "evidencias")
public class EvidenciaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evidencia")
    private Long idEvidencia;

    @Column(name = "id_sistema", nullable = false)
    private Long idSistema;

    @Column(name = "tipo_evidencia", nullable = false, length = 100)
    private String tipoEvidencia;

    @Column(name = "nombre_archivo", length = 255)
    private String nombreArchivo;

    @Column(name = "ruta_archivo", length = 500)
    private String rutaArchivo;

    @Column(name = "url_evidencia", length = 500)
    private String urlEvidencia;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tamano_archivo")
    private Long tamanoArchivo;

    @Column(name = "extension_archivo", length = 20)
    private String extensionArchivo;

    @Column(name = "estado_evidencia", length = 50)
    private String estadoEvidencia;

    @Column(name = "fecha_carga")
    private LocalDateTime fechaCarga;

    @Column(name = "id_usuario_carga")
    private Long idUsuarioCarga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema", insertable = false, updatable = false)
    private SistemaEntity sistema;
}
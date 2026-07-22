package pe.edu.unas.ctic.diagti.desarrollador.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity(name = "DesarrolladorEvidenciaEntity")
@Table(name = "evidencias_tecnicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvidenciaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sistema_id", nullable = false)
    private SistemaEntity sistema;
    
    @Column(name = "tipo_evidencia")
    private String tipoEvidencia;
    
    @Column(name = "archivo_url")
    private String archivoUrl;
    
    @Column(name = "nombre_archivo")
    private String nombreArchivo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "es_obligatoria")
    private Boolean esObligatoria;
    
    @Column(name = "usuario_registra")
    private String usuarioRegistra;
    
    @Column(name = "fecha_carga", updatable = false)
    private LocalDateTime fechaCarga;
    
    private String estado;
    
    @Column(name = "fecha_eliminacion")
    private LocalDateTime fechaEliminacion;
    
    private Boolean eliminado = false;
    
    @PrePersist
    protected void onCreate() {
        fechaCarga = LocalDateTime.now();
        if (estado == null) estado = "ACTIVO";
        if (eliminado == null) eliminado = false;
        if (esObligatoria == null) esObligatoria = false;
    }
}
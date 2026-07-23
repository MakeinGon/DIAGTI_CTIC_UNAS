package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity(name = "DirectorSistemaEntity")
@Table(name = "sistemas")
public class SistemaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sistema")
    private Long idSistema;

    @Column(name = "codigo_unico", unique = true, nullable = false, length = 50)
    private String codigoUnico;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "id_area_usuario")
    private Long idAreaUsuario;

    @Column(name = "id_tipo_aplicativo")
    private Long idTipoAplicativo;

    @Column(name = "id_criticidad")
    private Long idCriticidad;

    @Column(name = "forma_adquisicion", length = 100)
    private String formaAdquisicion;

    @Column(name = "id_responsable_funcional")
    private Long idResponsableFuncional;

    @Column(name = "id_responsable_tecnico")
    private Long idResponsableTecnico;

    @Column(name = "ano_adquisicion")
    private Integer anoAdquisicion;

    @Column(name = "desarrollador_nombre", length = 255)
    private String desarrolladorNombre;

    @Column(name = "contrato_vigente")
    private Boolean contratoVigente = false;

    @Column(name = "fecha_vencimiento_soporte")
    private LocalDate fechaVencimientoSoporte;

    @Column(name = "es_legacy")
    private Boolean esLegacy = false;

    @Column(name = "estado_flujo", length = 50)
    private String estadoFlujo;

    @Column(name = "nivel_riesgo", length = 20)
    private String nivelRiesgo;

    @Column(name = "prioridad_migracion", length = 20)
    private String prioridadMigracion;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "fecha_eliminacion")
    private LocalDateTime fechaEliminacion;

    // ============================================
    // ✅ AGREGAR ESTOS MÉTODOS
    // ============================================
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    // Relaciones
    @OneToMany(mappedBy = "sistema", fetch = FetchType.LAZY)
    private List<ValidacionEntity> validaciones;

    @OneToMany(mappedBy = "sistema", fetch = FetchType.LAZY)
    private List<ObservacionEntity> observaciones;

    @OneToMany(mappedBy = "sistema", fetch = FetchType.LAZY)
    private List<ArquitecturaEntity> arquitecturas;

    @OneToMany(mappedBy = "sistema", fetch = FetchType.LAZY)
    private List<InfraestructuraEntity> infraestructuras;

    @OneToMany(mappedBy = "sistema", fetch = FetchType.LAZY)
    private List<SeguridadEntity> seguridades;

    @OneToMany(mappedBy = "sistema", fetch = FetchType.LAZY)
    private List<EvidenciaEntity> evidencias;

    // ... el resto de métodos existentes ...
    
    public String getEstadoValidacion() {
        if (estadoFlujo != null && !estadoFlujo.isBlank()) {
            String flujo = estadoFlujo.trim().toUpperCase()
                    .replace(' ', '_')
                    .replace('-', '_');
            String[] estadosValidos = {
                    "BORRADOR", "ENVIADO", "EN_VALIDACION", "OBSERVADO", "SUBSANADO",
                    "VALIDADO", "RECHAZADO", "CERRADO", "PENDIENTE"
            };
            for (String estado : estadosValidos) {
                if (estado.equals(flujo)) {
                    return estado;
                }
            }
        }

        if (validaciones == null || validaciones.isEmpty()) {
            return "PENDIENTE";
        }

        ValidacionEntity ultima = validaciones.stream()
                .max((v1, v2) -> {
                    java.time.LocalDateTime f1 = v1.getFechaValidacion() != null
                            ? v1.getFechaValidacion()
                            : v1.getFechaActualizacion() != null
                            ? v1.getFechaActualizacion()
                            : v1.getFechaCreacion();
                    java.time.LocalDateTime f2 = v2.getFechaValidacion() != null
                            ? v2.getFechaValidacion()
                            : v2.getFechaActualizacion() != null
                            ? v2.getFechaActualizacion()
                            : v2.getFechaCreacion();
                    if (f1 == null && f2 == null) {
                        return 0;
                    }
                    if (f1 == null) {
                        return -1;
                    }
                    if (f2 == null) {
                        return 1;
                    }
                    return f1.compareTo(f2);
                })
                .orElse(null);
        if (ultima == null || ultima.getEstadoValidacion() == null || ultima.getEstadoValidacion().isBlank()) {
            return "PENDIENTE";
        }
        return ultima.getEstadoValidacion().trim().toUpperCase();
    }

    public String getCriticidadNombre() {
        if (idCriticidad == null) return "NO ESPECIFICADA";
        return "NO ESPECIFICADA";
    }

    public String getAreaUsuarioNombre() {
        if (idAreaUsuario == null) return "NO ESPECIFICADA";
        return "NO ESPECIFICADA";
    }
}
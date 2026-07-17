package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
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

    // Relaciones (opcional, pero útiles para consultas)
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


    // Métodos helper para obtener estados calculados
    public String getEstadoValidacion() {
        if (validaciones == null || validaciones.isEmpty()) return "PENDIENTE";
        // Tomar la última validación por fecha
        ValidacionEntity ultima = validaciones.stream()
                .max((v1, v2) -> v1.getFechaValidacion().compareTo(v2.getFechaValidacion()))
                .orElse(null);
        if (ultima == null) return "PENDIENTE";
        return ultima.getEstadoValidacion().toUpperCase();
    }

    public String getCriticidadNombre() {
        if (idCriticidad == null) return "No especificada";
        // Como no tenemos el repositorio aquí, vamos a usar un enfoque diferente:
        // El mapper o el servicio se encargará de obtener el nombre.
        // Por ahora, devolvemos un valor por defecto, pero el mapper lo sobrescribirá.
        return "No especificada";
    }
}
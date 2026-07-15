package pe.edu.unas.ctic.diagti.validacion;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "validaciones")
public class Validacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del sistema es obligatorio")
    @Column(name = "sistema_nombre", nullable = false)
    private String sistemaNombre;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "aprobado|observado", message = "El estado debe ser aprobado u observado")
    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_accion", nullable = false)
    private LocalDateTime fechaAccion;

    @Column(length = 1000)
    private String observaciones;

    public Validacion() {
    }

    public Validacion(String sistemaNombre, String estado, LocalDateTime fechaAccion, String observaciones) {
        this.sistemaNombre = sistemaNombre;
        this.estado = estado;
        this.fechaAccion = fechaAccion;
        this.observaciones = observaciones;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSistemaNombre() {
        return sistemaNombre;
    }

    public void setSistemaNombre(String sistemaNombre) {
        this.sistemaNombre = sistemaNombre;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaAccion() {
        return fechaAccion;
    }

    public void setFechaAccion(LocalDateTime fechaAccion) {
        this.fechaAccion = fechaAccion;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}

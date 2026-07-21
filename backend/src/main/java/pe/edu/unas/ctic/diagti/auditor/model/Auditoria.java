package pe.edu.unas.ctic.diagti.auditor.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
public class Auditoria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;
    
    @Column(name = "id_usuario")
    private Long idUsuario;
    
    @Column(name = "modulo", nullable = false, length = 100)
    private String modulo;
    
    @Column(name = "accion", nullable = false, length = 50)
    private String accion;
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "fecha_evento")
    private LocalDateTime fechaEvento = LocalDateTime.now();
    
    @Column(name = "direccion_ip", length = 50)
    private String direccionIp;
    
    @Transient
    private String nombreUsuario;
    
    @Transient
    private String correoUsuario;
    
    // Getters y Setters
    public Long getIdAuditoria() {
        return idAuditoria;
    }
    
    public void setIdAuditoria(Long idAuditoria) {
        this.idAuditoria = idAuditoria;
    }
    
    public Long getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public String getModulo() {
        return modulo;
    }
    
    public void setModulo(String modulo) {
        this.modulo = modulo;
    }
    
    public String getAccion() {
        return accion;
    }
    
    public void setAccion(String accion) {
        this.accion = accion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public LocalDateTime getFechaEvento() {
        return fechaEvento;
    }
    
    public void setFechaEvento(LocalDateTime fechaEvento) {
        this.fechaEvento = fechaEvento;
    }
    
    public String getDireccionIp() {
        return direccionIp;
    }
    
    public void setDireccionIp(String direccionIp) {
        this.direccionIp = direccionIp;
    }
    
    public String getNombreUsuario() {
        return nombreUsuario;
    }
    
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }
    
    public String getCorreoUsuario() {
        return correoUsuario;
    }
    
    public void setCorreoUsuario(String correoUsuario) {
        this.correoUsuario = correoUsuario;
    }
}
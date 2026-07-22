package pe.edu.unas.ctic.diagti.director.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity(name = "DirectorIntegracionEntity")
@Table(name = "integraciones")
public class IntegracionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_integracion")
    private Long idIntegracion;

    @Column(name = "id_sistema_origen", nullable = false)
    private Long idSistemaOrigen;

    @Column(name = "id_sistema_destino", nullable = false)
    private Long idSistemaDestino;

    @Column(length = 50)
    private String protocolo;

    @Column(name = "metodo_intercambio", length = 100)
    private String metodoIntercambio;

    @Column(length = 50)
    private String frecuencia;

    @Column(length = 20)
    private String estado;

    @Column(name = "responsable_nombre", length = 255)
    private String responsableNombre;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema_origen", insertable = false, updatable = false)
    private SistemaEntity sistemaOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sistema_destino", insertable = false, updatable = false)
    private SistemaEntity sistemaDestino;
}
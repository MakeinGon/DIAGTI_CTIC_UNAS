package pe.edu.unas.ctic.diagti.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sistemas")
@Getter
@Setter
public class Sistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sistema")
    private Integer idSistema;

    @Column(name = "codigo_unico", nullable = false, unique = true, length = 50)
    private String codigoUnico;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_criticidad")
    private Catalogo criticidad;

    @Column(name = "es_legacy")
    private Boolean esLegacy;

    @Column(name = "nivel_riesgo", length = 20)
    private String nivelRiesgo;

    @Column(name = "fecha_eliminacion")
    private LocalDateTime fechaEliminacion;
}

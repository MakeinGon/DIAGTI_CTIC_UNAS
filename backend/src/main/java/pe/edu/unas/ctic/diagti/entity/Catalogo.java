package pe.edu.unas.ctic.diagti.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "catalogos")
@Getter
@Setter
public class Catalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_catalogo")
    private Integer idCatalogo;

    @Column(name = "tipo_catalogo", nullable = false, length = 50)
    private String tipoCatalogo;

    @Column(nullable = false, length = 20)
    private String codigo;

    @Column(nullable = false)
    private String valor;

    private String descripcion;

    private Boolean estado;

    private Integer orden;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}

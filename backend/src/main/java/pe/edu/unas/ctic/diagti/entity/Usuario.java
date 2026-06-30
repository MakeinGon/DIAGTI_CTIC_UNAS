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
@Table(name = "usuarios")
@Getter
@Setter
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(nullable = false, length = 150, unique = true)
    private String correo;

    @Column(nullable = false, length = 50, unique = true)
    private String username;

    @Column(name = "password_hash")
    private String passwordHash;

    private Boolean estado;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}

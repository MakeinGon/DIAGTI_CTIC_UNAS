package pe.edu.unas.ctic.diagti.administrador.entity;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * OJO: no se usa @Data aqui a proposito. @Data genera equals/hashCode/toString
 * sobre TODOS los campos, incluida la coleccion "usuarios" (lado inverso del
 * @ManyToMany). Eso provoca una recursion infinita Rol -> usuarios -> Usuario
 * -> roles -> Rol -> ... apenas una entidad entra a un HashSet/HashMap, y
 * termina en un StackOverflowError (que el navegador ve como un 400 vacio).
 * Por eso equals/hashCode se basan solo en el id, y toString excluye la
 * coleccion.
 */
@Getter
@Setter
@ToString(exclude = "usuarios")
@EqualsAndHashCode(of = "idRol")
@Entity
@Table(name = "roles")
public class RolEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long idRol;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    private String descripcion;

    private Boolean estado = true;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @ManyToMany(mappedBy = "roles")
    private Set<UsuarioEntity> usuarios = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
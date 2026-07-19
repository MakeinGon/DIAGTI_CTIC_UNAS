package pe.edu.unas.ctic.diagti.administrador.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "permisos", uniqueConstraints = @UniqueConstraint(columnNames = {"id_rol", "modulo"}))
public class PermisoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    private Long idPermiso;

    @Column(name = "id_rol", nullable = false)
    private Long idRol;

    @Column(nullable = false, length = 50)
    private String modulo;

    private Boolean ver = false;
    private Boolean crear = false;
    private Boolean editar = false;
    private Boolean eliminar = false;
    private Boolean validar = false;
    private Boolean exportar = false;
}
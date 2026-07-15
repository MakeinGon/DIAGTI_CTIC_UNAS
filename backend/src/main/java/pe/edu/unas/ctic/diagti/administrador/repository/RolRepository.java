package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import java.util.Optional;

public interface RolRepository extends JpaRepository<RolEntity, Long> {
    Optional<RolEntity> findByNombre(String nombre);
    boolean existsByNombre(String nombre);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM UsuarioEntity u JOIN u.roles r WHERE r.idRol = :rolId")
    boolean existsUsuariosByRolId(Long rolId);

    /**
     * Cuenta usuarios de un rol con una consulta directa, sin pasar por la
     * coleccion lazy RolEntity.usuarios (evita LazyInitializationException
     * cuando se llama fuera de una transaccion / con open-in-view=false).
     */
    @Query("SELECT COUNT(u) FROM UsuarioEntity u JOIN u.roles r WHERE r.idRol = :rolId")
    long contarUsuariosPorRol(Long rolId);

    /**
     * Quita este rol de todos los usuarios que lo tengan asignado (borra las
     * filas de la tabla puente usuarios_roles), sin tocar a los usuarios en
     * si. Se usa antes de eliminar el rol, para que "eliminar rol" cumpla lo
     * que la interfaz promete: "los usuarios quedaran sin asignacion".
     */
    @Modifying
    @Query(value = "DELETE FROM usuarios_roles WHERE id_rol = :rolId", nativeQuery = true)
    void desasignarUsuariosDelRol(Long rolId);
}
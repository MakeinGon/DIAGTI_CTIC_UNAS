package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long>, JpaSpecificationExecutor<UsuarioEntity> {
    Optional<UsuarioEntity> findByDni(String dni);
    boolean existsByDni(String dni);
    boolean existsByCorreo(String correo);
    boolean existsByUsername(String username);

    /**
     * Borra las filas de la tabla puente usuarios_roles para este usuario
     * antes de eliminarlo. No depende de que la FK de la base de datos
     * tenga ON DELETE CASCADE bien configurado (puede haber constraints
     * duplicadas generadas por Hibernate con ddl-auto=update que no
     * tengan cascada).
     */
    @Modifying
    @Query(value = "DELETE FROM usuarios_roles WHERE id_usuario = :idUsuario", nativeQuery = true)
    void desasignarRolesDelUsuario(Long idUsuario);
}
package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.edu.unas.ctic.diagti.administrador.entity.RolEntity;
import java.util.Optional;

public interface RolRepository extends JpaRepository<RolEntity, Long> {
    Optional<RolEntity> findByNombre(String nombre);
    boolean existsByNombre(String nombre);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM UsuarioEntity u JOIN u.roles r WHERE r.idRol = :rolId")
    boolean existsUsuariosByRolId(Long rolId);
}
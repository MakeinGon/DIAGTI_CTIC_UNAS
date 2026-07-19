package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.administrador.entity.PermisoEntity;
import java.util.List;
import java.util.Optional;

public interface PermisoRepository extends JpaRepository<PermisoEntity, Long> {
    List<PermisoEntity> findByIdRol(Long idRol);
    Optional<PermisoEntity> findByIdRolAndModulo(Long idRol, String modulo);
    void deleteByIdRol(Long idRol);
}
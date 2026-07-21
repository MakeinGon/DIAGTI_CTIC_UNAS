package pe.edu.unas.ctic.diagti.Login.repository;

import pe.edu.unas.ctic.diagti.Login.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoginRolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombre(String nombre);
}
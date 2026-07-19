package pe.edu.unas.ctic.diagti.Login.repository;

import pe.edu.unas.ctic.diagti.Login.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    
@Query("SELECT u FROM Usuario u WHERE u.username = :username AND u.estado = true")
Optional<Usuario> findActiveUserWithRoles(@Param("username") String username);

}
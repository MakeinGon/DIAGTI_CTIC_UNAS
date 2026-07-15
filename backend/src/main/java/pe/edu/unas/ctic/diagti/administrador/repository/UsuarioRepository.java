package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long>, JpaSpecificationExecutor<UsuarioEntity> {
    Optional<UsuarioEntity> findByDni(String dni);
    boolean existsByDni(String dni);
    boolean existsByCorreo(String correo);
    boolean existsByUsername(String username);
}
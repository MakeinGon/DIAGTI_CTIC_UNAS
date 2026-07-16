package pe.edu.unas.ctic.diagti.infraestructura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Sistema;

import java.util.Optional;

public interface SistemaRepository extends JpaRepository<Sistema, Integer> {
    Optional<Sistema> findByCodigoUnico(String codigoUnico);
}

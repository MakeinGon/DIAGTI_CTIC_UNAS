package pe.edu.unas.ctic.diagti.sistemas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.sistemas.model.Sistema;

@Repository
public interface SistemasSistemaRepository extends JpaRepository<Sistema, Long> {
}

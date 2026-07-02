package pe.edu.unas.ctic.diagti.validacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ValidacionRepository extends JpaRepository<Validacion, Long> {
}

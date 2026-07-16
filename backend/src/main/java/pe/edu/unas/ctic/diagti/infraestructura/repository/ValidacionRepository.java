package pe.edu.unas.ctic.diagti.infraestructura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Validacion;

import java.util.List;
import java.util.Optional;

public interface ValidacionRepository extends JpaRepository<Validacion, Integer> {
    List<Validacion> findBySistema_CodigoUnicoOrderByFechaCreacionDesc(String codigoUnico);
    Optional<Validacion> findFirstBySistema_CodigoUnicoOrderByFechaCreacionDesc(String codigoUnico);
}

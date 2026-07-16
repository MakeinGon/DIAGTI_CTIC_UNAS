package pe.edu.unas.ctic.diagti.infraestructura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.entity.HistorialInfraestructura;

import java.util.List;

public interface HistorialInfraestructuraRepository extends JpaRepository<HistorialInfraestructura, Integer> {
    List<HistorialInfraestructura> findAllByOrderByFechaEventoDesc();
}

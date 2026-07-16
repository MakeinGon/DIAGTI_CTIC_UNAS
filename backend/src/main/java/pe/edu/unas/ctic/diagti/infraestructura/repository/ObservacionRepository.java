package pe.edu.unas.ctic.diagti.infraestructura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Observacion;

import java.util.List;
import java.util.Optional;

public interface ObservacionRepository extends JpaRepository<Observacion, Integer> {
    List<Observacion> findBySistema_CodigoUnicoOrderByFechaObservacionDesc(String codigoUnico);
    Optional<Observacion> findFirstBySistema_CodigoUnicoAndEstadoObservacionOrderByFechaObservacionDesc(
            String codigoUnico, String estadoObservacion);
}

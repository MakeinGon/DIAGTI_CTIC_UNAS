package pe.edu.unas.ctic.diagti.infraestructura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Infraestructura;

import java.util.List;
import java.util.Optional;

public interface InfraestructuraRepository extends JpaRepository<Infraestructura, Integer> {
    Optional<Infraestructura> findBySistema_CodigoUnico(String codigoUnico);
    Optional<Infraestructura> findBySistema_IdSistema(Integer idSistema);
    List<Infraestructura> findAllByEstadoRegistroIn(List<String> estados);
}

package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.InfraestructuraEntity;
import java.util.List;

public interface DirectorInfraestructuraRepository extends JpaRepository<InfraestructuraEntity, Long> {
    List<InfraestructuraEntity> findByIdSistema(Long idSistema);
}

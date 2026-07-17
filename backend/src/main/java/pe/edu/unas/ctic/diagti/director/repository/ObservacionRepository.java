package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;
import java.util.List;

public interface ObservacionRepository extends JpaRepository<ObservacionEntity, Long> {
    List<ObservacionEntity> findByIdSistema(Long idSistema);
}
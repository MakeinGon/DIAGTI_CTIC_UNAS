package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.ValidacionEntity;
import java.util.List;

public interface ValidacionRepository extends JpaRepository<ValidacionEntity, Long> {
    List<ValidacionEntity> findByIdSistema(Long idSistema);  // ← Agregar este método
}
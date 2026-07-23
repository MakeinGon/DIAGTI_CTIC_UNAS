package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.IntegracionEntity;

import java.util.List;

public interface DirectorIntegracionRepository extends JpaRepository<IntegracionEntity, Long> {
    List<IntegracionEntity> findByIdSistemaOrigen(Long idSistemaOrigen);
}

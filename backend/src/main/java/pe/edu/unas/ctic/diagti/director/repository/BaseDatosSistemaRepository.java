package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.BaseDatosSistemaEntity;

import java.util.Optional;

public interface BaseDatosSistemaRepository extends JpaRepository<BaseDatosSistemaEntity, Long> {
    Optional<BaseDatosSistemaEntity> findByIdSistema(Long idSistema);
}

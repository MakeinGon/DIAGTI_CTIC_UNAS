package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesarrolladorValidacionRepository extends JpaRepository<ValidacionEntity, Long> {
    
    Optional<ValidacionEntity> findBySistemaIdAndEsUltimaTrue(Long sistemaId);
    
    List<ValidacionEntity> findBySistemaIdOrderByFechaValidacionDesc(Long sistemaId);
}
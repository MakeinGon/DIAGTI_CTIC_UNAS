package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ValidacionEntity;

import java.util.List;  // ✅ IMPORTANTE: Agregar este import
import java.util.Optional;

@Repository
public interface ValidacionRepository extends JpaRepository<ValidacionEntity, Long> {
    
    // ✅ Método para encontrar la última validación de un sistema
    Optional<ValidacionEntity> findBySistemaIdAndEsUltimaTrue(Long sistemaId);
    
    // ✅ Método para obtener todas las validaciones de un sistema (ordenadas por fecha)
    List<ValidacionEntity> findBySistemaIdOrderByFechaValidacionDesc(Long sistemaId);
}
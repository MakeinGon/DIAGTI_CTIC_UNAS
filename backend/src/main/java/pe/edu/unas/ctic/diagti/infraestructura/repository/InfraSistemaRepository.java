package pe.edu.unas.ctic.diagti.infraestructura.repository;

import pe.edu.unas.ctic.diagti.infraestructura.entity.InfraSistemaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InfraSistemaRepository extends JpaRepository<InfraSistemaEntity, Long> {
    
    List<InfraSistemaEntity> findByEstado(String estado);
    
    List<InfraSistemaEntity> findByNivelRiesgo(String nivelRiesgo);
    
    List<InfraSistemaEntity> findByEstadoAndNivelRiesgo(String estado, String nivelRiesgo);
}
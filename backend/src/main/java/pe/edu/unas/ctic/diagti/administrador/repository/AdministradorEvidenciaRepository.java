package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.edu.unas.ctic.diagti.director.entity.EvidenciaEntity;
import java.util.List;

public interface AdministradorEvidenciaRepository extends JpaRepository<EvidenciaEntity, Long> {
    List<EvidenciaEntity> findByIdSistema(Long idSistema);
    
    @Query("SELECT COUNT(e) FROM DirectorEvidenciaEntity e")
    long countTotal();
    
    @Query("SELECT COUNT(DISTINCT e.idSistema) FROM DirectorEvidenciaEntity e")
    long countSistemasConEvidencias();
    
    @Query("SELECT e.estadoEvidencia, COUNT(e) FROM DirectorEvidenciaEntity e GROUP BY e.estadoEvidencia")
    List<Object[]> countByEstado();
}

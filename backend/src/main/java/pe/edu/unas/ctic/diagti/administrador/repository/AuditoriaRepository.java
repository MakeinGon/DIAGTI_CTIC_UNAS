package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;
import java.util.List;

public interface AuditoriaRepository extends JpaRepository<AuditoriaEntity, Long> {
    List<AuditoriaEntity> findTop100ByOrderByFechaEventoDesc();

    List<AuditoriaEntity> findTop200ByModuloIgnoreCaseOrderByFechaEventoDesc(String modulo);
    
    @Query("SELECT COUNT(a) FROM AuditoriaEntity a")
    long countTotal();
    
    @Query("SELECT COUNT(DISTINCT a.modulo) FROM AuditoriaEntity a")
    long countModulos();
    
    @Query("SELECT COUNT(DISTINCT a.idUsuario) FROM AuditoriaEntity a WHERE a.idUsuario IS NOT NULL")
    long countUsuariosActivos();
}
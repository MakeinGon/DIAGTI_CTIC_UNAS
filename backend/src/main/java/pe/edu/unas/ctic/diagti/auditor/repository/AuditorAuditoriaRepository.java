package pe.edu.unas.ctic.diagti.auditor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.administrador.entity.AuditoriaEntity;

import java.util.List;

@Repository
public interface AuditorAuditoriaRepository extends JpaRepository<AuditoriaEntity, Long> {

    @Query("SELECT a FROM AuditoriaEntity a ORDER BY a.fechaEvento DESC")
    List<AuditoriaEntity> findAllOrderByFechaDesc();

    @Query("SELECT COUNT(a) FROM AuditoriaEntity a WHERE a.accion = 'Consulta'")
    long countConsultas();

    @Query("SELECT COUNT(a) FROM AuditoriaEntity a WHERE a.accion = 'Intento fallido'")
    long countIntentosFallidos();

    @Query("SELECT COUNT(a) FROM AuditoriaEntity a WHERE a.accion = 'Exportación'")
    long countExportaciones();
}

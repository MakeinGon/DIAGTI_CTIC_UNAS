package pe.edu.unas.ctic.diagti.validador.repository;

import pe.edu.unas.ctic.diagti.validador.entity.Validacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValidadorValidacionRepository extends JpaRepository<Validacion, Long> {

    @Query("SELECT v FROM ValidadorValidacion v WHERE v.idSistema = :idSistema ORDER BY v.fechaCreacion DESC")
    List<Validacion> findBySistemaIdSistema(@Param("idSistema") Long idSistema);

    @Query("""
            SELECT v FROM ValidadorValidacion v
            WHERE v.estadoValidacion IN ('PENDIENTE', 'SUBSANADO')
            ORDER BY v.fechaCreacion DESC
            """)
    List<Validacion> findPendientes();

    @Query("SELECT v FROM ValidadorValidacion v WHERE v.estadoValidacion = 'OBSERVADO' ORDER BY v.fechaActualizacion DESC")
    List<Validacion> findEnSubsanacion();

    @Query("SELECT v FROM ValidadorValidacion v WHERE v.estadoValidacion = 'VALIDADO' ORDER BY v.fechaValidacion DESC")
    List<Validacion> findValidados();

    @Query("SELECT COUNT(v) FROM ValidadorValidacion v WHERE v.estadoValidacion = :estado")
    Long countByEstadoValidacion(@Param("estado") String estado);

    @Query("""
            SELECT v FROM ValidadorValidacion v
            WHERE v.idSistema = :idSistema
              AND v.estadoValidacion IN ('PENDIENTE', 'OBSERVADO', 'SUBSANADO')
            ORDER BY v.fechaCreacion DESC
            """)
    List<Validacion> findActivasBySistema(@Param("idSistema") Long idSistema);

}

package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;

import java.util.List;
import java.util.Optional;

public interface DirectorSistemaRepository extends JpaRepository<SistemaEntity, Long>, JpaSpecificationExecutor<SistemaEntity> {

    @Query("""
            SELECT s FROM DirectorSistemaEntity s
            WHERE s.idResponsableTecnico = :idResponsable
              AND s.fechaEliminacion IS NULL
            ORDER BY s.fechaActualizacion DESC NULLS LAST, s.fechaCreacion DESC NULLS LAST
            """)
    List<SistemaEntity> findActivosByResponsableTecnico(@Param("idResponsable") Long idResponsable);

    @Query("""
            SELECT s FROM DirectorSistemaEntity s
            WHERE s.idSistema = :idSistema
              AND s.fechaEliminacion IS NULL
            """)
    Optional<SistemaEntity> findActivoById(@Param("idSistema") Long idSistema);

    Optional<SistemaEntity> findByCodigoUnicoAndFechaEliminacionIsNull(String codigoUnico);

    @Query("""
            SELECT s FROM DirectorSistemaEntity s
            WHERE s.fechaEliminacion IS NULL
            ORDER BY s.fechaActualizacion DESC NULLS LAST, s.fechaCreacion DESC NULLS LAST
            """)
    List<SistemaEntity> findAllActivos();
}

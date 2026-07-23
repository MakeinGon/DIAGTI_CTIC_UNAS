package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unas.ctic.diagti.director.entity.ObservacionEntity;

import java.util.Collection;
import java.util.List;

public interface ObservacionRepository extends JpaRepository<ObservacionEntity, Long> {

    List<ObservacionEntity> findByIdSistema(Long idSistema);

    List<ObservacionEntity> findByIdSistemaIn(Collection<Long> idsSistema);

    @Query("""
            SELECT o FROM ObservacionEntity o
            WHERE o.idSistema IN :ids
              AND UPPER(COALESCE(o.estadoObservacion, 'PENDIENTE')) = UPPER(:estado)
            """)
    List<ObservacionEntity> findBySistemasAndEstado(@Param("ids") Collection<Long> ids,
                                                    @Param("estado") String estado);

    long countByIdSistemaInAndEstadoObservacionIgnoreCase(Collection<Long> idsSistema, String estadoObservacion);
}

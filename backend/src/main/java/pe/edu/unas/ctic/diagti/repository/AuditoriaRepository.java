package pe.edu.unas.ctic.diagti.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unas.ctic.diagti.entity.Auditoria;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Integer> {

    @Query("""
            SELECT a FROM Auditoria a
            LEFT JOIN a.usuario u
            WHERE (:modulo IS NULL OR :modulo = '' OR a.modulo = :modulo)
              AND (:accion IS NULL OR :accion = '' OR a.accion = :accion)
              AND (
                    :busqueda IS NULL OR :busqueda = '' OR
                    LOWER(COALESCE(a.descripcion, '')) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR
                    LOWER(a.modulo) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR
                    LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                  )
            ORDER BY a.fechaEvento DESC
            """)
    Page<Auditoria> buscarConFiltros(
            @Param("modulo") String modulo,
            @Param("accion") String accion,
            @Param("busqueda") String busqueda,
            Pageable pageable);

    @Query("SELECT DISTINCT a.modulo FROM Auditoria a ORDER BY a.modulo")
    List<String> findDistinctModulos();

    @Query("SELECT DISTINCT a.accion FROM Auditoria a ORDER BY a.accion")
    List<String> findDistinctAcciones();

    @Query("""
            SELECT COUNT(a) FROM Auditoria a
            WHERE CAST(a.fechaEvento AS date) = CURRENT_DATE
            """)
    long countEventosHoy();

    @Query(value = """
            SELECT TO_CHAR(DATE(fecha_evento), 'DD Mon') AS fecha,
                   COUNT(*) AS total
            FROM auditoria
            WHERE fecha_evento >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(fecha_evento)
            ORDER BY DATE(fecha_evento)
            """, nativeQuery = true)
    List<Object[]> findActividadUltimos7Dias();
}

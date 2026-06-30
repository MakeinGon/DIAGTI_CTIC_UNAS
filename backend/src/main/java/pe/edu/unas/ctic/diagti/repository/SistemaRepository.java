package pe.edu.unas.ctic.diagti.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.edu.unas.ctic.diagti.entity.Sistema;

public interface SistemaRepository extends JpaRepository<Sistema, Integer> {

    @Query("""
            SELECT COUNT(s) FROM Sistema s
            WHERE s.fechaEliminacion IS NULL
            """)
    long countActivos();

    @Query("""
            SELECT COUNT(s) FROM Sistema s
            WHERE s.fechaEliminacion IS NULL AND UPPER(s.nivelRiesgo) = UPPER(:nivel)
            """)
    long countByNivelRiesgo(String nivel);

    @Query("""
            SELECT COUNT(s) FROM Sistema s
            WHERE s.fechaEliminacion IS NULL AND s.esLegacy = TRUE
            """)
    long countLegacy();

    @Query("""
            SELECT COALESCE(c.valor, 'Sin clasificar') AS criticidad, COUNT(s) AS total
            FROM Sistema s
            LEFT JOIN s.criticidad c
            WHERE s.fechaEliminacion IS NULL
            GROUP BY c.valor
            ORDER BY COUNT(s) DESC
            """)
    List<Object[]> countByCriticidad();
}

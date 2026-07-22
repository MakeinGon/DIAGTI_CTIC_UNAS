package pe.edu.unas.ctic.diagti.auditor.repository;

import pe.edu.unas.ctic.diagti.auditor.model.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditorAuditoriaRepository extends JpaRepository<Auditoria, Long> {

    // ✅ MÉTODO SIMPLE - TRAE TODOS LOS REGISTROS
    @Query("SELECT a FROM Auditoria a ORDER BY a.fechaEvento DESC")
    List<Auditoria> findAllOrderByFechaDesc();

    // ✅ MÉTODO CON FILTROS (SIMPLIFICADO)
    @Query("""
        SELECT a FROM Auditoria a 
        WHERE (:searchText IS NULL OR 
            LOWER(a.modulo) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
            LOWER(a.accion) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
            LOWER(a.descripcion) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
            LOWER(a.direccionIp) LIKE LOWER(CONCAT('%', :searchText, '%')))
        AND (:modulo IS NULL OR a.modulo = :modulo)
        AND (:accion IS NULL OR a.accion = :accion)
        AND (:fechaDesde IS NULL OR a.fechaEvento >= :fechaDesde)
        AND (:fechaHasta IS NULL OR a.fechaEvento <= :fechaHasta)
        ORDER BY a.fechaEvento DESC
    """)
    List<Auditoria> filtrarAuditoria(
        @Param("searchText") String searchText,
        @Param("modulo") String modulo,
        @Param("accion") String accion,
        @Param("fechaDesde") LocalDateTime fechaDesde,
        @Param("fechaHasta") LocalDateTime fechaHasta
    );

    @Query("SELECT COUNT(a) FROM Auditoria a WHERE a.accion = 'Consulta'")
    Long countConsultas();

    @Query("SELECT COUNT(a) FROM Auditoria a WHERE a.accion = 'Intento fallido'")
    Long countIntentosFallidos();

    @Query("SELECT COUNT(a) FROM Auditoria a WHERE a.accion = 'Exportación'")
    Long countExportaciones();
}
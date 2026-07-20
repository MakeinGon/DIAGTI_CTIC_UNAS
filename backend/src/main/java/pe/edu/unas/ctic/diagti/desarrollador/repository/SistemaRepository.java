package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pe.edu.unas.ctic.diagti.desarrollador.entity.SistemaEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface SistemaRepository extends JpaRepository<SistemaEntity, Long>, JpaSpecificationExecutor<SistemaEntity> {
    
    // ============================================================
    // BÚSQUEDAS BÁSICAS
    // ============================================================
    
    Optional<SistemaEntity> findByCodigo(String codigo);
    
    List<SistemaEntity> findByEstado(String estado);
    
    List<SistemaEntity> findByResponsableTecnico(String responsableTecnico);
    
    List<SistemaEntity> findByAreaUsuaria(String areaUsuaria);
    
    List<SistemaEntity> findByNivelRiesgo(String nivelRiesgo);
    
    List<SistemaEntity> findByEsLegacyTrue();
    
    List<SistemaEntity> findByEliminadoFalse();
    
    // ============================================================
    // BÚSQUEDAS CON MÚLTIPLES CONDICIONES
    // ============================================================
    
    @Query("SELECT s FROM SistemaEntity s WHERE s.responsableTecnico = :responsable AND s.eliminado = false")
    List<SistemaEntity> findByResponsableTecnicoAndEliminadoFalse(@Param("responsable") String responsable);
    
    @Query("SELECT s FROM SistemaEntity s WHERE s.responsableTecnico = :responsable AND s.estado = :estado AND s.eliminado = false")
    List<SistemaEntity> findByResponsableTecnicoAndEstadoAndEliminadoFalse(
            @Param("responsable") String responsable, 
            @Param("estado") String estado);
    
    @Query("SELECT s FROM SistemaEntity s WHERE s.eliminado = false AND s.estado = :estado")
    List<SistemaEntity> findActivosByEstado(@Param("estado") String estado);
    
    // ============================================================
    // CONTADORES
    // ============================================================
    
    @Query("SELECT COUNT(s) FROM SistemaEntity s WHERE s.eliminado = false")
    Long countActivos();
    
    @Query("SELECT COUNT(s) FROM SistemaEntity s WHERE s.eliminado = false AND s.esLegacy = true")
    Long countLegacy();
    
    @Query("SELECT COUNT(s) FROM SistemaEntity s WHERE s.eliminado = false AND s.responsableTecnico = :responsable")
    Long countByResponsableTecnico(@Param("responsable") String responsable);
    
    // ============================================================
    // AGRUPACIONES (para dashboards)
    // ============================================================
    
    @Query("SELECT s.areaUsuaria, COUNT(s) FROM SistemaEntity s WHERE s.eliminado = false GROUP BY s.areaUsuaria")
    List<Object[]> countByAreaUsuaria();
    
    @Query("SELECT s.nivelRiesgo, COUNT(s) FROM SistemaEntity s WHERE s.eliminado = false GROUP BY s.nivelRiesgo")
    List<Object[]> countByNivelRiesgo();
    
    @Query("SELECT s.estado, COUNT(s) FROM SistemaEntity s WHERE s.eliminado = false AND s.responsableTecnico = :responsable GROUP BY s.estado")
    List<Object[]> countByEstadoAndResponsable(@Param("responsable") String responsable);
}
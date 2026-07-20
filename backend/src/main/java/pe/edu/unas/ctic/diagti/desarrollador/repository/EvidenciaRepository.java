package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.desarrollador.entity.EvidenciaEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenciaRepository extends JpaRepository<EvidenciaEntity, Long> {
    
    /**
     * Busca todas las evidencias de un sistema (no eliminadas)
     */
    List<EvidenciaEntity> findBySistemaIdAndEliminadoFalse(Long sistemaId);
    
    /**
     * Busca todas las evidencias de un sistema por tipo
     */
    List<EvidenciaEntity> findBySistemaIdAndTipoEvidenciaAndEliminadoFalse(Long sistemaId, String tipoEvidencia);
    
    /**
     * Busca evidencias obligatorias de un sistema
     */
    @Query("SELECT e FROM EvidenciaEntity e WHERE e.sistema.id = :sistemaId AND e.esObligatoria = true AND e.eliminado = false")
    List<EvidenciaEntity> findObligatoriasBySistemaId(@Param("sistemaId") Long sistemaId);
    
    /**
     * Busca evidencias activas de un sistema
     */
    List<EvidenciaEntity> findBySistemaIdAndEstadoAndEliminadoFalse(Long sistemaId, String estado);
    
    /**
     * Cuenta las evidencias de un sistema (no eliminadas)
     */
    long countBySistemaIdAndEliminadoFalse(Long sistemaId);
    
    /**
     * Cuenta las evidencias obligatorias de un sistema
     */
    @Query("SELECT COUNT(e) FROM EvidenciaEntity e WHERE e.sistema.id = :sistemaId AND e.esObligatoria = true AND e.eliminado = false")
    long countObligatoriasBySistemaId(@Param("sistemaId") Long sistemaId);
    
    /**
     * Busca evidencias por URL (para verificar duplicados)
     */
    Optional<EvidenciaEntity> findByArchivoUrlAndSistemaIdAndEliminadoFalse(String archivoUrl, Long sistemaId);
    
    /**
     * Busca todas las evidencias de un usuario
     */
    List<EvidenciaEntity> findByUsuarioRegistraAndEliminadoFalse(String usuarioRegistra);
}
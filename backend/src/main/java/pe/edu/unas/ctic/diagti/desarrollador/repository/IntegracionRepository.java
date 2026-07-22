package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.desarrollador.entity.IntegracionEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface IntegracionRepository extends JpaRepository<IntegracionEntity, Long> {
    
    /**
     * Busca todas las integraciones de un sistema (no eliminadas)
     */
    List<IntegracionEntity> findBySistemaIdAndEliminadoFalse(Long sistemaId);
    
    /**
     * Busca integraciones activas de un sistema
     */
    List<IntegracionEntity> findBySistemaIdAndEstadoAndEliminadoFalse(Long sistemaId, String estado);
    
    /**
     * Busca integraciones por sistema destino
     */
    List<IntegracionEntity> findBySistemaDestinoAndEliminadoFalse(String sistemaDestino);
    
    /**
     * Busca integraciones por protocolo
     */
    List<IntegracionEntity> findByProtocoloAndEliminadoFalse(String protocolo);
    
    /**
     * Busca integraciones donde un sistema es origen o destino
     */
    @Query("SELECT i FROM DesarrolladorIntegracionEntity i WHERE (i.sistemaOrigen = :nombreSistema OR i.sistemaDestino = :nombreSistema) AND i.eliminado = false")
    List<IntegracionEntity> findBySistemaOrigenOrSistemaDestino(@Param("nombreSistema") String nombreSistema);
    
    /**
     * Cuenta las integraciones activas de un sistema
     */
    long countBySistemaIdAndEstadoAndEliminadoFalse(Long sistemaId, String estado);
    
    /**
     * Verifica si existe una integración entre dos sistemas
     */
    @Query("SELECT COUNT(i) > 0 FROM DesarrolladorIntegracionEntity i WHERE i.sistemaOrigen = :origen AND i.sistemaDestino = :destino AND i.eliminado = false")
    boolean existsBySistemaOrigenAndSistemaDestino(@Param("origen") String origen, @Param("destino") String destino);
}
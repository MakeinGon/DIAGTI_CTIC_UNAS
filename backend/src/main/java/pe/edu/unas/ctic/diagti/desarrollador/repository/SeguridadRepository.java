package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.desarrollador.entity.SeguridadEntity;

import java.util.List;
import java.util.Optional;

@Repository("desarrolladorSeguridadRepository")
public interface SeguridadRepository extends JpaRepository<SeguridadEntity, Long> {
    
    /**
     * Busca la seguridad asociada a un sistema específico
     */
    Optional<SeguridadEntity> findBySistemaId(Long sistemaId);
    
    /**
     * Verifica si existe seguridad para un sistema
     */
    boolean existsBySistemaId(Long sistemaId);
    
    /**
     * Elimina la seguridad asociada a un sistema
     */
    void deleteBySistemaId(Long sistemaId);
    
    /**
     * Busca sistemas que tienen SSL/TLS activo
     */
    @Query("SELECT s FROM DesarrolladorSeguridadEntity s WHERE s.sslTls = true")
    List<SeguridadEntity> findWithSSL();
    
    /**
     * Busca sistemas que tienen MFA activo
     */
    @Query("SELECT s FROM DesarrolladorSeguridadEntity s WHERE s.mfa = true")
    List<SeguridadEntity> findWithMFA();
    
    /**
     * Busca sistemas que tienen logs activos
     */
    @Query("SELECT s FROM DesarrolladorSeguridadEntity s WHERE s.logsActivos = true")
    List<SeguridadEntity> findWithLogs();
    
    /**
     * Busca sistemas que cumplen con OWASP
     */
    @Query("SELECT s FROM DesarrolladorSeguridadEntity s WHERE s.owaspCumple = true")
    List<SeguridadEntity> findWithOWASP();
    
    /**
     * Busca sistemas que NO tienen SSL/TLS (para alertas de seguridad)
     */
    @Query("SELECT s FROM DesarrolladorSeguridadEntity s WHERE s.sslTls = false OR s.sslTls IS NULL")
    List<SeguridadEntity> findWithoutSSL();
    
    /**
     * Busca sistemas que NO tienen backup seguro
     */
    @Query("SELECT s FROM DesarrolladorSeguridadEntity s WHERE s.backupSeguro = false OR s.backupSeguro IS NULL")
    List<SeguridadEntity> findWithoutBackup();
}

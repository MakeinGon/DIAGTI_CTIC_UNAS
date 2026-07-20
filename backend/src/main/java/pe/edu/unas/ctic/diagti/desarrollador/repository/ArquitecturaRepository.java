package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.desarrollador.entity.ArquitecturaEntity;

import java.util.Optional;

@Repository
public interface ArquitecturaRepository extends JpaRepository<ArquitecturaEntity, Long> {
    
    /**
     * Busca la arquitectura asociada a un sistema específico
     */
    Optional<ArquitecturaEntity> findBySistemaId(Long sistemaId);
    
    /**
     * Verifica si existe arquitectura para un sistema
     */
    boolean existsBySistemaId(Long sistemaId);
    
    /**
     * Elimina la arquitectura asociada a un sistema
     */
    void deleteBySistemaId(Long sistemaId);
}
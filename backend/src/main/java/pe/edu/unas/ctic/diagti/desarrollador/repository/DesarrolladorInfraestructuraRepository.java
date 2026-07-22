package pe.edu.unas.ctic.diagti.desarrollador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.desarrollador.entity.InfraestructuraEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesarrolladorInfraestructuraRepository extends JpaRepository<InfraestructuraEntity, Long> {
    
    /**
     * Busca la infraestructura asociada a un sistema específico
     */
    Optional<InfraestructuraEntity> findBySistemaId(Long sistemaId);
    
    /**
     * Verifica si existe infraestructura para un sistema
     */
    boolean existsBySistemaId(Long sistemaId);
    
    /**
     * Elimina la infraestructura asociada a un sistema
     */
    void deleteBySistemaId(Long sistemaId);
    
    /**
     * Busca sistemas por plataforma
     */
    List<InfraestructuraEntity> findByPlataforma(String plataforma);
    
    /**
     * Busca sistemas por ambiente
     */
    List<InfraestructuraEntity> findByAmbiente(String ambiente);
    
    /**
     * Busca sistemas que usan Docker
     */
    @Query("SELECT i FROM DesarrolladorInfraestructuraEntity i WHERE i.usoDocker = true")
    List<InfraestructuraEntity> findWithDocker();
    
    /**
     * Busca sistemas en Proxmox
     */
    @Query("SELECT i FROM DesarrolladorInfraestructuraEntity i WHERE i.proxmox = true")
    List<InfraestructuraEntity> findWithProxmox();
}

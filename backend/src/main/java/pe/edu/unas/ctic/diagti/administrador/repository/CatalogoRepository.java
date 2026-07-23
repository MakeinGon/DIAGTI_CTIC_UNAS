package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import java.util.List;
import java.util.Optional;

public interface CatalogoRepository extends JpaRepository<CatalogoEntity, Long> {

    // Trae TODOS los ítems del tipo (activos e inactivos), para que el admin
    // pueda ver y reactivar los inactivos en vez de que "desaparezcan".
    List<CatalogoEntity> findByTipoCatalogoOrderByOrdenAsc(String tipoCatalogo);

    // Se mantiene por si en el futuro se necesita una lista filtrada
    // (ej: para poblar selects de otras pantallas donde solo interesan los activos).
    List<CatalogoEntity> findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc(String tipoCatalogo);

    Optional<CatalogoEntity> findByTipoCatalogoAndCodigo(String tipoCatalogo, String codigo);
    boolean existsByTipoCatalogoAndCodigo(String tipoCatalogo, String codigo);
}
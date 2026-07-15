package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.administrador.entity.CatalogoEntity;
import java.util.List;
import java.util.Optional;

public interface CatalogoRepository extends JpaRepository<CatalogoEntity, Long> {

    // Solo devuelve ítems activos
    List<CatalogoEntity> findByTipoCatalogoAndEstadoTrueOrderByOrdenAsc(String tipoCatalogo);

    Optional<CatalogoEntity> findByTipoCatalogoAndCodigo(String tipoCatalogo, String codigo);
    boolean existsByTipoCatalogoAndCodigo(String tipoCatalogo, String codigo);
}
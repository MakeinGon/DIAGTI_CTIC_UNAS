package pe.edu.unas.ctic.diagti.sistemas.repository;

import pe.edu.unas.ctic.diagti.sistemas.model.Sistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ssSistemaRepository extends JpaRepository<Sistema, Long> {

    // ✅ MÉTODO SIMPLE - TRAER TODOS
    @Query("SELECT s FROM Sistema s ORDER BY s.idSistema DESC")
    List<Sistema> findAllOrderByIdDesc();

    @Query("""
        SELECT s FROM Sistema s 
        WHERE (:searchText IS NULL OR 
            LOWER(s.codigoUnico) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
            LOWER(s.nombre) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
            LOWER(s.descripcion) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
            LOWER(s.desarrolladorNombre) LIKE LOWER(CONCAT('%', :searchText, '%')))
        AND (:estado IS NULL OR s.estadoFlujo = :estado)
        AND (:riesgo IS NULL OR s.nivelRiesgo = :riesgo)
        AND (:legacy IS NULL OR s.esLegacy = :legacy)
        ORDER BY s.idSistema DESC
    """)
    List<Sistema> filtrarSistemas(
        @Param("searchText") String searchText,
        @Param("estado") String estado,
        @Param("riesgo") String riesgo,
        @Param("legacy") Boolean legacy
    );

    Long countByEsLegacyTrue();
    Long countByNivelRiesgoIn(List<String> riesgos);
    Long countByContratoVigenteTrue();
}
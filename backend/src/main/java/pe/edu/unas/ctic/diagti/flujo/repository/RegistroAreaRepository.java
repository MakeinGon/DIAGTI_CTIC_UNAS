package pe.edu.unas.ctic.diagti.flujo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.flujo.entity.RegistroArea;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroAreaRepository extends JpaRepository<RegistroArea, Long> {
    Optional<RegistroArea> findByCodigoSistemaIgnoreCaseAndAreaOrigenIgnoreCase(String codigoSistema, String areaOrigen);
    List<RegistroArea> findByAreaOrigenIgnoreCaseOrderByFechaActualizacionDesc(String areaOrigen);
    List<RegistroArea> findByAreaOrigenIgnoreCaseAndUsuarioOrigenIgnoreCaseOrderByFechaActualizacionDesc(
            String areaOrigen, String usuarioOrigen);
    long countByAreaOrigenIgnoreCaseAndEstadoIgnoreCase(String areaOrigen, String estado);
}

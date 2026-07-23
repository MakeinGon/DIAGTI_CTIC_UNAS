package pe.edu.unas.ctic.diagti.flujo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.unas.ctic.diagti.flujo.entity.SolicitudValidacion;
import java.util.List;
import java.util.Optional;

@Repository("flujoSolicitudValidacionRepository")
public interface SolicitudValidacionRepository extends JpaRepository<SolicitudValidacion, Long> {
    List<SolicitudValidacion> findByEstadoOrderByFechaEnvioDesc(String estado);

    Optional<SolicitudValidacion> findFirstByCodigoSistemaAndAreaOrigenAndEstadoOrderByFechaEnvioDesc(
            String codigoSistema, String areaOrigen, String estado);

    Optional<SolicitudValidacion> findFirstByCodigoSistemaAndAreaOrigenOrderByFechaEnvioDesc(
            String codigoSistema, String areaOrigen);

    List<SolicitudValidacion> findByAreaOrigenOrderByFechaEnvioDesc(String areaOrigen);

    List<SolicitudValidacion> findAllByOrderByFechaEnvioDesc();
}

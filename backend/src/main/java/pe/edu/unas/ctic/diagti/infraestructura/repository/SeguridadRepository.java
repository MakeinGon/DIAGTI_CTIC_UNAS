package pe.edu.unas.ctic.diagti.infraestructura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Seguridad;

import java.util.Optional;

public interface SeguridadRepository extends JpaRepository<Seguridad, Integer> {
    Optional<Seguridad> findBySistema_CodigoUnico(String codigoUnico);
    Optional<Seguridad> findBySistema_IdSistema(Integer idSistema);
}

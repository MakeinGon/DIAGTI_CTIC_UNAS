package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.SeguridadEntity;
import java.util.List;

public interface DirectorSeguridadRepository extends JpaRepository<SeguridadEntity, Long> {
    List<SeguridadEntity> findByIdSistema(Long idSistema);  // ← Agregar este método
}

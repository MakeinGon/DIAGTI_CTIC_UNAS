package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.EvidenciaEntity;

import java.util.List;

public interface DirectorEvidenciaRepository extends JpaRepository<EvidenciaEntity, Long> {
    List<EvidenciaEntity> findByIdSistema(Long idSistema);
}

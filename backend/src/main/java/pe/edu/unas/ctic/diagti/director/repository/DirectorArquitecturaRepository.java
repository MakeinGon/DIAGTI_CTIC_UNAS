package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.director.entity.ArquitecturaEntity;

import java.util.List;

public interface DirectorArquitecturaRepository extends JpaRepository<ArquitecturaEntity, Long> {
    List<ArquitecturaEntity> findByIdSistema(Long idSistema);
}

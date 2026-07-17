package pe.edu.unas.ctic.diagti.director.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;

public interface SistemaRepository extends JpaRepository<SistemaEntity, Long>, JpaSpecificationExecutor<SistemaEntity> {
}
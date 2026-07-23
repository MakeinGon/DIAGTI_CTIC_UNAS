package pe.edu.unas.ctic.diagti.administrador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;

public interface SistemaAdminRepository extends JpaRepository<SistemaEntity, Long>, JpaSpecificationExecutor<SistemaEntity> {
}
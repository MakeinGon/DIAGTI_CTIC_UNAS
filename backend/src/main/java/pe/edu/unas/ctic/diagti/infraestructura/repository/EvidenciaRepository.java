package pe.edu.unas.ctic.diagti.infraestructura.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unas.ctic.diagti.infraestructura.entity.Evidencia;

import java.util.List;

public interface EvidenciaRepository extends JpaRepository<Evidencia, Integer> {
    List<Evidencia> findBySistema_CodigoUnicoAndContexto(String codigoUnico, String contexto);
    List<Evidencia> findByIdObservacion(Integer idObservacion);
    List<Evidencia> findBySistema_CodigoUnico(String codigoUnico);
}

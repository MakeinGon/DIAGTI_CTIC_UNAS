package pe.edu.unas.ctic.diagti.validador.repository;

import pe.edu.unas.ctic.diagti.validador.entity.Validador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ValidadorRepository extends JpaRepository<Validador, Long> {
    Optional<Validador> findByUsername(String username);
}
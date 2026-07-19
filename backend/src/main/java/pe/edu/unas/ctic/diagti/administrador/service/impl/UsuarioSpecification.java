package pe.edu.unas.ctic.diagti.administrador.service.impl;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.unas.ctic.diagti.administrador.entity.UsuarioEntity;

public class UsuarioSpecification {

    public static Specification<UsuarioEntity> search(String term) {
        return (root, query, cb) -> {
            if (term == null || term.isEmpty()) return cb.conjunction();
            String like = "%" + term.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("nombres")), like),
                cb.like(cb.lower(root.get("apellidos")), like),
                cb.like(cb.lower(root.get("correo")), like),
                cb.like(root.get("dni"), like)
            );
        };
    }

    public static Specification<UsuarioEntity> rolEquals(Long rolId) {
        return (root, query, cb) -> {
            if (rolId == null) return cb.conjunction();
            return cb.equal(root.join("roles").get("idRol"), rolId);
        };
    }

    public static Specification<UsuarioEntity> estadoEquals(Boolean estado) {
        return (root, q, cb) -> estado == null ? cb.conjunction() : cb.equal(root.get("estado"), estado);
    }

    public static Specification<UsuarioEntity> origenEquals(String origen) {
        return (root, q, cb) -> origen == null || origen.isEmpty() ? cb.conjunction() : cb.equal(root.get("origen"), origen);
    }
}
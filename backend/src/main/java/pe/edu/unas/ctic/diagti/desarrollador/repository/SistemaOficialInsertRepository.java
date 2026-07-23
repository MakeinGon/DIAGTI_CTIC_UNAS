package pe.edu.unas.ctic.diagti.desarrollador.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

/**
 * Inserción nativa en tabla oficial {@code sistemas}, compatible con
 * coexistencia Hibernate (id_sistema e id con el mismo nextval).
 */
@Repository
public class SistemaOficialInsertRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Long insertar(
            String codigoUnico,
            String nombre,
            String descripcion,
            Long idAreaUsuario,
            Long idTipoAplicativo,
            Long idCriticidad,
            String areaUsuaria,
            String tipoAplicativo,
            String formaAdquisicion,
            Long idResponsableTecnico,
            Integer anoAdquisicion,
            String desarrolladorNombre,
            Boolean contratoVigente,
            LocalDate fechaVencimientoSoporte,
            Boolean esLegacy,
            String estadoFlujo,
            String nivelRiesgo,
            String prioridadMigracion
    ) {
        Query query = entityManager.createNativeQuery("""
                WITH nuevo AS (
                    SELECT nextval('sistemas_id_sistema_seq') AS valor
                )
                INSERT INTO sistemas (
                    id_sistema,
                    id,
                    codigo_unico,
                    codigo,
                    nombre,
                    descripcion,
                    id_area_usuario,
                    id_tipo_aplicativo,
                    id_criticidad,
                    area_usuaria,
                    tipo_aplicativo,
                    forma_adquisicion,
                    id_responsable_funcional,
                    id_responsable_tecnico,
                    ano_adquisicion,
                    desarrollador_nombre,
                    contrato_vigente,
                    fecha_vencimiento_soporte,
                    es_legacy,
                    estado_flujo,
                    estado,
                    nivel_riesgo,
                    prioridad_migracion,
                    fecha_creacion,
                    fecha_actualizacion
                )
                SELECT
                    n.valor,
                    n.valor,
                    :codigoUnico,
                    :codigoUnico,
                    :nombre,
                    :descripcion,
                    :idArea,
                    :idTipo,
                    :idCrit,
                    :areaUsuaria,
                    :tipoAplicativo,
                    :formaAdq,
                    NULL,
                    :idTecnico,
                    :ano,
                    :devNombre,
                    :contrato,
                    :fechaSoporte,
                    :legacy,
                    :estadoFlujo,
                    :estadoFlujo,
                    :riesgo,
                    :prioridad,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                FROM nuevo n
                RETURNING id_sistema
                """);

        query.setParameter("codigoUnico", codigoUnico);
        query.setParameter("nombre", nombre);
        query.setParameter("descripcion", descripcion);
        query.setParameter("idArea", idAreaUsuario);
        query.setParameter("idTipo", idTipoAplicativo);
        query.setParameter("idCrit", idCriticidad);
        query.setParameter("areaUsuaria", areaUsuaria);
        query.setParameter("tipoAplicativo", tipoAplicativo);
        query.setParameter("formaAdq", formaAdquisicion);
        query.setParameter("idTecnico", idResponsableTecnico);
        query.setParameter("ano", anoAdquisicion);
        query.setParameter("devNombre", desarrolladorNombre);
        query.setParameter("contrato", contratoVigente != null ? contratoVigente : Boolean.FALSE);
        query.setParameter("fechaSoporte", fechaVencimientoSoporte);
        query.setParameter("legacy", esLegacy != null ? esLegacy : Boolean.FALSE);
        query.setParameter("estadoFlujo", estadoFlujo);
        query.setParameter("riesgo", nivelRiesgo);
        query.setParameter("prioridad", prioridadMigracion);

        Object result = query.getSingleResult();
        return ((Number) result).longValue();
    }
}

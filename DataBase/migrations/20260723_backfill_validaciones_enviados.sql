-- =============================================================================
-- DIAGTI · Regularización: sistemas ENVIADO sin fila en validaciones
-- Archivo: 20260723_backfill_validaciones_enviados.sql
-- Idempotente: seguro de reejecutar (NOT EXISTS por id_sistema).
-- No modifica BORRADOR, OBSERVADO, VALIDADO ni RECHAZADO.
-- No inserta id_validacion manualmente.
-- =============================================================================

BEGIN;

INSERT INTO validaciones (
    id_sistema,
    id_validador,
    estado_validacion,
    resultado,
    observacion_general,
    fecha_creacion,
    fecha_actualizacion
)
SELECT
    s.id_sistema,
    NULL,
    'PENDIENTE',
    'PENDIENTE',
    'Validación inicial creada por regularización de sistemas enviados.',
    NOW(),
    NOW()
FROM sistemas s
WHERE UPPER(COALESCE(s.estado_flujo, '')) = 'ENVIADO'
  AND UPPER(COALESCE(s.estado, '')) = 'ENVIADO'
  AND s.fecha_eliminacion IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM validaciones v
      WHERE v.id_sistema = s.id_sistema
  );

COMMIT;

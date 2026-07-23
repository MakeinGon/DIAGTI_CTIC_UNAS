-- ============================================================
-- DIAGTI · Datos de prueba idempotentes para módulo Validación
-- SOLO tablas oficiales. NO EJECUTAR automáticamente.
-- ============================================================
-- Tablas afectadas:
--   sistemas, validaciones, observaciones, auditoria
-- Columnas clave:
--   sistemas(codigo_unico, id_responsable_tecnico, estado_flujo, ...)
--   validaciones(id_sistema, estado_validacion, resultado, ...)
--   observaciones(id_sistema, id_validacion, descripcion, estado_observacion, ...)
--   auditoria(id_usuario, modulo, accion, descripcion)
-- ============================================================

BEGIN;

-- 1) Sistema asignado al desarrollador 71234567
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_responsable_tecnico, ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-VAL-001',
    'Sistema Prueba Validación',
    'Sistema de prueba para flujo Desarrollador ↔ Validación.',
    'Desarrollo CTIC',
    u.id_usuario,
    2026,
    'CTIC UNAS',
    false,
    false,
    'ENVIADO',
    'MEDIO',
    'CORTO PLAZO'
FROM usuarios u
WHERE u.username = '71234567'
  AND NOT EXISTS (SELECT 1 FROM sistemas s WHERE s.codigo_unico = 'SYS-VAL-001');

-- 2) Validación pendiente del mismo sistema
INSERT INTO validaciones (
    id_sistema, id_validador, estado_validacion, resultado,
    observacion_general, fecha_creacion, fecha_actualizacion
)
SELECT
    s.id_sistema,
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    'PENDIENTE',
    'PENDIENTE',
    'Sistema enviado a validación (dato de prueba).',
    NOW(),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-VAL-001'
  AND NOT EXISTS (
      SELECT 1 FROM validaciones v
      WHERE v.id_sistema = s.id_sistema
        AND v.estado_validacion IN ('PENDIENTE', 'OBSERVADO', 'SUBSANADO')
  );

-- 3) Observación de Validación (PENDIENTE)
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    id_usuario_observa, fecha_observacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[VALIDACION] Documentación — Falta manual técnico actualizado.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-VAL-001'
  AND v.estado_validacion IN ('PENDIENTE', 'OBSERVADO', 'SUBSANADO')
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[VALIDACION] Documentación%'
  );

-- 4) Observación de Infraestructura (PENDIENTE)
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    id_usuario_observa, fecha_observacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[INFRAESTRUCTURA] Backup — No se evidencia política de respaldo.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-VAL-001'
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[INFRAESTRUCTURA] Backup%'
  );

-- 5) Observación de Funcional (PENDIENTE)
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    id_usuario_observa, fecha_observacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[FUNCIONAL] Flujos — El caso de uso de matrícula está incompleto.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-VAL-001'
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[FUNCIONAL] Flujos%'
  );

-- 6) Observación atendida (histórico)
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    respuesta_subsanacion, id_usuario_observa, id_usuario_subsana,
    fecha_observacion, fecha_subsanacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[VALIDACION] Evidencias — Se solicitó certificado SSL (cerrada).',
    'ATENDIDA',
    'Se adjuntó certificado vigente.',
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-VAL-001'
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[VALIDACION] Evidencias%'
  );

-- 7) Auditoría compatible
INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, fecha_evento)
SELECT
    u.id_usuario,
    'Validación',
    'Datos de prueba',
    'Carga idempotente de SYS-VAL-001 para pruebas de validación.',
    NOW()
FROM usuarios u
WHERE u.username = '74331380'
  AND NOT EXISTS (
      SELECT 1 FROM auditoria a
      WHERE a.descripcion = 'Carga idempotente de SYS-VAL-001 para pruebas de validación.'
  );

COMMIT;

-- ============================================================
-- Consultas de comprobación
-- ============================================================
-- SELECT id_sistema, codigo_unico, estado_flujo, id_responsable_tecnico
-- FROM sistemas WHERE codigo_unico = 'SYS-VAL-001';
--
-- SELECT id_validacion, id_sistema, estado_validacion
-- FROM validaciones v
-- JOIN sistemas s ON s.id_sistema = v.id_sistema
-- WHERE s.codigo_unico = 'SYS-VAL-001';
--
-- SELECT id_observacion, estado_observacion, descripcion
-- FROM observaciones o
-- JOIN sistemas s ON s.id_sistema = o.id_sistema
-- WHERE s.codigo_unico = 'SYS-VAL-001';
--
-- Resultado esperado:
-- Desarrollador: ve SYS-VAL-001 con observaciones PENDIENTES (no ATENDIDA).
-- Validación: ve validación PENDIENTE/listado + detalle con 3 obs abiertas + 1 atendida.
-- Director/Auditor: mismo id_sistema / estados oficiales en tablas compartidas.

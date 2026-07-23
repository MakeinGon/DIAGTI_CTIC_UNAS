-- ============================================================
-- DIAGTI · Datos de prueba idempotentes para módulo DIRECTOR
-- SOLO tablas oficiales. NO EJECUTAR automáticamente.
-- ============================================================
-- Tablas afectadas:
--   sistemas, validaciones, observaciones, infraestructura,
--   seguridad, auditoria, catalogos (solo lectura de IDs)
-- ============================================================
-- Consultas de verificación sugeridas:
--   SELECT codigo_unico, estado_flujo, nivel_riesgo FROM sistemas
--     WHERE codigo_unico LIKE 'SYS-DIR-%';
--   SELECT COUNT(*) FROM validaciones v
--     JOIN sistemas s ON s.id_sistema = v.id_sistema
--     WHERE s.codigo_unico LIKE 'SYS-DIR-%';
--   SELECT origen_estimado, COUNT(*) FROM (
--     SELECT CASE
--       WHEN descripcion LIKE '[VALIDACION]%' THEN 'VALIDACION'
--       WHEN descripcion LIKE '[INFRAESTRUCTURA]%' THEN 'INFRAESTRUCTURA'
--       ELSE 'OTRO' END AS origen_estimado
--     FROM observaciones o JOIN sistemas s ON s.id_sistema = o.id_sistema
--     WHERE s.codigo_unico LIKE 'SYS-DIR-%'
--   ) x GROUP BY 1;
-- Resultados esperados en Dashboard:
--   total >= 3; al menos 1 OBSERVADO, 1 VALIDADO, 1 ENVIADO/PENDIENTE
-- Riesgos: al menos 1 sistema con nivel advertencia/critico
-- Reportes: inventario con 3 filas SYS-DIR-*
-- ============================================================

BEGIN;

-- Catálogos (solo referencia; no inserta si ya existen)
-- AREA_USUARIO / CRITICIDAD / TIPO_APLICATIVO se leen por código.

-- 1) Sistema PENDIENTE / ENVIADO
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_area_usuario, id_tipo_aplicativo, id_criticidad,
    id_responsable_tecnico, id_responsable_funcional,
    ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-DIR-PEND',
    'Director · Sistema Pendiente',
    'Sistema de prueba Director en estado ENVIADO.',
    'Desarrollo CTIC',
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ACAD' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'MEDIO' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '73456789' LIMIT 1),
    2026, 'CTIC UNAS', false, false, 'ENVIADO', 'MEDIO', 'CORTO PLAZO'
WHERE NOT EXISTS (SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-DIR-PEND');

-- 2) Sistema OBSERVADO
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_area_usuario, id_tipo_aplicativo, id_criticidad,
    id_responsable_tecnico, id_responsable_funcional,
    ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-DIR-OBS',
    'Director · Sistema Observado',
    'Sistema de prueba Director observado.',
    'Desarrollo CTIC',
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ADMIN' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'ALTO' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '73456789' LIMIT 1),
    2025, 'CTIC UNAS', false, false, 'OBSERVADO', 'ALTO', 'INMEDIATO'
WHERE NOT EXISTS (SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-DIR-OBS');

-- 3) Sistema VALIDADO
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_area_usuario, id_tipo_aplicativo, id_criticidad,
    id_responsable_tecnico, id_responsable_funcional,
    ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-DIR-OK',
    'Director · Sistema Validado',
    'Sistema de prueba Director validado.',
    'Desarrollo CTIC',
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'FIN' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'CLOUD' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'BAJO' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '73456789' LIMIT 1),
    2024, 'CTIC UNAS', true, false, 'VALIDADO', 'BAJO', 'LARGO PLAZO'
WHERE NOT EXISTS (SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-DIR-OK');

-- Validaciones relacionadas
INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, resultado, observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion)
SELECT s.id_sistema,
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       'PENDIENTE', 'PENDIENTE', 'Enviado a validación (Director test).',
       NULL, NOW(), NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-DIR-PEND'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, resultado, observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion)
SELECT s.id_sistema,
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       'OBSERVADO', 'OBSERVADO', 'Observado en validación (Director test).',
       NOW(), NOW(), NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-DIR-OBS'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema AND v.estado_validacion = 'OBSERVADO');

INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, resultado, observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion)
SELECT s.id_sistema,
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       'APROBADO', 'VALIDADO', 'Validado (Director test).',
       NOW(), NOW(), NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-DIR-OK'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema AND v.resultado = 'VALIDADO');

-- Observaciones [VALIDACION] e [INFRAESTRUCTURA] sobre sistema observado
INSERT INTO observaciones (id_sistema, id_validacion, descripcion, estado_observacion, id_usuario_observa, fecha_observacion)
SELECT s.id_sistema, v.id_validacion,
       '[VALIDACION] Arquitectura — Falta diagrama de componentes actualizado.',
       'PENDIENTE',
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-DIR-OBS'
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[VALIDACION] Arquitectura%'
  );

INSERT INTO observaciones (id_sistema, id_validacion, descripcion, estado_observacion, id_usuario_observa, fecha_observacion)
SELECT s.id_sistema, v.id_validacion,
       '[INFRAESTRUCTURA] Disponibilidad — No se evidencia plan de continuidad.',
       'PENDIENTE',
       (SELECT id_usuario FROM usuarios WHERE username = '74567890' LIMIT 1),
       NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-DIR-OBS'
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[INFRAESTRUCTURA] Disponibilidad%'
  );

-- Infraestructura del sistema observado
INSERT INTO infraestructura (id_sistema, capacidad_recursos, fecha_creacion)
SELECT s.id_sistema,
       '{"estadoEvaluacion":"OBSERVADO","servidor":"VM-TEST","backup":false}',
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-DIR-OBS'
  AND NOT EXISTS (SELECT 1 FROM infraestructura i WHERE i.id_sistema = s.id_sistema);

INSERT INTO infraestructura (id_sistema, capacidad_recursos, fecha_creacion)
SELECT s.id_sistema,
       '{"estadoEvaluacion":"APROBADO","servidor":"CLOUD-OK","backup":true}',
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-DIR-OK'
  AND NOT EXISTS (SELECT 1 FROM infraestructura i WHERE i.id_sistema = s.id_sistema);

-- Seguridad básica (SSL) solo en validado
INSERT INTO seguridad (id_sistema, tipo_control, mecanismo_autenticacion, fecha_creacion)
SELECT s.id_sistema, 'SSL/TLS', 'LDAP/Local', NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-DIR-OK'
  AND NOT EXISTS (SELECT 1 FROM seguridad x WHERE x.id_sistema = s.id_sistema);

-- Auditoría compatible
INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '72345678' LIMIT 1),
    'DIRECTOR',
    'CONSULTA_PRUEBA',
    'Preparación de datos de prueba Director para SYS-DIR-OBS',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'DIRECTOR'
      AND a.descripcion LIKE '%SYS-DIR-OBS%'
);

COMMIT;

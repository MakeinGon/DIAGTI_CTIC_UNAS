-- ============================================================
-- DIAGTI · Datos de prueba idempotentes para módulo AUDITOR
-- SOLO tablas oficiales. NO EJECUTAR automáticamente.
-- ============================================================
-- Tablas afectadas:
--   sistemas, validaciones, observaciones, infraestructura,
--   evidencias, auditoria, catalogos (solo lectura de IDs),
--   usuarios (solo lectura de IDs)
-- Columnas utilizadas:
--   sistemas: codigo_unico, nombre, descripcion, forma_adquisicion,
--             id_area_usuario, id_tipo_aplicativo, id_criticidad,
--             id_responsable_tecnico, id_responsable_funcional,
--             ano_adquisicion, desarrollador_nombre, contrato_vigente,
--             es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
--   validaciones: id_sistema, id_validador, estado_validacion, resultado
--   observaciones: id_sistema, id_validacion, descripcion, estado_observacion
--   infraestructura: id_sistema, capacidad_recursos
--   evidencias: id_sistema, tipo_evidencia, nombre_archivo, estado_evidencia
--   auditoria: id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento
-- ============================================================
-- Registros esperados:
--   SYS-AUD-PEND (PENDIENTE), SYS-AUD-OBS (OBSERVADO), SYS-AUD-OK (VALIDADO)
--   1 validación por sistema; obs [VALIDACION] e [INFRAESTRUCTURA] en OBS
--   infraestructura + evidencia en OBS/OK; 2+ filas auditoria con ip_origen
-- ============================================================
-- Consultas de verificación:
--   SELECT codigo_unico, estado_flujo, nivel_riesgo FROM sistemas
--     WHERE codigo_unico LIKE 'SYS-AUD-%';
--   SELECT COUNT(*) FROM observaciones o
--     JOIN sistemas s ON s.id_sistema = o.id_sistema
--     WHERE s.codigo_unico LIKE 'SYS-AUD-%';
--   SELECT modulo, accion, direccion_ip FROM auditoria
--     WHERE descripcion LIKE '%SYS-AUD-%';
-- Resultados esperados:
--   Inventario: >= 3 sistemas SYS-AUD-*
--   Auditoría: >= 2 eventos con IP
--   Reportes: totalSistemas >= 3; observados>=1; validados>=1; pendientes>=1
-- ============================================================

BEGIN;

-- 1) Sistema PENDIENTE
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_area_usuario, id_tipo_aplicativo, id_criticidad,
    id_responsable_tecnico, id_responsable_funcional,
    ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-AUD-PEND',
    'Auditor · Sistema Pendiente',
    'Sistema de prueba Auditor en estado PENDIENTE.',
    'Desarrollo CTIC',
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ACAD' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'MEDIO' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '73456789' LIMIT 1),
    2026, 'CTIC UNAS', false, false, 'PENDIENTE', 'MEDIO', 'CORTO PLAZO'
WHERE NOT EXISTS (SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-AUD-PEND');

-- 2) Sistema OBSERVADO
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_area_usuario, id_tipo_aplicativo, id_criticidad,
    id_responsable_tecnico, id_responsable_funcional,
    ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-AUD-OBS',
    'Auditor · Sistema Observado',
    'Sistema de prueba Auditor observado.',
    'Desarrollo CTIC',
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ADMIN' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'ALTO' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '73456789' LIMIT 1),
    2025, 'CTIC UNAS', false, false, 'OBSERVADO', 'ALTO', 'INMEDIATO'
WHERE NOT EXISTS (SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-AUD-OBS');

-- 3) Sistema VALIDADO
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_area_usuario, id_tipo_aplicativo, id_criticidad,
    id_responsable_tecnico, id_responsable_funcional,
    ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-AUD-OK',
    'Auditor · Sistema Validado',
    'Sistema de prueba Auditor validado.',
    'Desarrollo CTIC',
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'FIN' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'CLOUD' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'BAJO' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username = '73456789' LIMIT 1),
    2024, 'CTIC UNAS', true, false, 'VALIDADO', 'BAJO', 'LARGO PLAZO'
WHERE NOT EXISTS (SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-AUD-OK');

-- Validaciones
INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, resultado, observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion)
SELECT s.id_sistema,
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       'PENDIENTE', 'PENDIENTE', 'Pendiente de validación (Auditor test).',
       NULL, NOW(), NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-AUD-PEND'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, resultado, observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion)
SELECT s.id_sistema,
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       'OBSERVADO', 'OBSERVADO', 'Observado (Auditor test).',
       NOW(), NOW(), NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-AUD-OBS'
  AND NOT EXISTS (
      SELECT 1 FROM validaciones v
      WHERE v.id_sistema = s.id_sistema AND v.estado_validacion = 'OBSERVADO'
  );

INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, resultado, observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion)
SELECT s.id_sistema,
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       'APROBADO', 'VALIDADO', 'Validado (Auditor test).',
       NOW(), NOW(), NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-AUD-OK'
  AND NOT EXISTS (
      SELECT 1 FROM validaciones v
      WHERE v.id_sistema = s.id_sistema AND v.resultado = 'VALIDADO'
  );

-- Observaciones por prefijo
INSERT INTO observaciones (id_sistema, id_validacion, descripcion, estado_observacion, id_usuario_observa, fecha_observacion)
SELECT s.id_sistema, v.id_validacion,
       '[VALIDACION] Seguridad — Falta política de contraseñas documentada.',
       'PENDIENTE',
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-AUD-OBS'
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[VALIDACION] Seguridad%'
  );

INSERT INTO observaciones (id_sistema, id_validacion, descripcion, estado_observacion, id_usuario_observa, fecha_observacion)
SELECT s.id_sistema, v.id_validacion,
       '[INFRAESTRUCTURA] Capacidad — Recursos de cómputo insuficientes.',
       'PENDIENTE',
       (SELECT id_usuario FROM usuarios WHERE username = '74567890' LIMIT 1),
       NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-AUD-OBS'
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion LIKE '[INFRAESTRUCTURA] Capacidad%'
  );

-- Infraestructura
INSERT INTO infraestructura (id_sistema, capacidad_recursos, fecha_creacion)
SELECT s.id_sistema,
       '{"estadoEvaluacion":"OBSERVADO","servidor":"VM-AUD-OBS","backup":false}',
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-AUD-OBS'
  AND NOT EXISTS (SELECT 1 FROM infraestructura i WHERE i.id_sistema = s.id_sistema);

INSERT INTO infraestructura (id_sistema, capacidad_recursos, fecha_creacion)
SELECT s.id_sistema,
       '{"estadoEvaluacion":"APROBADO","servidor":"CLOUD-AUD-OK","backup":true}',
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-AUD-OK'
  AND NOT EXISTS (SELECT 1 FROM infraestructura i WHERE i.id_sistema = s.id_sistema);

-- Evidencias
INSERT INTO evidencias (id_sistema, tipo_evidencia, nombre_archivo, estado_evidencia, id_usuario_carga, fecha_carga)
SELECT s.id_sistema, 'Manual técnico', 'manual_sys_aud_obs.pdf', 'ACTIVA',
       (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-AUD-OBS'
  AND NOT EXISTS (
      SELECT 1 FROM evidencias e
      WHERE e.id_sistema = s.id_sistema AND e.nombre_archivo = 'manual_sys_aud_obs.pdf'
  );

INSERT INTO evidencias (id_sistema, tipo_evidencia, nombre_archivo, estado_evidencia, id_usuario_carga, fecha_carga)
SELECT s.id_sistema, 'Acta de validación', 'acta_sys_aud_ok.pdf', 'ACTIVA',
       (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-AUD-OK'
  AND NOT EXISTS (
      SELECT 1 FROM evidencias e
      WHERE e.id_sistema = s.id_sistema AND e.nombre_archivo = 'acta_sys_aud_ok.pdf'
  );

-- Auditoría con IP de origen
INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    'Inventario',
    'Consulta',
    'Auditor consultó inventario; sistema_id referenciado SYS-AUD-OBS',
    '10.0.0.80',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'Inventario'
      AND a.descripcion LIKE '%SYS-AUD-OBS%'
);

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    'Reportes',
    'Exportación',
    'Auditor exportó reporte de sistemas SYS-AUD-OK',
    '10.0.0.81',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'Reportes'
      AND a.descripcion LIKE '%SYS-AUD-OK%'
);

COMMIT;

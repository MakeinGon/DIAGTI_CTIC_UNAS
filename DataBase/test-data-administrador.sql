-- ============================================================
-- DIAGTI · Datos de prueba idempotentes para módulo ADMINISTRADOR
-- SOLO tablas oficiales. NO EJECUTAR automáticamente.
-- ============================================================
-- Tablas afectadas:
--   usuarios, roles, usuarios_roles, catalogos, sistemas, auditoria
-- Columnas utilizadas:
--   usuarios: nombres, apellidos, dni, correo, username, password_hash,
--             area, origen, estado
--   roles: nombre, descripcion, estado
--   usuarios_roles: id_usuario, id_rol
--   catalogos: tipo_catalogo, codigo, valor, descripcion, estado, orden
--   sistemas: codigo_unico, nombre, descripcion, forma_adquisicion,
--             id_area_usuario, id_tipo_aplicativo, id_criticidad,
--             id_responsable_tecnico, id_responsable_funcional,
--             ano_adquisicion, desarrollador_nombre, contrato_vigente,
--             es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
--   auditoria: id_usuario, modulo, accion, descripcion, direccion_ip
-- ============================================================
-- Registros esperados (sin duplicar seed existente):
--   usuarios ADM-*: admin, desarrollo, validacion, infraestructura,
--                   directivo, auditor (si no existen por username)
--   roles oficiales confirmados por nombre
--   catálogo CRITICIDAD / AREA_USUARIO / TIPO_APLICATIVO (si faltan)
--   sistema SYS-ADM-DEMO con responsables
--   eventos de auditoría módulo Administrador
-- ============================================================
-- Consultas de verificación:
--   SELECT username, correo, estado FROM usuarios WHERE username LIKE 'adm-%';
--   SELECT nombre FROM roles WHERE nombre IN
--     ('admin','desarrollo','validacion','infraestructura','directivo','auditor');
--   SELECT tipo_catalogo, codigo, valor FROM catalogos
--     WHERE tipo_catalogo IN ('AREA_USUARIO','CRITICIDAD','TIPO_APLICATIVO');
--   SELECT codigo_unico, id_responsable_tecnico, id_responsable_funcional
--     FROM sistemas WHERE codigo_unico = 'SYS-ADM-DEMO';
--   SELECT modulo, accion FROM auditoria WHERE modulo = 'Administrador';
-- Resultados esperados:
--   Usuarios: >= 1 admin + roles de cada perfil (seed o ADM-*)
--   Roles: 6 roles oficiales presentes
--   Catálogos: AREA_USUARIO, CRITICIDAD, TIPO_APLICATIVO con valores
--   Sistemas: SYS-ADM-DEMO con responsables
--   Auditoría: >= 2 eventos Administrador
-- ============================================================

BEGIN;

-- 1) Roles oficiales (idempotente por nombre)
INSERT INTO roles (nombre, descripcion, estado)
SELECT 'admin', 'Administrador del sistema', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'admin');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'desarrollo', 'Desarrollador', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'desarrollo');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'validacion', 'Validación', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'validacion');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'infraestructura', 'Infraestructura', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'infraestructura');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'directivo', 'Directivo', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'directivo');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'auditor', 'Auditor de TI', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'auditor');

-- 2) Catálogos mínimos
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'AREA_USUARIO', 'ADMIN', 'Administración', 'Área administrativa', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ADMIN'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'TIPO_APLICATIVO', 'WEB', 'Aplicativo Web', 'Sistema web', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'CRITICIDAD', 'MEDIO', 'Media', 'Criticidad media', true, 2
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'MEDIO'
);

-- 3) Usuarios de prueba por perfil (username ADM-*)
INSERT INTO usuarios (nombres, apellidos, dni, correo, username, password_hash, area, origen, estado)
SELECT 'Admin', 'Prueba', '80000001', 'adm.admin@unas.edu.pe', 'adm-admin', 'admin123', 'CTIC', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'adm-admin');

INSERT INTO usuarios (nombres, apellidos, dni, correo, username, password_hash, area, origen, estado)
SELECT 'Dev', 'Prueba', '80000002', 'adm.dev@unas.edu.pe', 'adm-dev', 'admin123', 'Desarrollo', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'adm-dev');

INSERT INTO usuarios (nombres, apellidos, dni, correo, username, password_hash, area, origen, estado)
SELECT 'Val', 'Prueba', '80000003', 'adm.val@unas.edu.pe', 'adm-val', 'admin123', 'Validacion', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'adm-val');

INSERT INTO usuarios (nombres, apellidos, dni, correo, username, password_hash, area, origen, estado)
SELECT 'Infra', 'Prueba', '80000004', 'adm.infra@unas.edu.pe', 'adm-infra', 'admin123', 'Infraestructura', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'adm-infra');

INSERT INTO usuarios (nombres, apellidos, dni, correo, username, password_hash, area, origen, estado)
SELECT 'Dir', 'Prueba', '80000005', 'adm.dir@unas.edu.pe', 'adm-dir', 'admin123', 'Direccion', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'adm-dir');

INSERT INTO usuarios (nombres, apellidos, dni, correo, username, password_hash, area, origen, estado)
SELECT 'Aud', 'Prueba', '80000006', 'adm.aud@unas.edu.pe', 'adm-aud', 'admin123', 'Auditoria', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'adm-aud');

-- 4) Asignaciones usuario–rol (idempotentes)
INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'admin'
WHERE u.username = 'adm-admin'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'desarrollo'
WHERE u.username = 'adm-dev'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'validacion'
WHERE u.username = 'adm-val'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'infraestructura'
WHERE u.username = 'adm-infra'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'directivo'
WHERE u.username = 'adm-dir'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'auditor'
WHERE u.username = 'adm-aud'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

-- 5) Sistema oficial de demostración administrativa
INSERT INTO sistemas (
    codigo_unico, nombre, descripcion, forma_adquisicion,
    id_area_usuario, id_tipo_aplicativo, id_criticidad,
    id_responsable_tecnico, id_responsable_funcional,
    ano_adquisicion, desarrollador_nombre,
    contrato_vigente, es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
SELECT
    'SYS-ADM-DEMO',
    'Administrador · Sistema Demo',
    'Sistema oficial de prueba para gestión administrativa.',
    'Desarrollo CTIC',
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ADMIN' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB' LIMIT 1),
    (SELECT id_catalogo FROM catalogos WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'MEDIO' LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username IN ('adm-dev', '71234567') ORDER BY CASE WHEN username = 'adm-dev' THEN 0 ELSE 1 END LIMIT 1),
    (SELECT id_usuario FROM usuarios WHERE username IN ('adm-admin', '76551691') ORDER BY CASE WHEN username = 'adm-admin' THEN 0 ELSE 1 END LIMIT 1),
    2026, 'CTIC UNAS', false, false, 'PENDIENTE', 'MEDIO', 'CORTO PLAZO'
WHERE NOT EXISTS (SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-ADM-DEMO');

-- 6) Auditoría administrativa
INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip)
SELECT u.id_usuario, 'Administrador', 'usuario creado',
       'Evento de prueba: usuario administrativo preparado (adm-admin).', '127.0.0.1'
FROM usuarios u
WHERE u.username = 'adm-admin'
  AND NOT EXISTS (
      SELECT 1 FROM auditoria a
      WHERE a.modulo = 'Administrador'
        AND a.accion = 'usuario creado'
        AND a.descripcion LIKE '%adm-admin%'
  );

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip)
SELECT u.id_usuario, 'Administrador', 'sistema actualizado',
       'Evento de prueba: sistema SYS-ADM-DEMO preparado.', '127.0.0.1'
FROM usuarios u
WHERE u.username = 'adm-admin'
  AND NOT EXISTS (
      SELECT 1 FROM auditoria a
      WHERE a.modulo = 'Administrador'
        AND a.accion = 'sistema actualizado'
        AND a.descripcion LIKE '%SYS-ADM-DEMO%'
  );

COMMIT;

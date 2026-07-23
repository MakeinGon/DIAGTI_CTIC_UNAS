-- =============================================================================
-- DIAGTI CTIC UNAS · seed-data-completo.sql
-- Datos de prueba idempotentes y seguros para la base PostgreSQL actual.
-- =============================================================================
-- Alcance: Desarrollador, Validación, Infraestructura, Director, Auditor,
--          Administrador. Funcional FUERA de alcance.
--
-- RESTRICCIONES DE ESTE SCRIPT:
--   - No DROP / TRUNCATE / DELETE / ALTER TABLE
--   - No altera tablas ni columnas
--   - No modifica contraseñas de usuarios existentes
--   - No asume IDs numéricos fijos
--   - Solo tablas oficiales (no sistemas_informaticos ni *_tecnicas)
--   - Idempotente: seguro de reejecutar
--   - Codificación: UTF-8 sin BOM
--
-- NOTA DE ESQUEMA (ddl-auto=update / coexistencia de modelos):
--   sistemas: id_sistema e id deben recibir el mismo nextval.
--   integraciones: omitida; sistema_id FK apunta a sistemas_informaticos.id.
--
-- AUTENTICACIÓN TEMPORAL:
--   AuthServiceImpl compara password en texto plano.
--   Contraseñas de usuarios NUEVOS insertados aquí: admin123 (texto plano).
--   Usuarios YA existentes: password_hash NO se modifica.
--
-- NO EJECUTAR AUTOMÁTICAMENTE. Ver REPORTE_SEED_DATA_COMPLETO.md
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1) ROLES FALTANTES (uno a uno por nombre; NO insertar funcional)
-- =============================================================================

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'admin', 'Administrador del sistema', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'admin');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'auditor', 'Auditor de TI', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'auditor');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'desarrollo', 'Desarrollador', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'desarrollo');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'directivo', 'Directivo', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'directivo');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'infraestructura', 'Infraestructura', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'infraestructura');

INSERT INTO roles (nombre, descripcion, estado)
SELECT 'validacion', 'Validación', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'validacion');

-- =============================================================================
-- 2) USUARIOS FALTANTES (por username; no insertar admin ni funcional)
--    Administrador existente (p. ej. 76551691): se conserva sin cambios.
-- =============================================================================

INSERT INTO usuarios (
    nombres, apellidos, dni, correo, username, password_hash,
    area, origen, estado
)
SELECT
    'Carlos', 'Ruiz', '74331380', 'carlos.ruiz@unas.edu.pe', '74331380',
    'admin123', 'Auditoria', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = '74331380');

INSERT INTO usuarios (
    nombres, apellidos, dni, correo, username, password_hash,
    area, origen, estado
)
SELECT
    'Juan', 'Perez', '71234567', 'juan.perez@unas.edu.pe', '71234567',
    'admin123', 'Desarrollo', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = '71234567');

INSERT INTO usuarios (
    nombres, apellidos, dni, correo, username, password_hash,
    area, origen, estado
)
SELECT
    'Maria', 'Gomez', '72345678', 'maria.gomez@unas.edu.pe', '72345678',
    'admin123', 'Direccion', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = '72345678');

INSERT INTO usuarios (
    nombres, apellidos, dni, correo, username, password_hash,
    area, origen, estado
)
SELECT
    'Ana', 'Torres', '74567890', 'ana.torres@unas.edu.pe', '74567890',
    'admin123', 'Infraestructura', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = '74567890');

INSERT INTO usuarios (
    nombres, apellidos, dni, correo, username, password_hash,
    area, origen, estado
)
SELECT
    'Roberto', 'Diaz', '75678901', 'roberto.diaz@unas.edu.pe', '75678901',
    'admin123', 'Validacion', 'Local', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = '75678901');

-- =============================================================================
-- 3) ASIGNACIONES USUARIO–ROL (subconsultas por username + nombre de rol)
-- =============================================================================

-- Admin existente (si está presente): solo vincula rol; no toca password
INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'admin'
WHERE u.username = '76551691'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'auditor'
WHERE u.username = '74331380'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'desarrollo'
WHERE u.username = '71234567'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'directivo'
WHERE u.username = '72345678'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'infraestructura'
WHERE u.username = '74567890'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
JOIN roles r ON r.nombre = 'validacion'
WHERE u.username = '75678901'
  AND NOT EXISTS (
      SELECT 1 FROM usuarios_roles ur
      WHERE ur.id_usuario = u.id_usuario AND ur.id_rol = r.id_rol
  );

-- =============================================================================
-- 4) CATÁLOGOS (idempotentes por tipo_catalogo + codigo)
--    AREA_USUARIO FIN cubre Sistema Financiero; no se crea una 5.ª área.
-- =============================================================================

-- TIPO_APLICATIVO
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'TIPO_APLICATIVO', 'WEB', 'Aplicativo Web',
       'Sistema accesible vía navegador web', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'TIPO_APLICATIVO', 'DESKTOP', 'Aplicativo Desktop',
       'Sistema instalado en computadoras locales', true, 2
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'DESKTOP'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'TIPO_APLICATIVO', 'MOVIL', 'Aplicativo Móvil',
       'Sistema para dispositivos móviles', true, 3
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'MOVIL'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'TIPO_APLICATIVO', 'CLOUD', 'Sistema Cloud',
       'Sistema en la nube (SaaS)', true, 4
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'CLOUD'
);

-- CRITICIDAD
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'CRITICIDAD', 'ALTO', 'Alta',
       'Sistema crítico para la operación', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'ALTO'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'CRITICIDAD', 'MEDIO', 'Media',
       'Sistema importante pero no crítico', true, 2
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'MEDIO'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'CRITICIDAD', 'BAJO', 'Baja',
       'Sistema de soporte', true, 3
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'BAJO'
);

-- AREA_USUARIO
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'AREA_USUARIO', 'ADMIN', 'Administración',
       'Área administrativa', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ADMIN'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'AREA_USUARIO', 'ACAD', 'Académica',
       'Área académica', true, 2
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ACAD'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'AREA_USUARIO', 'INV', 'Investigación',
       'Área de investigación', true, 3
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'INV'
);

INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, estado, orden)
SELECT 'AREA_USUARIO', 'FIN', 'Finanzas',
       'Área financiera', true, 4
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'FIN'
);

-- =============================================================================
-- 5) SISTEMAS (SYS-001 .. SYS-005) — catálogos y responsables por código/username
--    Coexistencia de modelos Hibernate (ddl-auto=update):
--      id_sistema (oficial, default nextval) e id (heredado, NOT NULL sin default)
--    Ambos reciben el MISMO nextval solo si el codigo_unico aún no existe.
--    También se rellenan columnas heredadas nullable: codigo, estado,
--    area_usuaria, tipo_aplicativo.
--    id_responsable_funcional = NULL (Funcional fuera de alcance)
-- =============================================================================

-- SYS-001 Sistema Académico
WITH nuevo_id AS (
    SELECT nextval('sistemas_id_sistema_seq') AS valor
    WHERE NOT EXISTS (
        SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-001'
    )
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
    es_legacy,
    estado_flujo,
    estado,
    nivel_riesgo,
    prioridad_migracion
)
SELECT
    nuevo_id.valor,
    nuevo_id.valor,
    'SYS-001',
    'SYS-001',
    'Sistema Académico',
    'Matrícula, notas y currícula.',
    area.id_catalogo,
    tipo.id_catalogo,
    criticidad.id_catalogo,
    area.valor,
    tipo.valor,
    'Desarrollo CTIC',
    NULL,
    tecnico.id_usuario,
    2021,
    'CTIC UNAS',
    false,
    false,
    'VALIDADO',
    'VALIDADO',
    'MEDIO',
    'MEDIANO PLAZO'
FROM nuevo_id
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ACAD'
    LIMIT 1
) area
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB'
    LIMIT 1
) tipo
CROSS JOIN LATERAL (
    SELECT id_catalogo
    FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'MEDIO'
    LIMIT 1
) criticidad
CROSS JOIN LATERAL (
    SELECT id_usuario
    FROM usuarios
    WHERE username = '71234567'
    LIMIT 1
) tecnico;

-- SYS-002 Trámite Documentario
WITH nuevo_id AS (
    SELECT nextval('sistemas_id_sistema_seq') AS valor
    WHERE NOT EXISTS (
        SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-002'
    )
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
    es_legacy,
    estado_flujo,
    estado,
    nivel_riesgo,
    prioridad_migracion
)
SELECT
    nuevo_id.valor,
    nuevo_id.valor,
    'SYS-002',
    'SYS-002',
    'Trámite Documentario',
    'Gestión de documentos internos.',
    area.id_catalogo,
    tipo.id_catalogo,
    criticidad.id_catalogo,
    area.valor,
    tipo.valor,
    'Proveedor externo',
    NULL,
    tecnico.id_usuario,
    2020,
    'Proveedor externo',
    true,
    false,
    'OBSERVADO',
    'OBSERVADO',
    'ALTO',
    'CORTO PLAZO'
FROM nuevo_id
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ADMIN'
    LIMIT 1
) area
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB'
    LIMIT 1
) tipo
CROSS JOIN LATERAL (
    SELECT id_catalogo
    FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'ALTO'
    LIMIT 1
) criticidad
CROSS JOIN LATERAL (
    SELECT id_usuario
    FROM usuarios
    WHERE username = '71234567'
    LIMIT 1
) tecnico;

-- SYS-003 Sistema de Biblioteca (legacy; sin responsable técnico)
WITH nuevo_id AS (
    SELECT nextval('sistemas_id_sistema_seq') AS valor
    WHERE NOT EXISTS (
        SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-003'
    )
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
    es_legacy,
    estado_flujo,
    estado,
    nivel_riesgo,
    prioridad_migracion
)
SELECT
    nuevo_id.valor,
    nuevo_id.valor,
    'SYS-003',
    'SYS-003',
    'Sistema de Biblioteca',
    'Catálogo bibliográfico, préstamos y devoluciones.',
    area.id_catalogo,
    tipo.id_catalogo,
    criticidad.id_catalogo,
    area.valor,
    tipo.valor,
    'Desarrollo interno',
    NULL,
    NULL,
    2015,
    'Equipo anterior CTIC',
    false,
    true,
    'OBSERVADO',
    'OBSERVADO',
    'CRITICO',
    'INMEDIATA'
FROM nuevo_id
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'INV'
    LIMIT 1
) area
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB'
    LIMIT 1
) tipo
CROSS JOIN LATERAL (
    SELECT id_catalogo
    FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'ALTO'
    LIMIT 1
) criticidad;

-- SYS-004 Recursos Humanos
WITH nuevo_id AS (
    SELECT nextval('sistemas_id_sistema_seq') AS valor
    WHERE NOT EXISTS (
        SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-004'
    )
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
    es_legacy,
    estado_flujo,
    estado,
    nivel_riesgo,
    prioridad_migracion
)
SELECT
    nuevo_id.valor,
    nuevo_id.valor,
    'SYS-004',
    'SYS-004',
    'Recursos Humanos',
    'Gestión de personal, asistencia, contratos y planillas.',
    area.id_catalogo,
    tipo.id_catalogo,
    criticidad.id_catalogo,
    area.valor,
    tipo.valor,
    'Compra',
    NULL,
    tecnico.id_usuario,
    2019,
    'Proveedor RRHH',
    true,
    false,
    'VALIDADO',
    'VALIDADO',
    'BAJO',
    'MONITOREO'
FROM nuevo_id
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'ADMIN'
    LIMIT 1
) area
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB'
    LIMIT 1
) tipo
CROSS JOIN LATERAL (
    SELECT id_catalogo
    FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'BAJO'
    LIMIT 1
) criticidad
CROSS JOIN LATERAL (
    SELECT id_usuario
    FROM usuarios
    WHERE username = '71234567'
    LIMIT 1
) tecnico;

-- SYS-005 Sistema Financiero (área FIN existente; sin 5.ª área inventada)
WITH nuevo_id AS (
    SELECT nextval('sistemas_id_sistema_seq') AS valor
    WHERE NOT EXISTS (
        SELECT 1 FROM sistemas WHERE codigo_unico = 'SYS-005'
    )
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
    es_legacy,
    estado_flujo,
    estado,
    nivel_riesgo,
    prioridad_migracion
)
SELECT
    nuevo_id.valor,
    nuevo_id.valor,
    'SYS-005',
    'SYS-005',
    'Sistema Financiero',
    'Control de ingresos, egresos, pagos y reportes financieros.',
    area.id_catalogo,
    tipo.id_catalogo,
    criticidad.id_catalogo,
    area.valor,
    tipo.valor,
    'Proveedor externo',
    NULL,
    tecnico.id_usuario,
    2018,
    'Proveedor Financiero',
    false,
    false,
    'ENVIADO',
    'ENVIADO',
    'ALTO',
    'CORTO PLAZO'
FROM nuevo_id
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'AREA_USUARIO' AND codigo = 'FIN'
    LIMIT 1
) area
CROSS JOIN LATERAL (
    SELECT id_catalogo, valor
    FROM catalogos
    WHERE tipo_catalogo = 'TIPO_APLICATIVO' AND codigo = 'WEB'
    LIMIT 1
) tipo
CROSS JOIN LATERAL (
    SELECT id_catalogo
    FROM catalogos
    WHERE tipo_catalogo = 'CRITICIDAD' AND codigo = 'ALTO'
    LIMIT 1
) criticidad
CROSS JOIN LATERAL (
    SELECT id_usuario
    FROM usuarios
    WHERE username = '71234567'
    LIMIT 1
) tecnico;

-- =============================================================================
-- 6) VALIDACIONES (una por sistema si aún no existe; estados oficiales)
--    Relación: sistemas.codigo_unico + usuarios.username (validador)
-- =============================================================================

INSERT INTO validaciones (
    id_sistema, id_validador, estado_validacion, resultado,
    observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion
)
SELECT
    s.id_sistema,
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    'VALIDADO',
    'VALIDADO',
    'Validación completada (seed SYS-001).',
    NOW(),
    NOW(),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-001'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

INSERT INTO validaciones (
    id_sistema, id_validador, estado_validacion, resultado,
    observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion
)
SELECT
    s.id_sistema,
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    'OBSERVADO',
    'OBSERVADO',
    'Sistema observado; requiere subsanación (seed SYS-002).',
    NOW(),
    NOW(),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-002'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

INSERT INTO validaciones (
    id_sistema, id_validador, estado_validacion, resultado,
    observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion
)
SELECT
    s.id_sistema,
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    'OBSERVADO',
    'OBSERVADO',
    'Sistema legacy observado (seed SYS-003).',
    NOW(),
    NOW(),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-003'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

INSERT INTO validaciones (
    id_sistema, id_validador, estado_validacion, resultado,
    observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion
)
SELECT
    s.id_sistema,
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    'VALIDADO',
    'VALIDADO',
    'Validación completada (seed SYS-004).',
    NOW(),
    NOW(),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-004'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

INSERT INTO validaciones (
    id_sistema, id_validador, estado_validacion, resultado,
    observacion_general, fecha_validacion, fecha_creacion, fecha_actualizacion
)
SELECT
    s.id_sistema,
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    'PENDIENTE',
    'PENDIENTE',
    'Sistema enviado para validación inicial (seed SYS-005).',
    NULL,
    NOW(),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-005'
  AND NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

-- =============================================================================
-- 7) OBSERVACIONES SYS-002 y SYS-003 ([VALIDACION] / [INFRAESTRUCTURA])
--    Relación por codigo_unico + validaciones.id_sistema (sin IDs fijos)
--    Duplicados evitados por sistema + descripción + estado
-- =============================================================================

-- SYS-002 · [VALIDACION]
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    id_usuario_observa, fecha_observacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[VALIDACION] Documentación — Se requiere revisar la documentación técnica del sistema. Faltan evidencias de pruebas de seguridad.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-002'
  AND v.id_validacion = (
      SELECT v2.id_validacion
      FROM validaciones v2
      WHERE v2.id_sistema = s.id_sistema
      ORDER BY v2.id_validacion DESC
      LIMIT 1
  )
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion = '[VALIDACION] Documentación — Se requiere revisar la documentación técnica del sistema. Faltan evidencias de pruebas de seguridad.'
        AND o.estado_observacion = 'PENDIENTE'
  );

-- SYS-002 · [INFRAESTRUCTURA]
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    id_usuario_observa, fecha_observacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[INFRAESTRUCTURA] Capacidad — Recursos de cómputo insuficientes para picos de trámite.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '74567890' LIMIT 1),
    NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-002'
  AND v.id_validacion = (
      SELECT v2.id_validacion
      FROM validaciones v2
      WHERE v2.id_sistema = s.id_sistema
      ORDER BY v2.id_validacion DESC
      LIMIT 1
  )
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion = '[INFRAESTRUCTURA] Capacidad — Recursos de cómputo insuficientes para picos de trámite.'
        AND o.estado_observacion = 'PENDIENTE'
  );

-- SYS-003 · [VALIDACION]
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    id_usuario_observa, fecha_observacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[VALIDACION] Seguridad — El sistema tiene riesgos críticos. Se debe implementar autenticación de dos factores.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-003'
  AND v.id_validacion = (
      SELECT v2.id_validacion
      FROM validaciones v2
      WHERE v2.id_sistema = s.id_sistema
      ORDER BY v2.id_validacion DESC
      LIMIT 1
  )
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion = '[VALIDACION] Seguridad — El sistema tiene riesgos críticos. Se debe implementar autenticación de dos factores.'
        AND o.estado_observacion = 'PENDIENTE'
  );

-- SYS-003 · [INFRAESTRUCTURA]
INSERT INTO observaciones (
    id_sistema, id_validacion, descripcion, estado_observacion,
    id_usuario_observa, fecha_observacion
)
SELECT
    s.id_sistema,
    v.id_validacion,
    '[INFRAESTRUCTURA] Continuidad — No se evidencia plan de respaldo ni recuperación para el sistema legacy.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '74567890' LIMIT 1),
    NOW()
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
WHERE s.codigo_unico = 'SYS-003'
  AND v.id_validacion = (
      SELECT v2.id_validacion
      FROM validaciones v2
      WHERE v2.id_sistema = s.id_sistema
      ORDER BY v2.id_validacion DESC
      LIMIT 1
  )
  AND NOT EXISTS (
      SELECT 1 FROM observaciones o
      WHERE o.id_sistema = s.id_sistema
        AND o.descripcion = '[INFRAESTRUCTURA] Continuidad — No se evidencia plan de respaldo ni recuperación para el sistema legacy.'
        AND o.estado_observacion = 'PENDIENTE'
  );

-- =============================================================================
-- 8) INFRAESTRUCTURA / SEGURIDAD / ARQUITECTURA / INTEGRACIONES / EVIDENCIAS
--    Datos mínimos compatibles con el esquema real (columnas oficiales)
-- =============================================================================

-- Infraestructura: sistemas observados y uno validado
INSERT INTO infraestructura (id_sistema, capacidad_recursos, fecha_creacion)
SELECT s.id_sistema,
       '{"estadoEvaluacion":"OBSERVADO","servidor":"VM-SYS-002","backup":false,"cpu":"4 vCPU","ram":"8GB"}',
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-002'
  AND NOT EXISTS (SELECT 1 FROM infraestructura i WHERE i.id_sistema = s.id_sistema);

INSERT INTO infraestructura (id_sistema, capacidad_recursos, fecha_creacion)
SELECT s.id_sistema,
       '{"estadoEvaluacion":"OBSERVADO","servidor":"LEGACY-SYS-003","backup":false,"cpu":"2 vCPU","ram":"4GB"}',
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-003'
  AND NOT EXISTS (SELECT 1 FROM infraestructura i WHERE i.id_sistema = s.id_sistema);

INSERT INTO infraestructura (id_sistema, capacidad_recursos, fecha_creacion)
SELECT s.id_sistema,
       '{"estadoEvaluacion":"APROBADO","servidor":"CLOUD-SYS-001","backup":true,"cpu":"8 vCPU","ram":"16GB"}',
       NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-001'
  AND NOT EXISTS (SELECT 1 FROM infraestructura i WHERE i.id_sistema = s.id_sistema);

-- Seguridad: sistemas validados
INSERT INTO seguridad (id_sistema, tipo_control, mecanismo_autenticacion, fecha_creacion)
SELECT s.id_sistema, 'SSL/TLS', 'LDAP/Local', NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-001'
  AND NOT EXISTS (SELECT 1 FROM seguridad x WHERE x.id_sistema = s.id_sistema);

INSERT INTO seguridad (id_sistema, tipo_control, mecanismo_autenticacion, fecha_creacion)
SELECT s.id_sistema, 'Firewall + WAF', 'SSO institucional', NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-004'
  AND NOT EXISTS (SELECT 1 FROM seguridad x WHERE x.id_sistema = s.id_sistema);

-- Arquitectura: sistemas principales
INSERT INTO arquitectura (
    id_sistema, tipo_arquitectura, patron_arquitectonico,
    descripcion_tecnica, observaciones, fecha_creacion
)
SELECT
    s.id_sistema,
    'Monolítica',
    'MVC',
    'Arquitectura monolítica con patrón MVC (seed SYS-001).',
    'Compatible con módulo Director.',
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-001'
  AND NOT EXISTS (SELECT 1 FROM arquitectura a WHERE a.id_sistema = s.id_sistema);

INSERT INTO arquitectura (
    id_sistema, tipo_arquitectura, patron_arquitectonico,
    descripcion_tecnica, observaciones, fecha_creacion
)
SELECT
    s.id_sistema,
    'Monolítica legacy',
    'Cliente-Servidor',
    'Sistema legacy sin capa de servicios (seed SYS-003).',
    'Prioridad de migración inmediata.',
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-003'
  AND NOT EXISTS (SELECT 1 FROM arquitectura a WHERE a.id_sistema = s.id_sistema);

-- Integraciones omitidas temporalmente:
-- la tabla contiene columnas de dos modelos distintos y sistema_id
-- referencia sistemas_informaticos.id. Se requiere consolidar el
-- esquema antes de sembrar esta relación de forma segura.
-- No se inserta en sistemas_informaticos ni se inventan valores de sistema_id.
-- El init.sql original tampoco sembraba integraciones.

-- Evidencias
INSERT INTO evidencias (
    id_sistema, tipo_evidencia, nombre_archivo, descripcion,
    extension_archivo, estado_evidencia, id_usuario_carga, fecha_carga
)
SELECT
    s.id_sistema,
    'Acta de validación',
    'acta_sys_001.pdf',
    'Acta de validación del Sistema Académico (seed).',
    'pdf',
    'ACTIVA',
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-001'
  AND NOT EXISTS (
      SELECT 1 FROM evidencias e
      WHERE e.id_sistema = s.id_sistema
        AND e.nombre_archivo = 'acta_sys_001.pdf'
  );

INSERT INTO evidencias (
    id_sistema, tipo_evidencia, nombre_archivo, descripcion,
    extension_archivo, estado_evidencia, id_usuario_carga, fecha_carga
)
SELECT
    s.id_sistema,
    'Manual técnico',
    'manual_sys_002.pdf',
    'Manual técnico parcial del Trámite Documentario (seed).',
    'pdf',
    'ACTIVA',
    (SELECT id_usuario FROM usuarios WHERE username = '71234567' LIMIT 1),
    NOW()
FROM sistemas s
WHERE s.codigo_unico = 'SYS-002'
  AND NOT EXISTS (
      SELECT 1 FROM evidencias e
      WHERE e.id_sistema = s.id_sistema
        AND e.nombre_archivo = 'manual_sys_002.pdf'
  );

-- =============================================================================
-- 9) AUDITORÍA (idempotente por modulo + accion + descripción)
-- =============================================================================

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    'Inventario',
    'Consulta',
    'Seed completo: el auditor consultó el inventario general de sistemas (SYS-001..SYS-005).',
    '192.168.1.10',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'Inventario'
      AND a.accion = 'Consulta'
      AND a.descripcion = 'Seed completo: el auditor consultó el inventario general de sistemas (SYS-001..SYS-005).'
);

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '74331380' LIMIT 1),
    'Auditoría',
    'Consulta',
    'Seed completo: el auditor consultó el historial de eventos del sistema.',
    '192.168.1.10',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'Auditoría'
      AND a.accion = 'Consulta'
      AND a.descripcion = 'Seed completo: el auditor consultó el historial de eventos del sistema.'
);

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '75678901' LIMIT 1),
    'Validación',
    'Registro',
    'Seed completo: se prepararon validaciones para SYS-001..SYS-005.',
    '192.168.1.20',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'Validación'
      AND a.accion = 'Registro'
      AND a.descripcion = 'Seed completo: se prepararon validaciones para SYS-001..SYS-005.'
);

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '74567890' LIMIT 1),
    'Infraestructura',
    'Evaluación',
    'Seed completo: se registraron capacidades para SYS-001, SYS-002 y SYS-003.',
    '192.168.1.30',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'Infraestructura'
      AND a.accion = 'Evaluación'
      AND a.descripcion = 'Seed completo: se registraron capacidades para SYS-001, SYS-002 y SYS-003.'
);

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '72345678' LIMIT 1),
    'DIRECTOR',
    'Consulta',
    'Seed completo: preparación de datos transversales para dashboard Director.',
    '192.168.1.40',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'DIRECTOR'
      AND a.accion = 'Consulta'
      AND a.descripcion = 'Seed completo: preparación de datos transversales para dashboard Director.'
);

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip, fecha_evento)
SELECT
    (SELECT id_usuario FROM usuarios WHERE username = '76551691' LIMIT 1),
    'Sistemas',
    'Registro',
    'Seed completo: sistemas oficiales SYS-001..SYS-005 preparados o confirmados.',
    '192.168.1.15',
    NOW()
WHERE EXISTS (SELECT 1 FROM usuarios WHERE username = '76551691')
  AND NOT EXISTS (
    SELECT 1 FROM auditoria a
    WHERE a.modulo = 'Sistemas'
      AND a.accion = 'Registro'
      AND a.descripcion = 'Seed completo: sistemas oficiales SYS-001..SYS-005 preparados o confirmados.'
);

COMMIT;

-- =============================================================================
-- 10) VERIFICACIÓN FINAL (ejecutar tras COMMIT o en sesión de lectura)
-- =============================================================================

-- Conteos
SELECT 'roles' AS tabla, COUNT(*) AS total FROM roles
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'usuarios_roles', COUNT(*) FROM usuarios_roles
UNION ALL SELECT 'catalogos', COUNT(*) FROM catalogos
UNION ALL SELECT 'sistemas', COUNT(*) FROM sistemas
UNION ALL SELECT 'validaciones', COUNT(*) FROM validaciones
UNION ALL SELECT 'observaciones', COUNT(*) FROM observaciones
UNION ALL SELECT 'infraestructura', COUNT(*) FROM infraestructura
UNION ALL SELECT 'seguridad', COUNT(*) FROM seguridad
UNION ALL SELECT 'arquitectura', COUNT(*) FROM arquitectura
UNION ALL SELECT 'integraciones', COUNT(*) FROM integraciones
UNION ALL SELECT 'evidencias', COUNT(*) FROM evidencias
UNION ALL SELECT 'auditoria', COUNT(*) FROM auditoria
ORDER BY 1;

-- Usuarios y roles
SELECT u.username, u.nombres, u.apellidos, r.nombre AS rol, u.estado
FROM usuarios u
LEFT JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario
LEFT JOIN roles r ON r.id_rol = ur.id_rol
WHERE u.username IN ('76551691', '74331380', '71234567', '72345678', '74567890', '75678901')
ORDER BY u.username, r.nombre;

-- Sistemas y responsables
SELECT
    s.codigo_unico,
    s.nombre,
    s.estado_flujo,
    s.nivel_riesgo,
    ut.username AS responsable_tecnico,
    uf.username AS responsable_funcional
FROM sistemas s
LEFT JOIN usuarios ut ON ut.id_usuario = s.id_responsable_tecnico
LEFT JOIN usuarios uf ON uf.id_usuario = s.id_responsable_funcional
WHERE s.codigo_unico IN ('SYS-001', 'SYS-002', 'SYS-003', 'SYS-004', 'SYS-005')
ORDER BY s.codigo_unico;

-- Sistemas y catálogos
SELECT
    s.codigo_unico,
    s.nombre,
    ca.codigo AS area,
    ct.codigo AS tipo_aplicativo,
    cc.codigo AS criticidad
FROM sistemas s
LEFT JOIN catalogos ca ON ca.id_catalogo = s.id_area_usuario
LEFT JOIN catalogos ct ON ct.id_catalogo = s.id_tipo_aplicativo
LEFT JOIN catalogos cc ON cc.id_catalogo = s.id_criticidad
WHERE s.codigo_unico IN ('SYS-001', 'SYS-002', 'SYS-003', 'SYS-004', 'SYS-005')
ORDER BY s.codigo_unico;

-- Validaciones por sistema
SELECT
    s.codigo_unico,
    v.id_validacion,
    v.estado_validacion,
    v.resultado,
    uv.username AS validador
FROM sistemas s
JOIN validaciones v ON v.id_sistema = s.id_sistema
LEFT JOIN usuarios uv ON uv.id_usuario = v.id_validador
WHERE s.codigo_unico IN ('SYS-001', 'SYS-002', 'SYS-003', 'SYS-004', 'SYS-005')
ORDER BY s.codigo_unico, v.id_validacion;

-- Observaciones por sistema
SELECT
    s.codigo_unico,
    o.id_observacion,
    o.estado_observacion,
    o.descripcion
FROM sistemas s
JOIN observaciones o ON o.id_sistema = s.id_sistema
WHERE s.codigo_unico IN ('SYS-002', 'SYS-003')
ORDER BY s.codigo_unico, o.id_observacion;

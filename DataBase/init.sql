-- ============================================
-- DIAGTI - INICIALIZACIÓN DE BASE DE DATOS
-- ============================================

-- 1. TABLAS PRINCIPALES
\i /docker-entrypoint-initdb.d/modules/roles.sql
\i /docker-entrypoint-initdb.d/modules/usuarios.sql
\i /docker-entrypoint-initdb.d/modules/usuarios_roles.sql

-- 2. CATÁLOGOS
\i /docker-entrypoint-initdb.d/modules/catalogos.sql

-- 3. MÓDULOS DE NEGOCIO
\i /docker-entrypoint-initdb.d/modules/sistemas.sql
\i /docker-entrypoint-initdb.d/modules/infraestructura.sql
\i /docker-entrypoint-initdb.d/modules/seguridad.sql
\i /docker-entrypoint-initdb.d/modules/integraciones.sql

-- 4. ARQUITECTURA
\i /docker-entrypoint-initdb.d/modules/arquitectura.sql

-- 5. AUDITORÍA Y VALIDACIONES
\i /docker-entrypoint-initdb.d/modules/auditoria.sql
\i /docker-entrypoint-initdb.d/modules/validaciones.sql
\i /docker-entrypoint-initdb.d/modules/solicitudes_validacion.sql
\i /docker-entrypoint-initdb.d/modules/registros_area.sql
\i /docker-entrypoint-initdb.d/modules/observaciones.sql
\i /docker-entrypoint-initdb.d/modules/evidencias.sql

-- 6. PERMISOS
\i /docker-entrypoint-initdb.d/modules/permisos.sql

-- ============================================
-- DATOS DE PRUEBA - ROLES
-- ============================================

INSERT INTO roles (nombre, descripcion, estado) 
SELECT * FROM (VALUES 
    ('admin', 'Administrador del sistema', true),
    ('auditor', 'Auditor de TI', true),
    ('desarrollo', 'Desarrollador', true),
    ('directivo', 'Directivo', true),
    ('funcional', 'Funcional', true),
    ('infraestructura', 'Infraestructura', true),
    ('validacion', 'Validación', true)
) AS datos(nombre, descripcion, estado)
WHERE NOT EXISTS (SELECT 1 FROM roles LIMIT 1);

-- ============================================
-- DATOS DE PRUEBA - CATÁLOGOS
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM catalogos LIMIT 1) THEN
        INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, orden) VALUES 
        ('TIPO_APLICATIVO', 'WEB', 'Aplicativo Web', 'Sistema accesible vía navegador web', 1),
        ('TIPO_APLICATIVO', 'DESKTOP', 'Aplicativo Desktop', 'Sistema instalado en computadoras locales', 2),
        ('TIPO_APLICATIVO', 'MOVIL', 'Aplicativo Móvil', 'Sistema para dispositivos móviles', 3),
        ('TIPO_APLICATIVO', 'CLOUD', 'Sistema Cloud', 'Sistema en la nube (SaaS)', 4);
        
        INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, orden) VALUES 
        ('CRITICIDAD', 'ALTO', 'Alta', 'Sistema crítico para la operación', 1),
        ('CRITICIDAD', 'MEDIO', 'Media', 'Sistema importante pero no crítico', 2),
        ('CRITICIDAD', 'BAJO', 'Baja', 'Sistema de soporte', 3);
        
        INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, orden) VALUES 
        ('AREA_USUARIO', 'ADMIN', 'Administración', 'Área administrativa', 1),
        ('AREA_USUARIO', 'ACAD', 'Académica', 'Área académica', 2),
        ('AREA_USUARIO', 'INV', 'Investigación', 'Área de investigación', 3),
        ('AREA_USUARIO', 'FIN', 'Finanzas', 'Área financiera', 4);
    END IF;
END $$;

-- ============================================
-- DATOS DE PRUEBA - USUARIOS (TEXTO PLANO)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios LIMIT 1) THEN
        INSERT INTO usuarios (
            nombres,
            apellidos,
            dni,
            correo,
            username,
            password_hash,
            area,
            origen,
            estado
        ) VALUES 
        (
            'Johan Alberto',
            'Vela Arevalo',
            '76551691',
            'johan.vela@unas.edu.pe',
            '76551691',
            'admin123',
            'CTIC',
            'Local',
            true
        ),
        (
            'Carlos',
            'Ruiz',
            '74331380',
            'carlos.ruiz@unas.edu.pe',
            '74331380',
            'admin123',
            'Auditoria',
            'Local',
            true
        ),
        (
            'Juan',
            'Perez',
            '71234567',
            'juan.perez@unas.edu.pe',
            '71234567',
            'admin123',
            'Desarrollo',
            'Local',
            true
        ),
        (
            'Maria',
            'Gomez',
            '72345678',
            'maria.gomez@unas.edu.pe',
            '72345678',
            'admin123',
            'Direccion',
            'Local',
            true
        ),
        (
            'Laura',
            'Garcia',
            '73456789',
            'laura.garcia@unas.edu.pe',
            '73456789',
            'admin123',
            'Funcional',
            'Local',
            true
        ),
        (
            'Ana',
            'Torres',
            '74567890',
            'ana.torres@unas.edu.pe',
            '74567890',
            'admin123',
            'Infraestructura',
            'Local',
            true
        ),
        (
            'Roberto',
            'Diaz',
            '75678901',
            'roberto.diaz@unas.edu.pe',
            '75678901',
            'admin123',
            'Validacion',
            'Local',
            true
        );
    END IF;
END $$;

-- ============================================
-- DATOS DE PRUEBA - ASIGNACIÓN DE ROLES
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios_roles LIMIT 1) THEN
        INSERT INTO usuarios_roles (id_usuario, id_rol) 
        SELECT u.id_usuario, r.id_rol
        FROM usuarios u
        JOIN roles r ON 
            (u.username = '76551691' AND r.nombre = 'admin') OR
            (u.username = '74331380' AND r.nombre = 'auditor') OR
            (u.username = '71234567' AND r.nombre = 'desarrollo') OR
            (u.username = '72345678' AND r.nombre = 'directivo') OR
            (u.username = '73456789' AND r.nombre = 'funcional') OR
            (u.username = '74567890' AND r.nombre = 'infraestructura') OR
            (u.username = '75678901' AND r.nombre = 'validacion');
    END IF;
END $$;

-- ============================================
-- DATOS DE PRUEBA - AUDITORÍA
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auditoria LIMIT 1) THEN
        INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip) VALUES 
        ((SELECT id_usuario FROM usuarios WHERE username = '74331380'), 'Inventario', 'Consulta', 'El auditor consultó el inventario general de sistemas.', '192.168.1.10'),
        ((SELECT id_usuario FROM usuarios WHERE username = '74331380'), 'Auditoría', 'Consulta', 'El auditor consultó el historial de eventos del sistema.', '192.168.1.10'),
        ((SELECT id_usuario FROM usuarios WHERE username = '74331380'), 'Reportes', 'Exportación', 'El auditor exportó el reporte de inventario en Excel.', '192.168.1.10'),
        (NULL, 'Acceso', 'Intento fallido', 'Intento fallido de inicio de sesión mediante LDAP.', '192.168.1.90'),
        ((SELECT id_usuario FROM usuarios WHERE username = '76551691'), 'Sistemas', 'Registro', 'Se registró el sistema informático Sistema Académico.', '192.168.1.15');
    END IF;
END $$;

-- ============================================
-- DATOS DE PRUEBA - SISTEMAS
-- ============================================

INSERT INTO sistemas (
    codigo_unico, 
    nombre, 
    descripcion, 
    id_area_usuario, 
    id_tipo_aplicativo, 
    id_criticidad, 
    forma_adquisicion, 
    id_responsable_funcional, 
    id_responsable_tecnico, 
    ano_adquisicion, 
    desarrollador_nombre, 
    contrato_vigente, 
    es_legacy, 
    estado_flujo, 
    nivel_riesgo, 
    prioridad_migracion
) 
SELECT * FROM (VALUES 
    ('SYS-001', 'Sistema Académico', 'Matrícula, notas y currícula.', 1, 1, 3, 'Desarrollo CTIC', 2, 3, 2021, 'CTIC UNAS', false, false, 'VALIDADO', 'MEDIO', 'MEDIANO PLAZO'),
    ('SYS-002', 'Trámite Documentario', 'Gestión de documentos internos.', 2, 1, 3, 'Proveedor externo', 4, 3, 2020, 'Proveedor externo', true, false, 'OBSERVADO', 'ALTO', 'CORTO PLAZO'),
    ('SYS-003', 'Sistema de Biblioteca', 'Catálogo bibliográfico, préstamos y devoluciones.', 3, 1, 2, 'Desarrollo interno', 5, NULL, 2015, 'Equipo anterior CTIC', false, true, 'OBSERVADO', 'CRITICO', 'INMEDIATA'),
    ('SYS-004', 'Recursos Humanos', 'Gestión de personal, asistencia, contratos y planillas.', 4, 1, 3, 'Compra', 6, 3, 2019, 'Proveedor RRHH', true, false, 'VALIDADO', 'BAJO', 'MONITOREO'),
    ('SYS-005', 'Sistema Financiero', 'Control de ingresos, egresos, pagos y reportes financieros.', 5, 1, 4, 'Proveedor externo', 7, 3, 2018, 'Proveedor Financiero', false, false, 'ENVIADO', 'ALTO', 'CORTO PLAZO')
) AS datos(
    codigo_unico, nombre, descripcion, 
    id_area_usuario, id_tipo_aplicativo, id_criticidad, 
    forma_adquisicion, id_responsable_funcional, id_responsable_tecnico, 
    ano_adquisicion, desarrollador_nombre, contrato_vigente, 
    es_legacy, estado_flujo, nivel_riesgo, prioridad_migracion
)
WHERE NOT EXISTS (SELECT 1 FROM sistemas LIMIT 1);

-- ============================================
-- DATOS DE PRUEBA - VALIDACIONES
-- ============================================

INSERT INTO validaciones (
    id_sistema,
    id_validador,
    estado_validacion,
    resultado,
    observacion_general,
    fecha_creacion
)
SELECT 
    s.id_sistema,
    (SELECT id_usuario FROM usuarios WHERE username = '76551691'),
    'PENDIENTE',
    'PENDIENTE',
    'Sistema enviado para validación inicial.',
    NOW()
FROM sistemas s
WHERE NOT EXISTS (SELECT 1 FROM validaciones v WHERE v.id_sistema = s.id_sistema);

-- ============================================
-- DATOS DE PRUEBA - OBSERVACIONES
-- ============================================

INSERT INTO observaciones (
    id_sistema,
    id_validacion,
    descripcion,
    estado_observacion,
    id_usuario_observa,
    fecha_observacion
)
SELECT 
    s.id_sistema,
    v.id_validacion,
    'Se requiere revisar la documentación técnica del sistema. Faltan evidencias de pruebas de seguridad.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '74331380'),
    NOW()
FROM sistemas s
JOIN validaciones v ON s.id_sistema = v.id_sistema
WHERE s.id_sistema = 2
AND NOT EXISTS (SELECT 1 FROM observaciones o WHERE o.id_sistema = s.id_sistema);

INSERT INTO observaciones (
    id_sistema,
    id_validacion,
    descripcion,
    estado_observacion,
    id_usuario_observa,
    fecha_observacion
)
SELECT 
    s.id_sistema,
    v.id_validacion,
    'El sistema tiene riesgos críticos de seguridad. Se debe implementar autenticación de dos factores.',
    'PENDIENTE',
    (SELECT id_usuario FROM usuarios WHERE username = '74331380'),
    NOW()
FROM sistemas s
JOIN validaciones v ON s.id_sistema = v.id_sistema
WHERE s.id_sistema = 3
AND NOT EXISTS (SELECT 1 FROM observaciones o WHERE o.id_sistema = s.id_sistema);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

DO $$
DECLARE
    rol_count INTEGER;
    user_count INTEGER;
    role_assign_count INTEGER;
    audit_count INTEGER;
    catalogo_count INTEGER;
    sistema_count INTEGER;
    validacion_count INTEGER;
    observacion_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rol_count FROM roles;
    SELECT COUNT(*) INTO user_count FROM usuarios;
    SELECT COUNT(*) INTO role_assign_count FROM usuarios_roles;
    SELECT COUNT(*) INTO audit_count FROM auditoria;
    SELECT COUNT(*) INTO catalogo_count FROM catalogos;
    SELECT COUNT(*) INTO sistema_count FROM sistemas;
    SELECT COUNT(*) INTO validacion_count FROM validaciones;
    SELECT COUNT(*) INTO observacion_count FROM observaciones;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'INICIALIZACIÓN DE BASE DE DATOS COMPLETADA';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Roles insertados: %', rol_count;
    RAISE NOTICE 'Usuarios insertados: %', user_count;
    RAISE NOTICE 'Asignaciones de roles: %', role_assign_count;
    RAISE NOTICE 'Eventos de auditoría: %', audit_count;
    RAISE NOTICE 'Catálogos insertados: %', catalogo_count;
    RAISE NOTICE 'Sistemas insertados: %', sistema_count;
    RAISE NOTICE 'Validaciones insertadas: %', validacion_count;
    RAISE NOTICE 'Observaciones insertadas: %', observacion_count;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'CREDENCIALES DE PRUEBA:';
    RAISE NOTICE '  DNI: 76551691 -> admin (admin123)';
    RAISE NOTICE '  DNI: 74331380 -> auditor (admin123)';
    RAISE NOTICE '  DNI: 71234567 -> desarrollo (admin123)';
    RAISE NOTICE '  DNI: 72345678 -> directivo (admin123)';
    RAISE NOTICE '  DNI: 73456789 -> funcional (admin123)';
    RAISE NOTICE '  DNI: 74567890 -> infraestructura (admin123)';
    RAISE NOTICE '  DNI: 75678901 -> validacion (admin123)';
    RAISE NOTICE '============================================';
END $$;

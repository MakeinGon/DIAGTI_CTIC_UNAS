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
\i /docker-entrypoint-initdb.d/modules/observaciones.sql
\i /docker-entrypoint-initdb.d/modules/evidencias.sql

-- 6. PERMISOS
\i /docker-entrypoint-initdb.d/modules/permisos.sql

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- Insertar roles
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

-- Insertar catálogos
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

-- Insertar usuarios con contraseñas EN TEXTO PLANO
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
            'admin123',  -- ✅ TEXTO PLANO
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
            'admin123',  -- ✅ TEXTO PLANO
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
            'admin123',  -- ✅ TEXTO PLANO
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
            'admin123',  -- ✅ TEXTO PLANO
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
            'admin123',  -- ✅ TEXTO PLANO
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
            'admin123',  -- ✅ TEXTO PLANO
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
            'admin123',  -- ✅ TEXTO PLANO
            'Validacion',
            'Local',
            true
        );
    END IF;
END $$;

-- Asignar roles a usuarios
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

-- Insertar eventos de auditoría
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
-- VERIFICACIÓN FINAL
-- ============================================
DO $$
DECLARE
    rol_count INTEGER;
    user_count INTEGER;
    role_assign_count INTEGER;
    audit_count INTEGER;
    catalogo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rol_count FROM roles;
    SELECT COUNT(*) INTO user_count FROM usuarios;
    SELECT COUNT(*) INTO role_assign_count FROM usuarios_roles;
    SELECT COUNT(*) INTO audit_count FROM auditoria;
    SELECT COUNT(*) INTO catalogo_count FROM catalogos;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'INICIALIZACIÓN DE BASE DE DATOS COMPLETADA';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Roles insertados: %', rol_count;
    RAISE NOTICE 'Usuarios insertados: %', user_count;
    RAISE NOTICE 'Asignaciones de roles: %', role_assign_count;
    RAISE NOTICE 'Eventos de auditoría: %', audit_count;
    RAISE NOTICE 'Catálogos insertados: %', catalogo_count;
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
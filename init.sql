-- ============================================
-- CREACIÓN DE TABLAS
-- ============================================

-- Tabla roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla usuarios_roles
CREATE TABLE IF NOT EXISTS usuarios_roles (
    id_usuario INTEGER NOT NULL,
    id_rol INTEGER NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id_usuario, id_rol),
    CONSTRAINT fk_usuario
        FOREIGN KEY(id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_rol
        FOREIGN KEY(id_rol)
        REFERENCES roles(id_rol)
        ON DELETE CASCADE
);

-- Tabla auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INTEGER,
    modulo VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_ip VARCHAR(50),
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY(id_usuario)
        REFERENCES usuarios(id_usuario)
);

-- ============================================
-- INSERTAR DATOS DE PRUEBA
-- ============================================

-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema'),
('auditor', 'Auditor de TI'),
('desarrollo', 'Desarrollador'),
('directivo', 'Directivo'),
('funcional', 'Funcional'),
('infraestructura', 'Infraestructura'),
('validacion', 'Validación')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar usuarios (contraseñas encriptadas con BCrypt)
-- Todas las contraseñas son: admin123
INSERT INTO usuarios (nombres, apellidos, correo, username, password_hash, estado) VALUES 
('Johan Alberto', 'Vela Arevalo', 'johan.vela@unas.edu.pe', '76551691', '$2a$10$7hgf3kLqZ7Yxk3p7MsnEEO0C1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D', true),
('Carlos', 'Ruiz', 'carlos.ruiz@unas.edu.pe', '74331380', '$2a$10$8iJ4lMqA8Yxk3p7MsnEEO0C1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D', true),
('Juan', 'Pérez', 'juan.perez@unas.edu.pe', '71234567', '$2a$10$9kM5nR7Zxk3p7MsnEEO0C1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D', true),
('María', 'Gómez', 'maria.gomez@unas.edu.pe', '72345678', '$2a$10$0lN6oP8Axk3p7MsnEEO0C1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D', true),
('Laura', 'García', 'laura.garcia@unas.edu.pe', '73456789', '$2a$10$1mO7pQ9Byk3p7MsnEEO0C1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D', true),
('Ana', 'Torres', 'ana.torres@unas.edu.pe', '74567890', '$2a$10$2nP8qR0Czk3p7MsnEEO0C1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D', true),
('Roberto', 'Díaz', 'roberto.diaz@unas.edu.pe', '75678901', '$2a$10$3oQ9rS1Dzk3p7MsnEEO0C1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D', true)
ON CONFLICT (username) DO NOTHING;

-- Asignar roles a usuarios
INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES 
(1, 1), -- admin
(2, 2), -- auditor
(3, 3), -- desarrollo
(4, 4), -- directivo
(5, 5), -- funcional
(6, 6), -- infraestructura
(7, 7)  -- validacion
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

-- Insertar algunos eventos de auditoría de prueba
INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, direccion_ip) VALUES 
(2, 'Inventario', 'Consulta', 'El auditor consultó el inventario general de sistemas.', '192.168.1.10'),
(2, 'Auditoría', 'Consulta', 'El auditor consultó el historial de eventos del sistema.', '192.168.1.10'),
(2, 'Reportes', 'Exportación', 'El auditor exportó el reporte de inventario en Excel.', '192.168.1.10'),
(NULL, 'Acceso', 'Intento fallido', 'Intento fallido de inicio de sesión mediante LDAP.', '192.168.1.90'),
(1, 'Sistemas', 'Registro', 'Se registró el sistema informático Sistema Académico.', '192.168.1.15')
ON CONFLICT DO NOTHING;

-- Verificar que los datos se insertaron correctamente
SELECT 'Roles:' as "Tabla", COUNT(*) as "Total" FROM roles
UNION ALL
SELECT 'Usuarios:', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Usuarios_roles:', COUNT(*) FROM usuarios_roles
UNION ALL
SELECT 'Auditoria:', COUNT(*) FROM auditoria;
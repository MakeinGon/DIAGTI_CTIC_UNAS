-- DataBase/modules/usuarios.sql

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE,
    correo VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    area VARCHAR(100),
    origen VARCHAR(20) DEFAULT 'LDAP',
    ultimo_acceso TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- USUARIOS DE PRUEBA
-- Contraseña para todos: admin123
-- Origen: Local (para probar sin LDAP)
-- ============================================

INSERT INTO usuarios
(
    nombres,
    apellidos,
    dni,
    correo,
    username,
    password_hash,
    area,
    origen,
    estado
)
VALUES

(
    'Johan Alberto',
    'Vela Arevalo',
    '76551691',
    'johan.vela@unas.edu.pe',
    '76551691',
    'TU_BCRYPT_AQUI',
    'CTIC',
    'Local',
    TRUE
),

(
    'Carlos',
    'Ruiz',
    '74331380',
    'carlos.ruiz@unas.edu.pe',
    '74331380',
    'TU_BCRYPT_AQUI',
    'Auditoria',
    'Local',
    TRUE
),

(
    'Juan',
    'Perez',
    '71234567',
    'juan.perez@unas.edu.pe',
    '71234567',
    'TU_BCRYPT_AQUI',
    'Desarrollo',
    'Local',
    TRUE
),

(
    'Maria',
    'Gomez',
    '72345678',
    'maria.gomez@unas.edu.pe',
    '72345678',
    'TU_BCRYPT_AQUI',
    'Direccion',
    'Local',
    TRUE
),

(
    'Laura',
    'Garcia',
    '73456789',
    'laura.garcia@unas.edu.pe',
    '73456789',
    'TU_BCRYPT_AQUI',
    'Funcional',
    'Local',
    TRUE
),

(
    'Ana',
    'Torres',
    '74567890',
    'ana.torres@unas.edu.pe',
    '74567890',
    'TU_BCRYPT_AQUI',
    'Infraestructura',
    'Local',
    TRUE
),

(
    'Roberto',
    'Diaz',
    '75678901',
    'roberto.diaz@unas.edu.pe',
    '75678901',
    'TU_BCRYPT_AQUI',
    'Validacion',
    'Local',
    TRUE
)

ON CONFLICT(username) DO NOTHING;

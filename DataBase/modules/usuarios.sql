-- DataBase/modules/usuarios.sql

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE,                             -- NUEVO
    correo VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    area VARCHAR(100),                                 -- NUEVO
    origen VARCHAR(20) DEFAULT 'LDAP',                 -- NUEVO: 'LDAP' o 'Local'
    ultimo_acceso TIMESTAMP,                           -- NUEVO
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- USUARIOS DEL SISTEMA
-- ============================================

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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50),
    modificado_por VARCHAR(50),
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado BOOLEAN DEFAULT FALSE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_bloqueado ON usuarios(bloqueado);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_usuarios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_usuarios_timestamp ON usuarios;
CREATE TRIGGER trigger_update_usuarios_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_usuarios_timestamp();

COMMENT ON TABLE usuarios IS 'Usuarios del sistema DIAGTI';
COMMENT ON COLUMN usuarios.id_usuario IS 'Identificador único del usuario';
COMMENT ON COLUMN usuarios.nombres IS 'Nombres del usuario';
COMMENT ON COLUMN usuarios.apellidos IS 'Apellidos del usuario';
COMMENT ON COLUMN usuarios.dni IS 'DNI del usuario (único)';
COMMENT ON COLUMN usuarios.correo IS 'Correo electrónico (único)';
COMMENT ON COLUMN usuarios.username IS 'Nombre de usuario para login';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash de la contraseña (BCrypt)';
COMMENT ON COLUMN usuarios.area IS 'Área o departamento del usuario';
COMMENT ON COLUMN usuarios.origen IS 'Origen del usuario (LDAP, Local, etc.)';
COMMENT ON COLUMN usuarios.ultimo_acceso IS 'Fecha del último acceso exitoso';
COMMENT ON COLUMN usuarios.estado IS 'Estado del usuario (true=activo)';
COMMENT ON COLUMN usuarios.fecha_creacion IS 'Fecha de creación del registro';
COMMENT ON COLUMN usuarios.fecha_modificacion IS 'Fecha de última modificación';
COMMENT ON COLUMN usuarios.intentos_fallidos IS 'Número de intentos fallidos de login';
COMMENT ON COLUMN usuarios.bloqueado IS 'Indica si el usuario está bloqueado';
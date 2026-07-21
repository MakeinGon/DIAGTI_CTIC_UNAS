-- ============================================
-- ROLES DEL SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50),
    modificado_por VARCHAR(50)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_roles_nombre ON roles(nombre);
CREATE INDEX IF NOT EXISTS idx_roles_estado ON roles(estado);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_roles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_roles_timestamp ON roles;
CREATE TRIGGER trigger_update_roles_timestamp
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_roles_timestamp();

COMMENT ON TABLE roles IS 'Roles del sistema para control de acceso';
COMMENT ON COLUMN roles.id_rol IS 'Identificador único del rol';
COMMENT ON COLUMN roles.nombre IS 'Nombre del rol (ej: admin, auditor)';
COMMENT ON COLUMN roles.descripcion IS 'Descripción del rol';
COMMENT ON COLUMN roles.estado IS 'Estado del rol (true=activo)';
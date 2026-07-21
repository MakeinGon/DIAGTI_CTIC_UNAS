-- ============================================
-- ASIGNACIÓN DE ROLES A USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios_roles (
    id_usuario INTEGER NOT NULL,
    id_rol INTEGER NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por VARCHAR(50),
    PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) 
        REFERENCES roles(id_rol) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON usuarios_roles(id_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON usuarios_roles(id_rol);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_usuarios_roles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_usuarios_roles_timestamp ON usuarios_roles;
CREATE TRIGGER trigger_update_usuarios_roles_timestamp
BEFORE UPDATE ON usuarios_roles
FOR EACH ROW
EXECUTE FUNCTION update_usuarios_roles_timestamp();

COMMENT ON TABLE usuarios_roles IS 'Asignación de roles a usuarios';
COMMENT ON COLUMN usuarios_roles.id_usuario IS 'ID del usuario';
COMMENT ON COLUMN usuarios_roles.id_rol IS 'ID del rol asignado';
COMMENT ON COLUMN usuarios_roles.fecha_asignacion IS 'Fecha de asignación del rol';
COMMENT ON COLUMN usuarios_roles.fecha_modificacion IS 'Fecha de última modificación';
COMMENT ON COLUMN usuarios_roles.asignado_por IS 'Usuario que asignó el rol';
-- ============================================
-- AUDITORÍA DEL SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INTEGER,
    modulo VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_ip VARCHAR(50),
    user_agent VARCHAR(255),
    sesion_id VARCHAR(100),
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY(id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_evento DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_modulo ON auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);

COMMENT ON TABLE auditoria IS 'Registro de auditoría del sistema';
COMMENT ON COLUMN auditoria.id_auditoria IS 'Identificador único del registro';
COMMENT ON COLUMN auditoria.id_usuario IS 'Usuario que realizó la acción';
COMMENT ON COLUMN auditoria.modulo IS 'Módulo del sistema donde ocurrió el evento';
COMMENT ON COLUMN auditoria.accion IS 'Acción realizada (consulta, exportación, etc.)';
COMMENT ON COLUMN auditoria.descripcion IS 'Descripción detallada del evento';
COMMENT ON COLUMN auditoria.fecha_evento IS 'Fecha y hora del evento';
COMMENT ON COLUMN auditoria.direccion_ip IS 'Dirección IP de origen';
COMMENT ON COLUMN auditoria.user_agent IS 'Navegador/agente de usuario';
COMMENT ON COLUMN auditoria.sesion_id IS 'ID de sesión del usuario';
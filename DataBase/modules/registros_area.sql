CREATE TABLE IF NOT EXISTS registros_area (
    id_registro BIGSERIAL PRIMARY KEY,
    codigo_sistema VARCHAR(80) NOT NULL,
    nombre_sistema VARCHAR(200) NOT NULL,
    area_origen VARCHAR(60) NOT NULL,
    area_usuaria VARCHAR(150),
    responsable VARCHAR(180),
    usuario_origen VARCHAR(100),
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    datos_json TEXT NOT NULL DEFAULT '{}',
    comentario_revision TEXT,
    observaciones_json TEXT,
    revisado_por VARCHAR(180),
    usuario_revisor VARCHAR(100),
    fecha_envio TIMESTAMP,
    fecha_revision TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_registro_area_codigo_origen UNIQUE (codigo_sistema, area_origen)
);

CREATE INDEX IF NOT EXISTS idx_registros_area_origen_usuario
    ON registros_area (area_origen, usuario_origen, fecha_actualizacion DESC);

CREATE INDEX IF NOT EXISTS idx_registros_area_estado
    ON registros_area (area_origen, estado);

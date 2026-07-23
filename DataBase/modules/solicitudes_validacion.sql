CREATE TABLE IF NOT EXISTS solicitudes_validacion (
    id_solicitud BIGSERIAL PRIMARY KEY,
    codigo_sistema VARCHAR(80) NOT NULL,
    nombre_sistema VARCHAR(200) NOT NULL,
    area_origen VARCHAR(60) NOT NULL,
    area_usuaria VARCHAR(150),
    responsable VARCHAR(180),
    usuario_origen VARCHAR(100),
    estado VARCHAR(30) NOT NULL,
    comentario TEXT,
    comentario_revision TEXT,
    observaciones_json TEXT,
    revisado_por VARCHAR(180),
    usuario_revisor VARCHAR(100),
    datos_json TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP
);

ALTER TABLE solicitudes_validacion ADD COLUMN IF NOT EXISTS comentario_revision TEXT;
ALTER TABLE solicitudes_validacion ADD COLUMN IF NOT EXISTS observaciones_json TEXT;
ALTER TABLE solicitudes_validacion ADD COLUMN IF NOT EXISTS revisado_por VARCHAR(180);
ALTER TABLE solicitudes_validacion ADD COLUMN IF NOT EXISTS usuario_origen VARCHAR(100);
ALTER TABLE solicitudes_validacion ADD COLUMN IF NOT EXISTS usuario_revisor VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_solicitudes_validacion_estado_fecha
    ON solicitudes_validacion (estado, fecha_envio DESC);

CREATE INDEX IF NOT EXISTS idx_solicitudes_validacion_codigo_origen
    ON solicitudes_validacion (codigo_sistema, area_origen);

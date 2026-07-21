-- ============================================
-- CATÁLOGOS DEL SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS catalogos (
    id_catalogo SERIAL PRIMARY KEY,
    tipo_catalogo VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    orden INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50),
    modificado_por VARCHAR(50)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_catalogos_tipo ON catalogos(tipo_catalogo);
CREATE INDEX IF NOT EXISTS idx_catalogos_codigo ON catalogos(codigo);
CREATE INDEX IF NOT EXISTS idx_catalogos_estado ON catalogos(estado);

-- Restricción única por tipo_catalogo + codigo
ALTER TABLE catalogos DROP CONSTRAINT IF EXISTS uk_catalogos_tipo_codigo;
ALTER TABLE catalogos ADD CONSTRAINT uk_catalogos_tipo_codigo UNIQUE (tipo_catalogo, codigo);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_catalogos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_catalogos_timestamp ON catalogos;
CREATE TRIGGER trigger_update_catalogos_timestamp
BEFORE UPDATE ON catalogos
FOR EACH ROW
EXECUTE FUNCTION update_catalogos_timestamp();

COMMENT ON TABLE catalogos IS 'Catálogos del sistema para valores maestros';
COMMENT ON COLUMN catalogos.id_catalogo IS 'Identificador único del catálogo';
COMMENT ON COLUMN catalogos.tipo_catalogo IS 'Tipo de catálogo (ej: TIPO_APLICATIVO, CRITICIDAD)';
COMMENT ON COLUMN catalogos.codigo IS 'Código del valor (ej: WEB, ALTO)';
COMMENT ON COLUMN catalogos.valor IS 'Valor descriptivo (ej: Aplicativo Web, Alta)';
COMMENT ON COLUMN catalogos.descripcion IS 'Descripción adicional del valor';
COMMENT ON COLUMN catalogos.estado IS 'Estado del registro (true=activo)';
COMMENT ON COLUMN catalogos.orden IS 'Orden para visualización';
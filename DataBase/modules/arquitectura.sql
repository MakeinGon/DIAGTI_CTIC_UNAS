-- ============================================
-- ARQUITECTURA DEL SISTEMA
-- ============================================

-- Primero verificar que la tabla sistemas existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sistemas') THEN
        RAISE NOTICE 'La tabla sistemas no existe, creando arquitectura sin la restricción...';
        -- Crear tabla sin la restricción
        CREATE TABLE IF NOT EXISTS arquitectura (
            id_arquitectura SERIAL PRIMARY KEY,
            id_sistema INTEGER NOT NULL,
            tipo_arquitectura VARCHAR(100) NOT NULL,
            patron_arquitectonico VARCHAR(100),
            descripcion_tecnica TEXT,
            observaciones TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Crear tabla con la restricción
        CREATE TABLE IF NOT EXISTS arquitectura (
            id_arquitectura SERIAL PRIMARY KEY,
            id_sistema INTEGER NOT NULL,
            tipo_arquitectura VARCHAR(100) NOT NULL,
            patron_arquitectonico VARCHAR(100),
            descripcion_tecnica TEXT,
            observaciones TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_arquitectura_sistema
                FOREIGN KEY(id_sistema)
                REFERENCES sistemas(id_sistema)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        );
    END IF;
END $$;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_arquitectura_sistema ON arquitectura(id_sistema);

-- Insertar datos de prueba (si no hay datos)
INSERT INTO arquitectura (id_sistema, tipo_arquitectura, patron_arquitectonico, descripcion_tecnica)
SELECT 
    s.id_sistema,
    'Monolítica',
    'MVC',
    'Arquitectura monolítica con patrón MVC'
FROM sistemas s
WHERE NOT EXISTS (SELECT 1 FROM arquitectura LIMIT 1)
LIMIT 1;

COMMENT ON TABLE arquitectura IS 'Información de arquitectura de los sistemas';
COMMENT ON COLUMN arquitectura.id_arquitectura IS 'Identificador único';
COMMENT ON COLUMN arquitectura.id_sistema IS 'Sistema al que pertenece';
COMMENT ON COLUMN arquitectura.tipo_arquitectura IS 'Tipo de arquitectura (Monolítica, Microservicios, etc.)';
COMMENT ON COLUMN arquitectura.patron_arquitectonico IS 'Patrón arquitectónico utilizado';
COMMENT ON COLUMN arquitectura.descripcion_tecnica IS 'Descripción técnica de la arquitectura';
COMMENT ON COLUMN arquitectura.observaciones IS 'Observaciones adicionales';
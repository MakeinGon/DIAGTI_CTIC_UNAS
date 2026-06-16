CREATE TABLE IF NOT EXISTS catalogos (
    id_catalogo SERIAL PRIMARY KEY,
    tipo_catalogo VARCHAR(50) NOT NULL, -- Ej: 'TIPO_APLICATIVO', 'CRITICIDAD'
    codigo VARCHAR(20) NOT NULL,        -- Ej: 'WEB', 'ALTO'
    valor VARCHAR(255) NOT NULL,        -- Ej: 'Aplicativo Web'
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE,        -- Sigue el estándar BOOLEAN de tu equipo
    orden INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS observaciones (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,
    sistema_nombre VARCHAR(255)
);

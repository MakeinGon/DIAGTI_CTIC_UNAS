CREATE TABLE IF NOT EXISTS validaciones (
    id BIGSERIAL PRIMARY KEY,
    sistema_nombre VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_accion TIMESTAMP NOT NULL,
    observaciones TEXT
);

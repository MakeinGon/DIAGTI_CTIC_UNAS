CREATE TABLE IF NOT EXISTS sistemas (
    id_sistema BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT
);

INSERT INTO sistemas (id_sistema, nombre, descripcion)
VALUES (1, 'Agrosync', 'Sistema de validación de ejemplo')
ON CONFLICT (id_sistema) DO NOTHING;

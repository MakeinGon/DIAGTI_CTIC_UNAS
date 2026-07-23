CREATE TABLE IF NOT EXISTS validaciones (
    id_validacion SERIAL PRIMARY KEY,
    id_sistema INTEGER NOT NULL,
    id_validador INTEGER,
    estado_validacion VARCHAR(50) NOT NULL,
    resultado VARCHAR(50),
    observacion_general TEXT,
    fecha_validacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_subsanacion TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_validaciones_sistema
        FOREIGN KEY (id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_validaciones_validador
        FOREIGN KEY (id_validador)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
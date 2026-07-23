CREATE TABLE IF NOT EXISTS observaciones (
    id_observacion SERIAL PRIMARY KEY,
    id_sistema INTEGER NOT NULL,
    id_validacion INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    estado_observacion VARCHAR(50) DEFAULT 'PENDIENTE',
    respuesta_subsanacion TEXT,
    id_usuario_observa INTEGER,
    id_usuario_subsana INTEGER,
    fecha_observacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_subsanacion TIMESTAMP,

    CONSTRAINT fk_observaciones_sistema
        FOREIGN KEY (id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_observaciones_validacion
        FOREIGN KEY (id_validacion)
        REFERENCES validaciones(id_validacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_observaciones_usuario_observa
        FOREIGN KEY (id_usuario_observa)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_observaciones_usuario_subsana
        FOREIGN KEY (id_usuario_subsana)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS evidencias (
    id_evidencia SERIAL PRIMARY KEY,
    id_sistema INTEGER NOT NULL,
    tipo_evidencia VARCHAR(100) NOT NULL,
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(500),
    url_evidencia VARCHAR(500),
    descripcion TEXT,
    tamano_archivo BIGINT,
    extension_archivo VARCHAR(20),
    estado_evidencia VARCHAR(50) DEFAULT 'ACTIVA',
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_carga INTEGER,

    CONSTRAINT fk_evidencias_sistema
        FOREIGN KEY (id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_evidencias_usuario_carga
        FOREIGN KEY (id_usuario_carga)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
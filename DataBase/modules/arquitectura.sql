CREATE TABLE arquitectura (

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

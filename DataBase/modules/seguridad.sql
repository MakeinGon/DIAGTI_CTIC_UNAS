CREATE TABLE seguridad (

    id_seguridad SERIAL PRIMARY KEY,

    id_sistema INTEGER NOT NULL,

    tipo_control VARCHAR(100) NOT NULL,

    mecanismo_autenticacion VARCHAR(100) NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_seguridad_sistema
        FOREIGN KEY(id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE

);

CREATE TABLE infraestructura (

    id_infraestructura SERIAL PRIMARY KEY,

    id_sistema INTEGER NOT NULL,

    capacidad_recursos TEXT NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_infraestructura_sistema
        FOREIGN KEY(id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE

);

CREATE TABLE auditoria (

    id_auditoria SERIAL PRIMARY KEY,

    id_usuario INTEGER,

    modulo VARCHAR(100) NOT NULL,

    accion VARCHAR(50) NOT NULL,

    descripcion TEXT,

    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    direccion_ip VARCHAR(50),

    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY(id_usuario)
        REFERENCES usuarios(id_usuario)

);
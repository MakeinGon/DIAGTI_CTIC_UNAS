CREATE TABLE usuarios_roles (

    id_usuario INTEGER NOT NULL,

    id_rol INTEGER NOT NULL,

    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(id_usuario, id_rol),

    CONSTRAINT fk_usuario
        FOREIGN KEY(id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_rol
        FOREIGN KEY(id_rol)
        REFERENCES roles(id_rol)
        ON DELETE CASCADE

);
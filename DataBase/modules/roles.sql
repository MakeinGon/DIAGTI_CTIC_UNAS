CREATE TABLE roles (

    id_rol SERIAL PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    descripcion VARCHAR(255),

    estado BOOLEAN DEFAULT TRUE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
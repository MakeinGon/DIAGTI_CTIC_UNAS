CREATE TABLE usuarios (

    id_usuario SERIAL PRIMARY KEY,

    nombres VARCHAR(100) NOT NULL,

    apellidos VARCHAR(100) NOT NULL,

    correo VARCHAR(150) NOT NULL UNIQUE,

    username VARCHAR(50) NOT NULL UNIQUE,

    password_hash VARCHAR(255),

    estado BOOLEAN DEFAULT TRUE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
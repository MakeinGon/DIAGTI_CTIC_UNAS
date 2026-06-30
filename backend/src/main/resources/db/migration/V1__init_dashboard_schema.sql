CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalogos (
    id_catalogo SERIAL PRIMARY KEY,
    tipo_catalogo VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    orden INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sistemas (
    id_sistema SERIAL PRIMARY KEY,
    codigo_unico VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    id_area_usuario INTEGER,
    id_tipo_aplicativo INTEGER,
    id_criticidad INTEGER REFERENCES catalogos(id_catalogo),
    forma_adquisicion VARCHAR(100),
    id_responsable_funcional INTEGER,
    id_responsable_tecnico INTEGER,
    ano_adquisicion INTEGER,
    desarrollador_nombre VARCHAR(255),
    contrato_vigente BOOLEAN DEFAULT FALSE,
    fecha_vencimiento_soporte DATE,
    es_legacy BOOLEAN DEFAULT FALSE,
    estado_flujo VARCHAR(50),
    nivel_riesgo VARCHAR(20),
    prioridad_migracion VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_eliminacion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    modulo VARCHAR(100) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_ip VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_auditoria_modulo ON auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_evento);

-- =========================================================================
-- V1__schema_baseline.sql
-- Esquema base del sistema DIAGTI, replicado desde DataBase/modules/*.sql
-- Se mantiene el mismo orden de dependencias definido en DataBase/init.sql
-- =========================================================================

-- ---------------------------------------------------------------------
-- Módulo: Usuarios y roles
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- ---------------------------------------------------------------------
-- Módulo: Catálogos
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Módulo: Inventario de sistemas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sistemas (
    id_sistema SERIAL PRIMARY KEY,
    codigo_unico VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,

    id_area_usuario INTEGER REFERENCES catalogos(id_catalogo) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_tipo_aplicativo INTEGER REFERENCES catalogos(id_catalogo) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_criticidad INTEGER REFERENCES catalogos(id_catalogo) ON UPDATE CASCADE ON DELETE RESTRICT,

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
    fecha_eliminacion TIMESTAMP,

    CONSTRAINT fk_sistemas_responsable_tecnico
        FOREIGN KEY(id_responsable_tecnico)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS integraciones (
    id_integracion SERIAL PRIMARY KEY,
    id_sistema_origen INTEGER NOT NULL REFERENCES sistemas(id_sistema) ON DELETE CASCADE,
    id_sistema_destino INTEGER REFERENCES sistemas(id_sistema) ON DELETE SET NULL,
    protocolo VARCHAR(100),
    metodo_intercambio VARCHAR(100),
    frecuencia VARCHAR(50),
    estado VARCHAR(50),
    id_responsable INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Módulo: Arquitectura
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS arquitectura (
    id_arquitectura SERIAL PRIMARY KEY,
    id_sistema INTEGER NOT NULL,
    lenguaje VARCHAR(100),
    version_lenguaje VARCHAR(50),
    framework VARCHAR(100),
    version_framework VARCHAR(50),
    patron_arquitectura VARCHAR(100),
    repositorio VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_arquitectura_sistema
        FOREIGN KEY(id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Módulo: Infraestructura (área a cargo de esta rama)
-- ---------------------------------------------------------------------
CREATE TABLE infraestructura (
    id_infraestructura SERIAL PRIMARY KEY,
    id_sistema INTEGER NOT NULL,
    capacidad_recursos TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_infraestructura_sistema
        FOREIGN KEY(id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Módulo: Seguridad
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Módulo: Evidencias, validaciones y observaciones
-- ---------------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS validaciones (
    id_validacion SERIAL PRIMARY KEY,
    id_sistema INTEGER NOT NULL,
    id_validador INTEGER,
    estado_validacion VARCHAR(50) NOT NULL,
    resultado VARCHAR(50),
    observacion_general TEXT,
    fecha_validacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_subsanacion TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_validaciones_sistema
        FOREIGN KEY (id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_validaciones_validador
        FOREIGN KEY (id_validador)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

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

CREATE TABLE IF NOT EXISTS sistemas (
    id_sistema SERIAL PRIMARY KEY,
    codigo_unico VARCHAR(50) UNIQUE NOT NULL, -- RN-01: Código único institucional
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Llaves Foráneas hacia Catálogos
    id_area_usuario INTEGER REFERENCES catalogos(id_catalogo) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_tipo_aplicativo INTEGER REFERENCES catalogos(id_catalogo) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_criticidad INTEGER REFERENCES catalogos(id_catalogo) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- Datos Contractuales y de Gestión
    forma_adquisicion VARCHAR(100),
    id_responsable_funcional INTEGER, 
    id_responsable_tecnico INTEGER, 
    ano_adquisicion INTEGER,
    desarrollador_nombre VARCHAR(255),
    contrato_vigente BOOLEAN DEFAULT FALSE,
    fecha_vencimiento_soporte DATE,
    es_legacy BOOLEAN DEFAULT FALSE,
    
    -- Flujo y Diagnóstico
    estado_flujo VARCHAR(50),      
    nivel_riesgo VARCHAR(20),      
    prioridad_migracion VARCHAR(20), 
    
    -- Auditoría Temporal y Eliminación Lógica (RN-11, RNF-23)
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_eliminacion TIMESTAMP,
    
    -- Restricción de Llave Foránea hacia la tabla de Usuarios de tu equipo
    CONSTRAINT fk_sistemas_responsable_tecnico
        FOREIGN KEY(id_responsable_tecnico)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
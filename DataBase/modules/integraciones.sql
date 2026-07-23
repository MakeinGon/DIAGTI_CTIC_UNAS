CREATE TABLE IF NOT EXISTS integraciones (
    id_integracion SERIAL PRIMARY KEY,
    id_sistema_origen INTEGER NOT NULL,
    id_sistema_destino INTEGER NOT NULL,
    protocolo VARCHAR(50),              -- REST API, SOAP
    metodo_intercambio VARCHAR(100),     -- JSON, XML
    frecuencia VARCHAR(50),             -- Tiempo real, Diario
    estado VARCHAR(20),                 -- Activo, Inactivo
    responsable_nombre VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones de Llave Foránea hacia tu tabla de sistemas
    CONSTRAINT fk_integracion_sistema_origen
        FOREIGN KEY(id_sistema_origen)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
        
    CONSTRAINT fk_integracion_sistema_destino
        FOREIGN KEY(id_sistema_destino)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
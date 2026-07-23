-- =============================================================================
-- Migración segura: ficha técnica de Desarrollo sobre tablas oficiales
-- Fecha: 2026-07-23
-- No usa ddl-auto. No toca SYS-001…SYS-006 datos; solo esquema.
-- Backup previo requerido en Backups/
-- =============================================================================

-- 1) Observaciones de desarrollo en sistemas
ALTER TABLE sistemas
    ADD COLUMN IF NOT EXISTS observaciones_desarrollo TEXT;

-- 2) Ampliar arquitectura oficial (FK ya apunta a sistemas.id_sistema)
ALTER TABLE arquitectura
    ADD COLUMN IF NOT EXISTS lenguaje_programacion VARCHAR(255);

ALTER TABLE arquitectura
    ADD COLUMN IF NOT EXISTS version_lenguaje VARCHAR(100);

ALTER TABLE arquitectura
    ADD COLUMN IF NOT EXISTS framework VARCHAR(255);

ALTER TABLE arquitectura
    ADD COLUMN IF NOT EXISTS version_framework VARCHAR(100);

ALTER TABLE arquitectura
    ADD COLUMN IF NOT EXISTS repositorio VARCHAR(500);

ALTER TABLE arquitectura
    ADD COLUMN IF NOT EXISTS tecnologias_complementarias TEXT;

ALTER TABLE arquitectura
    ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Una sola arquitectura activa por sistema (idempotente)
CREATE UNIQUE INDEX IF NOT EXISTS uq_arquitectura_id_sistema
    ON arquitectura (id_sistema);

-- 3) Declaración de BD por Desarrollo (separada de evaluación de Infraestructura)
CREATE TABLE IF NOT EXISTS base_datos_sistema (
    id_base_datos BIGSERIAL PRIMARY KEY,
    id_sistema BIGINT NOT NULL,
    motor VARCHAR(100),
    version_bd VARCHAR(100),
    tipo_bd VARCHAR(100),
    servidor VARCHAR(255),
    esquema VARCHAR(255),
    backup_activo BOOLEAN,
    frecuencia_backup VARCHAR(100),
    cifrado BOOLEAN,
    responsable VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_base_datos_sistema
        FOREIGN KEY (id_sistema) REFERENCES sistemas (id_sistema)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_base_datos_sistema UNIQUE (id_sistema)
);

COMMENT ON TABLE base_datos_sistema IS
    'Datos de BD declarados por Desarrollo; no sustituye evaluación de infraestructura';

-- 4) Integraciones: permitir uso oficial vía sistemas sin sistemas_informaticos
--    (tabla vacía al momento de la migración; conservar columnas legado)
ALTER TABLE integraciones
    ALTER COLUMN sistema_id DROP NOT NULL;

ALTER TABLE integraciones
    DROP CONSTRAINT IF EXISTS fkptiecf35rfhg60etevpg8vmp9;

ALTER TABLE integraciones
    ALTER COLUMN id DROP NOT NULL;

COMMENT ON COLUMN integraciones.sistema_id IS
    'Legado Hibernate hacia sistemas_informaticos; nullable para altas oficiales en sistemas';

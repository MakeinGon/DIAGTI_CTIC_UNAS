-- =========================================================================
-- V2__infraestructura_extend.sql
-- Extiende las tablas infraestructura y seguridad con los campos que ya
-- exige el formulario de Registro Técnico (RF-09, RF-10, RF-11, RF-12),
-- agrega control de flujo propio del módulo de Infraestructura, extiende
-- evidencias para diferenciar registro/subsanación y crea la bitácora
-- de historial de Infraestructura.
-- =========================================================================

-- ---------------------------------------------------------------------
-- infraestructura: paso 1 (Infraestructura tecnológica) + paso 2 (Despliegue)
-- ---------------------------------------------------------------------
ALTER TABLE infraestructura
    ADD COLUMN plataforma VARCHAR(50),
    ADD COLUMN tipo_servidor VARCHAR(30),
    ADD COLUMN sistema_operativo VARCHAR(100),
    ADD COLUMN version_so VARCHAR(50),
    ADD COLUMN ip_privada VARCHAR(45),
    ADD COLUMN proxmox VARCHAR(10),
    ADD COLUMN backup VARCHAR(10),
    ADD COLUMN frecuencia_backup VARCHAR(30),
    ADD COLUMN observaciones_infra TEXT,
    ADD COLUMN ambiente VARCHAR(30),
    ADD COLUMN servidor VARCHAR(100),
    ADD COLUMN puerto INTEGER,
    ADD COLUMN dominio VARCHAR(255),
    ADD COLUMN servidor_web VARCHAR(30),
    ADD COLUMN proxy_reverso VARCHAR(10),
    ADD COLUMN docker VARCHAR(10),
    ADD COLUMN docker_compose VARCHAR(10),
    ADD COLUMN exposicion VARCHAR(30),
    ADD COLUMN cicd VARCHAR(30),
    ADD COLUMN estado_registro VARCHAR(20) NOT NULL DEFAULT 'Nuevo',
    ADD COLUMN ultimo_paso INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN id_usuario_registro INTEGER,
    ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE infraestructura
    ADD CONSTRAINT uq_infraestructura_sistema UNIQUE (id_sistema);

ALTER TABLE infraestructura
    ADD CONSTRAINT fk_infraestructura_usuario_registro
        FOREIGN KEY (id_usuario_registro)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL;

ALTER TABLE infraestructura
    ADD CONSTRAINT chk_infraestructura_estado
        CHECK (estado_registro IN ('Nuevo','Borrador','Enviado','Observado','Corregido','Validado'));

-- capacidad_recursos ya no es de llenado obligatorio: el detalle vive en las
-- columnas nuevas; se conserva la columna por compatibilidad con otros módulos.
ALTER TABLE infraestructura ALTER COLUMN capacidad_recursos DROP NOT NULL;

-- ---------------------------------------------------------------------
-- seguridad: paso 3 (Controles de seguridad, RF-12)
-- ---------------------------------------------------------------------
ALTER TABLE seguridad
    ADD COLUMN ssl_tls VARCHAR(20),
    ADD COLUMN metodo_autenticacion VARCHAR(60),
    ADD COLUMN mfa VARCHAR(20),
    ADD COLUMN logs VARCHAR(20),
    ADD COLUMN cifrado VARCHAR(20),
    ADD COLUMN restriccion_ip VARCHAR(20),
    ADD COLUMN control_sesiones VARCHAR(20),
    ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE seguridad
    ADD CONSTRAINT uq_seguridad_sistema UNIQUE (id_sistema);

-- Un borrador puede guardarse con el paso de Seguridad a medio completar
-- (p.ej. solo SSL/TLS lleno y método de autenticación aún vacío), así que
-- estas columnas ya no pueden exigir NOT NULL como en el diseño original.
ALTER TABLE seguridad ALTER COLUMN mecanismo_autenticacion DROP NOT NULL;
ALTER TABLE seguridad ALTER COLUMN tipo_control DROP NOT NULL;

-- ---------------------------------------------------------------------
-- evidencias: distinguir evidencias del registro vs. de una subsanación
-- ---------------------------------------------------------------------
ALTER TABLE evidencias
    ADD COLUMN nombre VARCHAR(255),
    ADD COLUMN contexto VARCHAR(30) NOT NULL DEFAULT 'REGISTRO',
    ADD COLUMN id_observacion INTEGER;

ALTER TABLE evidencias
    ADD CONSTRAINT chk_evidencias_contexto
        CHECK (contexto IN ('REGISTRO','SUBSANACION'));

ALTER TABLE evidencias
    ADD CONSTRAINT fk_evidencias_observacion
        FOREIGN KEY (id_observacion)
        REFERENCES observaciones(id_observacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE;

-- ---------------------------------------------------------------------
-- Bitácora de historial del módulo de Infraestructura (pantalla Historial)
-- ---------------------------------------------------------------------
CREATE TABLE infraestructura_historial (
    id_historial SERIAL PRIMARY KEY,
    id_sistema INTEGER NOT NULL,
    accion VARCHAR(50) NOT NULL,
    seccion VARCHAR(100),
    detalle TEXT NOT NULL,
    estado_resultante VARCHAR(20) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    id_usuario INTEGER,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_infra_historial_sistema
        FOREIGN KEY (id_sistema)
        REFERENCES sistemas(id_sistema)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_infra_historial_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE INDEX idx_infra_historial_sistema ON infraestructura_historial(id_sistema);
CREATE INDEX idx_infra_historial_fecha ON infraestructura_historial(fecha_evento);
CREATE INDEX idx_evidencias_sistema_contexto ON evidencias(id_sistema, contexto);

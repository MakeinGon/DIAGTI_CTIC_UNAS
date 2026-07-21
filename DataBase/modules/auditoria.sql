-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INTEGER,
    usuario VARCHAR(100) NOT NULL,
    correo VARCHAR(150),
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_ip VARCHAR(45),
    user_agent TEXT,
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY(id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_modulo ON auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);

-- Insertar datos de prueba
INSERT INTO auditoria (id_usuario, usuario, correo, modulo, accion, descripcion, fecha_evento, direccion_ip) VALUES
(1, 'Auditor CTIC', 'auditor@unas.edu.pe', 'Inventario', 'Consulta', 'El auditor consultó el inventario general de sistemas.', '2026-07-16 08:45:00', '192.168.1.10'),
(1, 'Auditor CTIC', 'auditor@unas.edu.pe', 'Auditoría', 'Consulta', 'El auditor consultó el historial de eventos del sistema.', '2026-07-16 08:50:00', '192.168.1.10'),
(1, 'Auditor CTIC', 'auditor@unas.edu.pe', 'Reportes', 'Exportación', 'El auditor exportó el reporte de inventario en Excel.', '2026-07-16 09:10:00', '192.168.1.10'),
(NULL, 'Usuario no registrado', 'Sin correo', 'Acceso', 'Intento fallido', 'Intento fallido de inicio de sesión mediante LDAP.', '2026-07-16 09:33:00', '192.168.1.90'),
(2, 'Administrador CTIC', 'admin@unas.edu.pe', 'Sistemas', 'Registro', 'Se registró el sistema informático Sistema Académico.', '2026-07-16 09:45:00', '192.168.1.15');
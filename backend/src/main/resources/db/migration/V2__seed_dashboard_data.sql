INSERT INTO usuarios (nombres, apellidos, correo, username)
VALUES
    ('Admin', 'Sistema', 'admin@unas.edu.pe', 'admin.sistema'),
    ('Leonardo', 'Travezanio', 'l.travezanio@unas.edu.pe', 'l.travezanio'),
    ('Maria', 'Lara', 'm.lara@unas.edu.pe', 'm.lara'),
    ('Fabio', 'Vela', 'f.vela@unas.edu.pe', 'f.vela'),
    ('Alex', 'Makein', 'a.makein@unas.edu.pe', 'a.makein')
ON CONFLICT (username) DO NOTHING;

INSERT INTO catalogos (tipo_catalogo, codigo, valor, orden)
SELECT v.tipo, v.codigo, v.valor, v.orden
FROM (
    VALUES
        ('CRITICIDAD', 'CRITICA', 'Crítica', 1),
        ('CRITICIDAD', 'ALTA', 'Alta', 2),
        ('CRITICIDAD', 'MEDIA', 'Media', 3),
        ('CRITICIDAD', 'BAJA', 'Baja', 4)
) AS v(tipo, codigo, valor, orden)
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos c WHERE c.tipo_catalogo = v.tipo AND c.codigo = v.codigo
);

INSERT INTO sistemas (codigo_unico, nombre, id_criticidad, es_legacy, nivel_riesgo)
SELECT v.codigo, v.nombre, c.id_catalogo, v.es_legacy, v.nivel_riesgo
FROM (
    VALUES
        ('SIGA-ERP', 'Sistema Integrado de Gestión Académica', 'CRITICA', FALSE, 'ALTO'),
        ('BIBLIOTECA', 'Sistema de Biblioteca Central', 'MEDIA', FALSE, 'MEDIO'),
        ('PORTAL-EST', 'Portal del Estudiante', 'ALTA', FALSE, 'MEDIO'),
        ('CONTAB-98', 'Contabilidad Legacy', 'ALTA', TRUE, 'ALTO'),
        ('RRHH-UNAS', 'Gestión de Recursos Humanos', 'MEDIA', FALSE, 'BAJO'),
        ('INVENT-FIIS', 'Inventario FIIS', 'ALTA', FALSE, 'ALTO'),
        ('CORREO-UNAS', 'Correo Institucional', 'CRITICA', FALSE, 'ALTO'),
        ('LAB-RESERVAS', 'Reservas de Laboratorio', 'BAJA', FALSE, 'BAJO'),
        ('FINAN-UNAS', 'Sistema Financiero', 'CRITICA', FALSE, 'ALTO'),
        ('ARCHIVO-DIG', 'Archivo Digital', 'MEDIA', TRUE, 'MEDIO'),
        ('MOODLE-UNAS', 'Aula Virtual Moodle', 'ALTA', FALSE, 'MEDIO'),
        ('TRANSP-UNAS', 'Portal de Transparencia', 'BAJA', FALSE, 'BAJO'),
        ('SGI-DIAGTI', 'Sistema DIAGTI', 'ALTA', FALSE, 'MEDIO'),
        ('CRM-UNAS', 'CRM Institucional', 'MEDIA', FALSE, 'BAJO'),
        ('LEGACY-PAY', 'Pagos Legacy', 'ALTA', TRUE, 'ALTO'),
        ('DATA-WH', 'Data Warehouse UNAS', 'CRITICA', FALSE, 'ALTO'),
        ('VPN-UNAS', 'Gestión VPN', 'MEDIA', FALSE, 'MEDIO'),
        ('TICKET-CTIC', 'Mesa de Ayuda CTIC', 'BAJA', FALSE, 'BAJO'),
        ('DOC-UNAS', 'Gestor Documental', 'MEDIA', FALSE, 'BAJO'),
        ('REPORT-UNAS', 'Reportería Institucional', 'ALTA', FALSE, 'MEDIO'),
        ('API-GW', 'API Gateway', 'CRITICA', FALSE, 'ALTO'),
        ('MONIT-UNAS', 'Monitoreo Infraestructura', 'ALTA', FALSE, 'MEDIO'),
        ('BACKUP-UNAS', 'Gestión de Respaldos', 'MEDIA', FALSE, 'BAJO'),
        ('IDM-UNAS', 'Identity Manager', 'CRITICA', FALSE, 'ALTO'),
        ('LEGACY-RRHH', 'RRHH Legacy', 'MEDIA', TRUE, 'ALTO'),
        ('PORTAL-DOC', 'Portal Docente', 'ALTA', FALSE, 'MEDIO'),
        ('SIGA-MOVIL', 'SIGA Móvil', 'MEDIA', FALSE, 'BAJO'),
        ('ETL-UNAS', 'Procesos ETL', 'ALTA', FALSE, 'MEDIO'),
        ('CERT-UNAS', 'Certificados Digitales', 'CRITICA', FALSE, 'ALTO'),
        ('LEGACY-INV', 'Inventario Legacy', 'BAJA', TRUE, 'MEDIO'),
        ('WEB-UNAS', 'Portal Web Institucional', 'ALTA', FALSE, 'BAJO'),
        ('SCA-UNAS', 'Control de Accesos', 'CRITICA', FALSE, 'ALTO'),
        ('BI-UNAS', 'Business Intelligence', 'MEDIA', FALSE, 'MEDIO'),
        ('LEGACY-FIN', 'Finanzas Legacy', 'ALTA', TRUE, 'ALTO'),
        ('CLOUD-UNAS', 'Servicios Cloud UNAS', 'ALTA', FALSE, 'MEDIO'),
        ('ALUMNI-UNAS', 'Red de Egresados', 'BAJA', FALSE, 'BAJO'),
        ('LEGACY-BIB', 'Biblioteca Legacy', 'MEDIA', TRUE, 'MEDIO'),
        ('SEC-OPS', 'Security Operations', 'CRITICA', FALSE, 'ALTO'),
        ('LEGACY-CRM', 'CRM Legacy', 'BAJA', TRUE, 'BAJO'),
        ('UNAS-APP', 'App Móvil UNAS', 'MEDIA', FALSE, 'BAJO'),
        ('DIAGTI-CORE', 'Núcleo DIAGTI', 'ALTA', FALSE, 'MEDIO'),
        ('LEGACY-HR2', 'RRHH Auxiliar Legacy', 'MEDIA', TRUE, 'MEDIO'),
        ('UNAS-API', 'Servicios REST UNAS', 'ALTA', FALSE, 'MEDIO'),
        ('LEGACY-ARCH', 'Archivo Legacy', 'BAJA', TRUE, 'BAJO'),
        ('CTIC-DASH', 'Dashboard CTIC', 'MEDIA', FALSE, 'BAJO')
) AS v(codigo, nombre, criticidad, es_legacy, nivel_riesgo)
JOIN catalogos c ON c.tipo_catalogo = 'CRITICIDAD' AND c.codigo = v.criticidad
ON CONFLICT (codigo_unico) DO NOTHING;

INSERT INTO auditoria (id_usuario, modulo, accion, descripcion, fecha_evento, direccion_ip)
SELECT u.id_usuario, v.modulo, v.accion, v.descripcion, v.fecha_evento::timestamp, v.direccion_ip
FROM (
    VALUES
        ('admin.sistema', 'Sistemas', 'CREAR', 'Registro del sistema SIGA-ERP completado en paso 4.', '2026-06-17 14:32:00', '192.168.10.45'),
        ('l.travezanio', 'Dashboard', 'CONSULTAR', 'Consulta del panel ejecutivo de métricas institucionales.', '2026-06-17 13:15:00', '192.168.10.88'),
        ('admin.sistema', 'Seguridad', 'ACTUALIZAR', 'Actualización de controles MFA para sistema académico.', '2026-06-16 18:40:00', '10.0.0.12'),
        ('m.lara', 'Infraestructura', 'VALIDAR', 'Validación de capacidad de recursos del sistema biblioteca.', '2026-06-16 11:20:00', '192.168.20.5'),
        ('l.travezanio', 'Sistemas', 'ELIMINAR', 'Eliminación lógica del sistema legacy CONTAB-98.', '2026-06-15 09:05:00', '192.168.10.88'),
        ('f.vela', 'Auditoría', 'EXPORTAR', 'Exportación de bitácora mensual para revisión CTIC.', '2026-06-14 16:50:00', '172.16.0.33'),
        ('admin.sistema', 'Arquitectura', 'CREAR', 'Registro de arquitectura microservicios para portal estudiante.', '2026-06-13 10:30:00', '192.168.10.45'),
        ('a.makein', 'Integraciones', 'CONSULTAR', 'Revisión de integraciones REST entre sistemas financieros.', '2026-06-12 08:45:00', '192.168.30.21')
) AS v(username, modulo, accion, descripcion, fecha_evento, direccion_ip)
JOIN usuarios u ON u.username = v.username;

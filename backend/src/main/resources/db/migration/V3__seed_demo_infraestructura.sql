-- =========================================================================
-- V3__seed_demo_infraestructura.sql
-- Datos de demostración para el módulo de Infraestructura: usuarios, los
-- 10 sistemas que hoy están hardcodeados en el frontend (mis-sistemas.js /
-- dashboard.js / historial.js), sus registros técnicos, seguridad,
-- evidencias, validaciones/observaciones e historial.
-- =========================================================================

-- ---------------------------------------------------------------------
-- Roles y usuarios base
-- ---------------------------------------------------------------------
INSERT INTO roles (nombre, descripcion) VALUES
    ('ADMINISTRADOR_CTIC', 'Control total del sistema'),
    ('DESARROLLO', 'Área de Desarrollo'),
    ('INFRAESTRUCTURA', 'Área de Infraestructura'),
    ('VALIDADOR_CTIC', 'Validador Técnico CTIC'),
    ('AUDITOR', 'Auditor / OCI'),
    ('DIRECTIVO', 'Directivo / Rectorado');

INSERT INTO usuarios (nombres, apellidos, correo, username, estado) VALUES
    ('Carlos', 'Rojas', 'carlos.rojas@unas.edu.pe', 'crojas', TRUE),
    ('Validador', 'CTIC', 'validador.ctic@unas.edu.pe', 'vctic', TRUE),
    ('Administrador', 'CTIC', 'admin.ctic@unas.edu.pe', 'actic', TRUE);

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol FROM usuarios u, roles r
WHERE u.username='crojas' AND r.nombre='INFRAESTRUCTURA';
INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol FROM usuarios u, roles r
WHERE u.username='vctic' AND r.nombre='VALIDADOR_CTIC';
INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol FROM usuarios u, roles r
WHERE u.username='actic' AND r.nombre='ADMINISTRADOR_CTIC';

-- ---------------------------------------------------------------------
-- Sistemas asignados al Área de Infraestructura (10 sistemas demo)
-- ---------------------------------------------------------------------
INSERT INTO sistemas (codigo_unico, nombre, id_responsable_tecnico, estado_flujo, nivel_riesgo, fecha_creacion)
SELECT v.codigo, v.nombre, u.id_usuario, 'ACTIVO', v.riesgo, v.creado::timestamp
FROM (VALUES
    ('SIS-MAT-01','Sistema de Matrícula','Medio','2026-05-10 08:00:00'),
    ('SIS-DOC-02','Documenta','Alto','2026-05-12 08:00:00'),
    ('SIS-VEN-03','Registro de Ventas','Crítico','2026-05-14 08:00:00'),
    ('SIS-BIB-04','Biblioteca Virtual','Medio','2026-05-16 08:00:00'),
    ('SIS-RRH-05','Control de Personal','Bajo','2026-05-18 08:00:00'),
    ('SIS-MSA-06','Mesa de Servicios TI','Medio','2026-07-07 10:10:00'),
    ('SIS-PAG-07','Portal de Pagos','Alto','2026-05-20 08:00:00'),
    ('SIS-ADM-08','Gestión Administrativa','Medio','2026-05-22 08:00:00'),
    ('SIS-INV-09','Sistema de Investigación','Alto','2026-05-24 08:00:00'),
    ('SIS-COM-10','Comedor Universitario','Medio','2026-05-26 08:00:00')
) AS v(codigo, nombre, riesgo, creado)
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='crojas') AS u;

-- ---------------------------------------------------------------------
-- Registros técnicos de Infraestructura (paso 1 y 2 del formulario)
-- ---------------------------------------------------------------------
INSERT INTO infraestructura (
    id_sistema, plataforma, tipo_servidor, sistema_operativo, version_so, ip_privada,
    proxmox, backup, frecuencia_backup, observaciones_infra,
    ambiente, servidor, puerto, dominio, servidor_web, proxy_reverso, docker, docker_compose,
    exposicion, cicd, estado_registro, ultimo_paso, id_usuario_registro, capacidad_recursos
)
SELECT s.id_sistema, d.plataforma, d.tipo_servidor, d.sistema_operativo, d.version_so, d.ip_privada,
       d.proxmox, d.backup, d.frecuencia_backup, d.observaciones_infra,
       d.ambiente, d.servidor, d.puerto, d.dominio, d.servidor_web, d.proxy_reverso, d.docker, d.docker_compose,
       d.exposicion, d.cicd, d.estado_registro, d.ultimo_paso, u.id_usuario, d.capacidad_recursos
FROM (VALUES
    ('SIS-MAT-01','VM en Proxmox','Virtual','Ubuntu Server','22.04 LTS','192.168.10.10',
     'Sí','Sí','Diario','Infraestructura estable, sin incidencias registradas.',
     'Producción','vm-mat-01',443,'matricula.unas.edu.pe','Nginx','Sí','No','No aplica',
     'Intranet','GitHub Actions','Validado',3,'2 vCPU / 4GB RAM / 60GB disco'),
    ('SIS-DOC-02','Contenedor Docker','Contenedor','Debian','12','192.168.10.22',
     'No','Sí','Semanal','Pendiente confirmar certificado SSL vigente.',
     'Producción','doc-app-02',8443,'documenta.unas.edu.pe','Nginx','Sí','Sí','Sí',
     'Internet','GitLab CI','Observado',3,'2 vCPU / 4GB RAM / 40GB disco'),
    ('SIS-VEN-03','Servidor físico','Físico','Windows Server','2019','192.168.10.30',
     'No','Sí','Semanal','Registro técnico pendiente de completar.',
     NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
     NULL,NULL,'Borrador',0,'4 vCPU / 8GB RAM / 120GB disco'),
    ('SIS-BIB-04','VM en Proxmox','Virtual','Ubuntu Server','24.04 LTS','192.168.10.40',
     'Sí','Sí','Diario','Corrección aplicada: se documentó backup y despliegue.',
     'Producción','vm-bib-04',443,'biblioteca.unas.edu.pe','Nginx','Sí','No','No aplica',
     'Internet','GitHub Actions','Corregido',3,'2 vCPU / 4GB RAM / 80GB disco'),
    ('SIS-RRH-05','Contenedor Docker','Contenedor','Ubuntu Server','24.04 LTS','192.168.10.50',
     'No','Sí','Diario','Enviado a validación, en espera de revisión.',
     'Producción','rrh-app-05',8080,'personal.unas.edu.pe','Apache','Sí','Sí','Sí',
     'Intranet','No implementado','Enviado',3,'2 vCPU / 4GB RAM / 40GB disco'),
    ('SIS-PAG-07','VM en Proxmox','Virtual','Ubuntu Server','22.04 LTS','192.168.10.70',
     'Sí','Sí','Diario','La IP pública registrada no coincide con el servidor desplegado.',
     'Producción','vm-pag-07',443,'pagos.unas.edu.pe','Nginx','Sí','No','No aplica',
     'Internet','GitLab CI','Observado',3,'4 vCPU / 8GB RAM / 100GB disco'),
    ('SIS-ADM-08','Servidor físico','Físico','Windows Server','2022','192.168.10.80',
     'No','No','No aplica','No se evidenció backup automático ni su frecuencia.',
     'Producción','srv-adm-08',8081,'administracion.unas.edu.pe','IIS','No','No','No',
     'Intranet','No implementado','Observado',3,'4 vCPU / 8GB RAM / 100GB disco'),
    ('SIS-INV-09','Contenedor Docker','Contenedor','Debian','12','192.168.10.90',
     'No','Sí','Semanal','El dominio funciona sin certificado SSL/TLS vigente.',
     'Producción','inv-app-09',80,'investigacion.unas.edu.pe','Nginx','No','Sí','Sí',
     'Internet','GitHub Actions','Observado',3,'2 vCPU / 4GB RAM / 60GB disco'),
    ('SIS-COM-10','VM en Proxmox','Virtual','Ubuntu Server','22.04 LTS','192.168.10.100',
     'Sí','Sí','Semanal','Falta documentar proxy reverso y mecanismo CI/CD.',
     'Producción','vm-com-10',443,'comedor.unas.edu.pe','Nginx',NULL,'No','No aplica',
     'Intranet',NULL,'Observado',3,'2 vCPU / 4GB RAM / 40GB disco')
) AS d(codigo, plataforma, tipo_servidor, sistema_operativo, version_so, ip_privada,
       proxmox, backup, frecuencia_backup, observaciones_infra,
       ambiente, servidor, puerto, dominio, servidor_web, proxy_reverso, docker, docker_compose,
       exposicion, cicd, estado_registro, ultimo_paso, capacidad_recursos)
JOIN sistemas s ON s.codigo_unico = d.codigo
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='crojas') AS u;

-- ---------------------------------------------------------------------
-- Seguridad (paso 3 del formulario) para los sistemas con registro completo
-- ---------------------------------------------------------------------
INSERT INTO seguridad (id_sistema, tipo_control, mecanismo_autenticacion, ssl_tls, metodo_autenticacion, mfa, logs, cifrado, restriccion_ip, control_sesiones)
SELECT s.id_sistema, 'CONTROL_DESPLIEGUE', d.metodo_autenticacion, d.ssl_tls, d.metodo_autenticacion, d.mfa, d.logs, d.cifrado, d.restriccion_ip, d.control_sesiones
FROM (VALUES
    ('SIS-MAT-01','Cumple','LDAP / Active Directory','Cumple','Cumple','Cumple','Cumple','Cumple'),
    ('SIS-DOC-02','Parcial','Usuario y contraseña','No cumple','Cumple','Parcial','Cumple','Cumple'),
    ('SIS-BIB-04','Cumple','OAuth / SSO (Inicio de Sesión Único)','Cumple','Cumple','Cumple','Cumple','Cumple'),
    ('SIS-RRH-05','Cumple','LDAP / Active Directory','No cumple','Cumple','Cumple','Cumple','Parcial'),
    ('SIS-PAG-07','Cumple','OAuth / SSO (Inicio de Sesión Único)','Cumple','Cumple','Cumple','No cumple','Cumple'),
    ('SIS-ADM-08','Parcial','Usuario y contraseña','No cumple','No cumple','Parcial','No cumple','Parcial'),
    ('SIS-INV-09','No cumple','Usuario y contraseña','No cumple','Parcial','Cumple','Cumple','Parcial'),
    ('SIS-COM-10','Parcial','LDAP / Active Directory','Cumple','Cumple','Parcial','Cumple','No cumple')
) AS d(codigo, ssl_tls, metodo_autenticacion, mfa, logs, cifrado, restriccion_ip, control_sesiones)
JOIN sistemas s ON s.codigo_unico = d.codigo;

-- ---------------------------------------------------------------------
-- Evidencias del registro técnico (paso 4 del formulario)
-- ---------------------------------------------------------------------
INSERT INTO evidencias (id_sistema, tipo_evidencia, nombre, nombre_archivo, url_evidencia, descripcion, contexto, id_usuario_carga)
SELECT s.id_sistema, e.tipo, e.nombre, e.archivo, e.url, e.descripcion, 'REGISTRO', u.id_usuario
FROM (VALUES
    ('SIS-MAT-01','Certificado SSL','Certificado SSL vigente','certificado-matricula.pdf',NULL,'Certificado SSL emitido y vigente.'),
    ('SIS-MAT-01','Configuración de despliegue','Docker Compose de producción',NULL,'https://repo.unas.edu.pe/matricula/docker-compose.yml','Configuración de despliegue en producción.'),
    ('SIS-DOC-02','Configuración de despliegue','Docker Compose de Documenta','docker-compose-documenta.yml',NULL,'Configuración de contenedores del sistema Documenta.'),
    ('SIS-VEN-03','Captura de servidor','Captura preliminar del servidor','captura-ventas.png',NULL,'Captura inicial, registro aún en borrador.'),
    ('SIS-BIB-04','Backup','Evidencia de política de backup','backup-biblioteca.pdf',NULL,'Política y frecuencia de backup documentada.'),
    ('SIS-RRH-05','Documento técnico','Ficha técnica de despliegue','ficha-rrhh.docx',NULL,'Ficha técnica enviada a validación.'),
    ('SIS-PAG-07','Captura de servidor','Captura de configuración de red','red-pagos.png',NULL,'Configuración de red del servidor de pagos.'),
    ('SIS-ADM-08','Documento técnico','Ficha técnica administrativa','ficha-admin.docx',NULL,'Ficha técnica del sistema administrativo.'),
    ('SIS-INV-09','Configuración de despliegue','Docker Compose de Investigación','docker-compose-investigacion.yml',NULL,'Configuración de despliegue del sistema de investigación.'),
    ('SIS-COM-10','Captura de servidor','Captura del servidor del comedor','captura-comedor.png',NULL,'Captura general del servidor.')
) AS e(codigo, tipo, nombre, archivo, url, descripcion)
JOIN sistemas s ON s.codigo_unico = e.codigo
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='crojas') AS u;

-- ---------------------------------------------------------------------
-- Validaciones y observaciones (flujo Validador CTIC)
-- ---------------------------------------------------------------------
-- SIS-MAT-01: aprobado / Validado
INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, resultado, fecha_validacion)
SELECT s.id_sistema, v.id_usuario, 'APROBADO', 'VALIDADO', '2026-07-06 12:00:00'
FROM sistemas s CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v
WHERE s.codigo_unico='SIS-MAT-01';

-- SIS-DOC-02: observado, pendiente de subsanar
INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, fecha_validacion)
SELECT s.id_sistema, v.id_usuario, 'OBSERVADO', '2026-07-09 15:50:00'
FROM sistemas s CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v
WHERE s.codigo_unico='SIS-DOC-02';

INSERT INTO observaciones (id_sistema, id_validacion, descripcion, estado_observacion, id_usuario_observa, fecha_observacion)
SELECT s.id_sistema, val.id_validacion, 'Falta adjuntar la evidencia del certificado SSL y explicar la política de backup.', 'PENDIENTE', v.id_usuario, '2026-07-11 00:00:00'
FROM sistemas s
JOIN validaciones val ON val.id_sistema = s.id_sistema
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v
WHERE s.codigo_unico='SIS-DOC-02';

-- SIS-BIB-04: observado y ya subsanado (estado Corregido, pendiente de reenvío)
INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, fecha_validacion)
SELECT s.id_sistema, v.id_usuario, 'OBSERVADO', '2026-07-08 09:00:00'
FROM sistemas s CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v
WHERE s.codigo_unico='SIS-BIB-04';

INSERT INTO observaciones (id_sistema, id_validacion, descripcion, estado_observacion, respuesta_subsanacion, id_usuario_observa, id_usuario_subsana, fecha_observacion, fecha_subsanacion)
SELECT s.id_sistema, val.id_validacion, 'No se evidenció la política de backup ni la configuración de despliegue.', 'SUBSANADA',
       'Se documentó la política de backup diaria y se adjuntó la configuración de despliegue en producción.',
       v.id_usuario, c.id_usuario, '2026-07-09 15:50:00', '2026-07-10 11:20:00'
FROM sistemas s
JOIN validaciones val ON val.id_sistema = s.id_sistema
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='crojas') c
WHERE s.codigo_unico='SIS-BIB-04';

INSERT INTO evidencias (id_sistema, tipo_evidencia, nombre, nombre_archivo, descripcion, contexto, id_usuario_carga, id_observacion)
SELECT s.id_sistema, 'Configuración de despliegue', 'Docker Compose actualizado', 'docker-compose-biblioteca.yml',
       'Evidencia de la corrección aplicada.', 'SUBSANACION', c.id_usuario, obs.id_observacion
FROM sistemas s
JOIN observaciones obs ON obs.id_sistema = s.id_sistema
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='crojas') c
WHERE s.codigo_unico='SIS-BIB-04';

-- SIS-RRH-05: enviado, pendiente de revisión (sin observación aún)
INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, fecha_validacion)
SELECT s.id_sistema, v.id_usuario, 'PENDIENTE', '2026-07-08 14:05:00'
FROM sistemas s CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v
WHERE s.codigo_unico='SIS-RRH-05';

-- SIS-PAG-07, SIS-ADM-08, SIS-INV-09, SIS-COM-10: observados, pendientes de subsanar
INSERT INTO validaciones (id_sistema, id_validador, estado_validacion, fecha_validacion)
SELECT s.id_sistema, v.id_usuario, 'OBSERVADO', o.fecha::timestamp
FROM (VALUES
    ('SIS-PAG-07','2026-07-12 00:00:00'),
    ('SIS-ADM-08','2026-07-12 00:00:00'),
    ('SIS-INV-09','2026-07-13 00:00:00'),
    ('SIS-COM-10','2026-07-13 00:00:00')
) AS o(codigo, fecha)
JOIN sistemas s ON s.codigo_unico = o.codigo
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v;

INSERT INTO observaciones (id_sistema, id_validacion, descripcion, estado_observacion, id_usuario_observa, fecha_observacion)
SELECT s.id_sistema, val.id_validacion, o.descripcion, 'PENDIENTE', v.id_usuario, o.fecha::timestamp
FROM (VALUES
    ('SIS-PAG-07','La dirección IP pública registrada no coincide con el servidor desplegado. Adjunte una captura de la configuración de red.','2026-07-12 00:00:00'),
    ('SIS-ADM-08','No se evidenció el uso de copias de seguridad automáticas ni su frecuencia.','2026-07-12 00:00:00'),
    ('SIS-INV-09','El dominio funciona sin certificado SSL/TLS vigente. Adjunte el certificado actualizado.','2026-07-13 00:00:00'),
    ('SIS-COM-10','Falta documentar el proxy reverso y el mecanismo CI/CD utilizado para producción.','2026-07-13 00:00:00')
) AS o(codigo, descripcion, fecha)
JOIN sistemas s ON s.codigo_unico = o.codigo
JOIN validaciones val ON val.id_sistema = s.id_sistema
CROSS JOIN (SELECT id_usuario FROM usuarios WHERE username='vctic') v;

-- ---------------------------------------------------------------------
-- Historial (bitácora mostrada en la pantalla Historial)
-- ---------------------------------------------------------------------
INSERT INTO infraestructura_historial (id_sistema, accion, seccion, detalle, estado_resultante, valor_anterior, valor_nuevo, id_usuario, fecha_evento)
SELECT s.id_sistema, h.accion, h.seccion, h.detalle, h.estado, h.antes, h.despues, u.id_usuario, h.fecha::timestamp
FROM (VALUES
    ('SIS-MAT-01','Actualización','Infraestructura','Se actualizó la frecuencia de backup de semanal a diaria.','Validado','Semanal','Diario','crojas','2026-07-11 09:15:00'),
    ('SIS-DOC-02','Evidencia','Evidencias','Se adjuntó la configuración de Docker Compose.','Corregido',NULL,'docker-compose-documenta.yml','crojas','2026-07-10 16:42:00'),
    ('SIS-DOC-02','Subsanación','Subsanación','Se guardó la corrección de la observación y sus evidencias.','Corregido',NULL,'Corrección pendiente de reenvío','crojas','2026-07-10 11:20:00'),
    ('SIS-DOC-02','Observación','Validación','El Validador CTIC solicitó certificado SSL y política de backup.','Observado',NULL,'Observación registrada','vctic','2026-07-09 15:50:00'),
    ('SIS-MAT-01','Envío','Flujo de validación','El registro técnico fue enviado a validación.','Enviado',NULL,'Enviado','crojas','2026-07-08 14:05:00'),
    ('SIS-VEN-03','Borrador','Registro técnico','Se guardó el avance del registro técnico.','Borrador',NULL,'Borrador','crojas','2026-07-07 17:30:00'),
    ('SIS-MSA-06','Creación','Asignación','El sistema fue asignado al Área de Infraestructura y aún no tiene registro técnico.','Nuevo',NULL,'Nuevo','actic','2026-07-07 10:10:00'),
    ('SIS-MAT-01','Validación','Validación','El registro técnico fue aprobado por el Validador CTIC.','Validado',NULL,'Validado','vctic','2026-07-06 12:00:00')
) AS h(codigo, accion, seccion, detalle, estado, antes, despues, username, fecha)
JOIN sistemas s ON s.codigo_unico = h.codigo
JOIN usuarios u ON u.username = h.username;

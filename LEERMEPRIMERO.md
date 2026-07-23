# 📘 LEERMEPRIMERO.md

# Sistema de Gestión de Inventario (SGI)

## 📌 Descripción

El Sistema de Gestión de Inventario (DIAGTI) es una aplicación basada en arquitectura moderna utilizando:

- Spring Boot (Backend)
- PostgreSQL 17 (Base de datos)
- Docker y Docker Compose (Contenedores)
- Git y GitHub (Control de versiones)

El sistema está organizado en módulos para facilitar el desarrollo colaborativo entre los integrantes del equipo.

---

# 🧰 Tecnologías Utilizadas

- Java 17
- Spring Boot
- PostgreSQL 17
- Docker
- Docker Compose
- Git / GitHub
- Apache NetBeans
- Postman

---

# 📁 Estructura del Proyecto

SGI_FIIS
│
├── backend
├── frontend
│
├── Database
│   ├── modules
│   │   ├── roles.sql
│   │   ├── usuarios.sql
│   │   ├── usuarios_roles.sql
│   │   ├── auditoria.sql
│   │   ├── catalogos.sql
│   │   ├── sistemas.sql
│   │   ├── integraciones.sql
│   │   ├── arquitectura.sql
│   │   ├── infraestructura.sql
│   │   ├── seguridad.sql
│   │   ├── evidencias.sql
│   │   ├── validaciones.sql
│   │   └── observaciones.sql
│   │
│   └── init.sql
│
├── docker-compose.yml
└── LEERMEPRIMERO.md

---

# 🚀 Clonar el Proyecto

git clone https://github.com/MakeinGon/SGI_FIIS.git
cd DIAGTI_FIIS

---

# 🔄 Flujo de Trabajo Git

## 📌 Ramas principales

- main → producción
- develop → integración

## 📌 Crear rama de trabajo

git checkout develop
git pull origin develop
git checkout -b backend/tu-rama

Ejemplo:

git checkout -b backend/inventario-dev2

---

## 📌 Reglas del equipo

- ❌ No trabajar en main
- ❌ No hacer push directo a develop
- ✅ Trabajar en rama propia
- ✅ Actualizar develop antes de iniciar
- ✅ Commits claros y descriptivos

---

# 🐳 Levantar Base de Datos

docker compose up -d

Verificar contenedor:

docker ps

Debe aparecer:

diagti-postgres

---

# 🗄️ Inicialización de Base de Datos

El proyecto utiliza un único archivo:

Database/init.sql

Este ejecuta todos los módulos en orden:

\i modules/roles.sql
\i modules/usuarios.sql
\i modules/usuarios_roles.sql
\i modules/auditoria.sql

-- Inventario
\i modules/catalogos.sql
\i modules/sistemas.sql
\i modules/integraciones.sql

-- Arquitectura
\i modules/arquitectura.sql
\i modules/infraestructura.sql
\i modules/seguridad.sql

-- Evidencias
\i modules/evidencias.sql
\i modules/validaciones.sql
\i modules/observaciones.sql

---

# 🔌 Conexión a PostgreSQL

docker exec -it diagti_postgres psql -U postgres -d diagti_db

---

# 🧱 Verificación de Tablas

\dt

---

# 📊 Prueba del Sistema

INSERT INTO roles(nombre, descripcion)
VALUES ('Administrador', 'Control total del sistema');

SELECT * FROM roles;

---


# ⚠️ Recomendaciones

Antes de iniciar trabajo:

git checkout develop
git pull origin develop

Luego:

git checkout tu-rama
git merge develop

---

# 🎯 Objetivo

Mantener un sistema modular, escalable y ordenado para el desarrollo colaborativo del SGI.
# DIAGTI CTIC UNAS - ejecución

## Actualizar esta versión

Desde PowerShell, dentro de la carpeta del proyecto:

```powershell
docker compose down
docker compose up --build -d
docker compose ps
```

Abra `http://localhost` y haga una recarga forzada con `Ctrl + F5`.

## Comprobar el flujo de validación

1. Ingrese como Desarrollo, Infraestructura o Responsable Funcional.
2. Complete un sistema y pulse **Enviar a validación**.
3. Debe aparecer el mensaje que confirma el guardado en PostgreSQL.
4. Ingrese como Validador, abra **Pendientes** y pulse **Actualizar**.
5. El registro debe mostrar el nombre, el área usuaria y el origen entre
   paréntesis (`DESARROLLO`, `INFRAESTRUCTURA` o `FUNCIONAL`).
6. Valide u observe el registro. Al volver al usuario emisor, la respuesta se
   actualiza al cargar, al enfocar la pestaña y automáticamente cada 15 segundos.

### Prueba del flujo Desarrollo → Infraestructura

1. Registre un sistema nuevo desde Desarrollo y envíelo.
2. Compruebe que aparece en el Validador con origen `DESARROLLO`.
3. Ingrese a Infraestructura: el mismo código debe aparecer como `Nuevo`.
4. Complete su registro técnico y envíelo.
5. En el Validador aparecerá otra entrada del mismo sistema con origen
   `INFRAESTRUCTURA`.

Para comprobar directamente la base de datos:

```powershell
docker compose exec postgres psql -U postgres -d diagti_db -c "SELECT id_solicitud,codigo_sistema,nombre_sistema,area_origen,area_usuaria,estado,fecha_envio FROM solicitudes_validacion ORDER BY fecha_envio DESC;"
```

Si el envío falla, la pantalla ya no lo marca falsamente como enviado: conserva
el sistema para reintentar y muestra el error recibido del backend.

### Persistencia por usuario

Desarrollo e Infraestructura disponen ahora de controladores, DTO, mapeadores,
servicios y repositorios conectados a PostgreSQL. Los borradores y las
correcciones se guardan en `registros_area`; los envíos y las respuestas del
Validador se conservan en `solicitudes_validacion`.

Cada registro guarda `usuario_origen`, por lo que al cerrar sesión y volver a
ingresar se recuperan únicamente los sistemas del usuario correspondiente.
Infraestructura ve los sistemas nuevos enviados por Desarrollo y, cuando un
usuario empieza a trabajarlos, quedan asociados a ese usuario.

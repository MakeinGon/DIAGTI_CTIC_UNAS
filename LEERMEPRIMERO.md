# 📘 LEERMEPRIMERO.md

# Sistema de Gestión de Inventario (SGI)

## 📌 Descripción

El Sistema de Gestión de Inventario (SGI) es una aplicación basada en arquitectura moderna utilizando:

- Spring Boot (Backend)
- PostgreSQL 17 (Base de datos)
- Docker y Docker Compose (Contenedores)
- Git y GitHub (Control de versiones)

El sistema está organizado en módulos para facilitar el desarrollo colaborativo entre los integrantes del equipo.

---

# 🧰 Tecnologías Utilizadas

- Java 21
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
cd SGI_FIIS

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

sgi-postgres

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

docker exec -it sgi-postgres psql -U postgres -d sgi_db

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
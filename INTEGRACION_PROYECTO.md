# Integración del proyecto DIAGTI

Esta carpeta reúne las entregas `frontend-admin_upi` y `fronted-LeonArteaga`.
Los ZIP originales no fueron modificados.

## Base seleccionada

Se usó la entrega de Administración como base porque incluye Docker, scripts de
base de datos, autenticación, módulos administrativos y configuración del
backend. Luego se incorporaron los componentes faltantes de la entrega de León.

## Componentes integrados

- Administración, auditoría, validación y backend directivo de la entrega base.
- Frontend de Infraestructura de la entrega base (versión más reciente).
- Frontend Directivo de León en `frontend/pages/directivo`.
- Backend de Desarrollo de León en el paquete `desarrollador`.
- Backend de Infraestructura de León sobre los archivos que estaban vacíos.
- Pantallas complementarias de Desarrollo: editar, enviar a validación,
  historial y subsanar observaciones.
- `pom.xml` unificado, sin dependencias duplicadas.

## Estructura conservada por compatibilidad

Existen las carpetas `director` y `directivo`. `directivo` corresponde al
frontend al que redirige el login; `director` contiene el frontend conectado a
los endpoints `/api/director/**`. Se conservaron ambas para no eliminar trabajo
de ninguno de los equipos durante esta primera integración.

## Ejecución con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

## Ejecución local del backend

Para una ejecución local se debe cambiar el host y puerto de PostgreSQL en
`backend/src/main/resources/application.properties`, porque la configuración
entregada está preparada para el servicio `postgres` de Docker.

En Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

## Pendientes antes de producción

- Migrar las contraseñas almacenadas a BCrypt.
- Reemplazar CORS abierto por el dominio real del frontend.
- Unificar definitivamente los nombres `director/directivo` y
  `desarrollo/desarrollador` cuando el equipo acuerde la convención.
- Ejecutar pruebas integrales con PostgreSQL y Docker.

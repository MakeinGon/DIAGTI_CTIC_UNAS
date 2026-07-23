# Despliegue de DIAGTI CTIC UNAS en Render

Esta versión conserva el funcionamiento local con `docker compose` y añade un despliegue específico para Render.

## Arquitectura usada en Render

- Un Web Service Docker que ejecuta Nginx y Spring Boot en el mismo contenedor.
- Una base de datos Render Postgres.
- Nginx publica el frontend y envía `/api`, `/auth` y `/auditor` al backend interno.
- `DataBase/init.sql` se ejecuta automáticamente una sola vez sobre una base nueva.

Esta arquitectura evita cambiar todas las llamadas relativas del frontend y utiliza una sola instancia web gratuita.

## 1. Subir el proyecto a GitHub

No subas el archivo `.env`. Ya fue agregado a `.gitignore`.

Si `.env` ya estaba registrado anteriormente en Git, quítalo del seguimiento sin borrarlo de tu computadora:

```powershell
git ls-files .env
# Ejecuta la siguiente línea solamente si el comando anterior muestra .env
git rm --cached .env
```

Desde la raíz del proyecto:

```powershell
git status
git add .
git commit -m "Configurar despliegue de DIAGTI en Render"
git push
```

Si trabajas en una rama nueva:

```powershell
git checkout -b feature/despliegue-render
git add .
git commit -m "Configurar despliegue de DIAGTI en Render"
git push -u origin feature/despliegue-render
```

## 2. Crear el Blueprint en Render

1. Ingresa al Dashboard de Render.
2. Presiona **New**.
3. Selecciona **Blueprint**.
4. Conecta el repositorio de GitHub donde subiste el proyecto.
5. Selecciona la rama que contiene `render.yaml`.
6. Render detectará estos recursos:
   - `diagti-ctic-unas`
   - `diagti-postgres`
7. Presiona **Apply** o **Deploy Blueprint**.

No necesitas copiar manualmente la contraseña de PostgreSQL. `render.yaml` conecta las variables del servicio con la base creada por Render.

## 3. Esperar el primer despliegue

En los logs deben aparecer mensajes similares a:

```text
[DIAGTI-RENDER] PostgreSQL disponible.
[DIAGTI-RENDER] Base nueva detectada. Creando tablas y datos iniciales...
[DIAGTI-RENDER] Inicialización de PostgreSQL completada.
[DIAGTI-RENDER] Iniciando Spring Boot en el puerto 8080...
[DIAGTI-RENDER] Iniciando Nginx en el puerto público 10000...
```

La compilación inicial puede tardar más porque Maven descargará las dependencias.

## 4. Abrir el sistema

Render mostrará una dirección parecida a:

```text
https://diagti-ctic-unas.onrender.com
```

Si ese nombre ya está ocupado, Render añadirá caracteres al dominio. Usa siempre la URL mostrada en la ficha del servicio.

Login directo:

```text
https://TU-SERVICIO.onrender.com/pages/login/html/login.html
```

Prueba del backend:

```text
https://TU-SERVICIO.onrender.com/auth/health
```

## 5. Usuario de Desarrollo

```text
DNI: 71234567
Contraseña: admin123
```

## 6. Volver a desplegar cambios

Cada `git push` a la rama conectada activa un nuevo despliegue porque `autoDeployTrigger` está configurado como `commit`.

## 7. Limitaciones importantes del plan gratuito

- El servicio puede suspenderse después de un periodo sin visitas. La primera carga posterior será más lenta.
- La base gratuita de Render tiene duración limitada. Revisa la fecha de expiración en el Dashboard.
- Los archivos de evidencia guardados dentro del contenedor son temporales y pueden perderse al reiniciar, suspender o volver a desplegar. Los registros de PostgreSQL sí permanecen mientras la base esté activa.
- Para evidencias permanentes se debe usar almacenamiento externo, por ejemplo Cloudinary, Amazon S3 o un servicio compatible.

## 8. Problemas frecuentes

### El despliegue muestra `Falta la variable obligatoria DB_HOST`

El servicio no quedó vinculado a `diagti-postgres`. Vuelve a crear o sincronizar el Blueprint desde `render.yaml`.

### Error durante `init.sql`

El script se ejecuta en una sola transacción. Si falla, revisa en los logs la primera sentencia SQL con error y corrígela antes de redeployar.

### El login devuelve 502

Spring Boot todavía está iniciando o no logró conectarse a PostgreSQL. Revisa los logs del servicio y busca el primer error de Java.

### La página abre, pero los archivos subidos desaparecen

Es el comportamiento esperado del sistema de archivos temporal del plan gratuito. La solución definitiva es almacenamiento externo.

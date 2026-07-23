# Flujo final de validación, usuarios y actualización

## Flujo de un sistema

1. Desarrollo registra el sistema y pulsa **Enviar a validación**.
2. El mismo envío queda:
   - `PENDIENTE` en **Validación de Desarrollo**.
   - `NUEVO` en la bandeja de **Infraestructura**, para completar sus cuatro pasos.
3. Infraestructura completa Infraestructura, Despliegue, Seguridad y Evidencias,
   y envía su propia solicitud.
4. El Validador ve por separado **Validación de Desarrollo** y
   **Validación de Infraestructura**. Validar un área no cambia el estado de la
   otra.
5. Si el Validador observa, selecciona sección, campo, detalle y si requiere
   evidencia. La observación se guarda en PostgreSQL y vuelve únicamente al
   área responsable.
6. El responsable corrige y pulsa **Marcar como corregido**. El estado pasa a
   `SUBSANADO`.
7. Después pulsa **Reenviar a validación**. Se crea una solicitud `PENDIENTE`
   nueva, sin perder el historial anterior.

Seguridad pertenece al formulario de Infraestructura. No forma parte del
formulario activo de Desarrollo.

## Menú del Área de Desarrollo

Todas las pantallas de Desarrollo conservan únicamente estas tres opciones:

1. **Dashboard**
2. **Mis Sistemas**
3. **Observaciones**

Registrar, editar, enviar e historial son acciones internas de **Mis Sistemas**;
por eso ya no aparecen como opciones adicionales en el menú lateral.

## Trabajo por área

- Los usuarios de una misma área ven la bandeja completa de su área.
- Cada registro conserva el usuario y responsable que lo asumió.
- Todos pueden consultar; sólo el responsable asignado puede modificar,
  subsanar o reenviar.
- La información se consulta nuevamente al abrir la pantalla, recuperar el
  foco, pulsar **Actualizar** y automáticamente cada 15 segundos.
- PostgreSQL es la fuente de verdad. `localStorage` sólo conserva apoyo temporal
  de interfaz y no reemplaza la base de datos.

## Administrador y acceso

- Al crear una cuenta Local son obligatorios DNI, contraseña y confirmación.
- El DNI se guarda como nombre de usuario.
- La contraseña se almacena cifrada con BCrypt.
- Área y rol se validan juntos para evitar cuentas incoherentes.
- Después de guardar, la tabla vuelve a consultarse en PostgreSQL.
- El usuario nuevo puede cerrar la sesión del Administrador e ingresar con su
  DNI y la contraseña creada.

## Logo UNAS

Todos los documentos HTML declaran el logo UNAS como icono. Nginx también
responde `/favicon.ico` con ese archivo y desactiva su caché para evitar que el
navegador conserve el icono anterior de XAMPP.

Si el icono de XAMPP continúa visible:

1. Detenga **Apache** en el panel de XAMPP, porque Docker usa el puerto 80.
2. Abra `http://localhost`.
3. Presione `Ctrl + F5` o cierre y vuelva a abrir la pestaña.

## Actualizar sin borrar los datos

Desde PowerShell, en la carpeta que contiene `docker-compose.yml`:

```powershell
docker compose down
docker compose build --no-cache backend
docker compose up -d
docker compose ps
```

No use `docker compose down -v`: ese parámetro elimina el volumen de PostgreSQL.
`SPRING_JPA_HIBERNATE_DDL_AUTO=update` agrega las columnas nuevas conservando los
registros actuales.

## Prueba rápida

1. Cree un usuario Local en Administrador y verifique su login.
2. En Desarrollo, cree y envíe un sistema.
3. Compruebe que aparece `PENDIENTE` en Validador y `NUEVO` en Infraestructura.
4. En Infraestructura, complete los cuatro pasos y envíe.
5. En Validador, registre una observación distinta para cada área.
6. En cada área, corrija, marque `SUBSANADO` y reenvíe.
7. Valide las dos solicitudes y compruebe los estados al cerrar y volver a
   iniciar sesión.

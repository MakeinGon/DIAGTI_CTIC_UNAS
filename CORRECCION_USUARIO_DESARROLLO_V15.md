# Corrección del flujo de nuevos usuarios de Desarrollo — V15

## Problema encontrado

El código de un sistema nuevo se calculaba con la cantidad de registros visibles:

`SIS + (cantidad de sistemas + 1)`

Esa operación no garantiza un código libre. Por ejemplo, una lista de cuatro
filas podía generar `SIS005` aunque ese código ya estuviera guardado en
PostgreSQL y perteneciera a otro desarrollador. El backend bloqueaba
correctamente la modificación y respondía:

`El sistema pertenece a otro usuario de Desarrollo`

Después, el frontend continuaba el envío aunque el guardado hubiera fallado,
por lo que mostraba una segunda alerta genérica.

## Cambios aplicados

- El siguiente código se obtiene desde el mayor código `SISnnn` existente, no
  desde la cantidad de filas.
- Si otro usuario registra el mismo código mientras el formulario está abierto,
  el frontend sincroniza el inventario, asigna el siguiente código libre y
  reintenta una vez.
- Un sistema nuevo se agrega al almacenamiento del navegador únicamente después
  de que PostgreSQL confirma el guardado.
- Una edición también reemplaza los datos locales únicamente después de la
  confirmación del backend.
- El envío muestra una sola alerta de error y conserva el formulario abierto
  para corregir o reintentar.
- Si el borrador se guardó pero falló el envío al Validador, un segundo intento
  edita el mismo borrador y no crea una copia duplicada.
- Los errores JSON del backend se presentan como mensajes legibles.
- El nombre y las iniciales del menú de Desarrollo se obtienen de la sesión
  iniciada; ya no queda visible “Desarrollador Demo” para una cuenta nueva.
- El área conserva el comportamiento acordado: todos los desarrolladores pueden
  consultar los sistemas del área, pero solamente el propietario puede
  modificarlos, corregirlos o enviarlos.
- El menú de Desarrollo conserva exactamente tres opciones: `Dashboard`,
  `Mis Sistemas` y `Observaciones`.

## Archivos principales modificados

- `frontend/pages/desarrollo/modules/js/mis-sistemas.js`
  - Generación de códigos.
  - Persistencia y reintento.
  - Control del envío y mensajes.
- `frontend/pages/shared/js/flujo-validacion.js`
  - Lectura clara de errores del backend.
  - Perfil real del usuario autenticado.
- Páginas HTML de Desarrollo
  - Actualización de versión de los scripts a `v=15` para evitar caché antiguo.

## Verificación realizada

- Sintaxis válida de todos los archivos JavaScript del proyecto.
- Generación de `SIS006` cuando ya existen códigos hasta `SIS005`.
- Reintento automático `SIS005 → SIS006` ante una colisión de propietario.
- Perfil de sesión verificado con nombre, iniciales y área.
- Tres opciones de menú verificadas en Dashboard, Mis Sistemas y Observaciones.

## Cómo ejecutar la versión

Desde la carpeta que contiene `docker-compose.yml`:

```powershell
docker compose down
docker compose up --build -d
docker compose ps
```

Después abrir `http://localhost` y recargar con `Ctrl + F5`.

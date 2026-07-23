# Verificación de la integración

## Comprobaciones aprobadas

- El archivo `pom.xml` tiene estructura XML válida.
- Se eliminaron dependencias duplicadas del `pom.xml`.
- Los 148 archivos del frontend quedaron incluidos.
- Los 247 archivos Java quedaron incluidos.
- Todos los archivos JavaScript pasan `node --check`.
- No se encontraron enlaces locales rotos en los archivos HTML.
- No se encontraron importaciones internas hacia clases inexistentes.
- `docker-compose.yml` tiene estructura YAML válida e incluye PostgreSQL,
  backend y frontend.
- El login redirige al frontend Directivo que fue incorporado.
- Los mensajes del login ya no imprimen contraseñas en la consola.
- Los repositorios repetidos de los módulos Director y Desarrollador tienen
  nombres de bean independientes para evitar `BeanDefinitionOverrideException`.
- Las entidades JPA del módulo Desarrollador tienen nombres independientes para
  evitar `DuplicateMappingException` frente a las entidades del Director.

## Comprobación pendiente en el equipo local

La compilación Maven no pudo completarse en el entorno de integración porque
Maven Central no estaba disponible para descargar las dependencias de Spring.
En una computadora con Internet se debe ejecutar:

```powershell
cd backend
.\mvnw.cmd clean test
```

Después se debe iniciar el conjunto completo:

```powershell
cd ..
docker compose up --build
```

Abrir `http://localhost/pages/login/html/login.html` y probar un recorrido por
cada rol.
# Corrección del flujo de validación (v5)

- El Validador consulta `solicitudes_validacion` y ya no muestra datos de
  demostración cuando la API falla.
- Desarrollo e Infraestructura guardan sus envíos mediante
  `POST /api/flujo-validacion/solicitudes`.
- Los reintentos del mismo sistema y área actualizan la solicitud pendiente,
  evitando duplicados.
- Un fallo de red conserva el registro para reintentar; no lo marca como
  enviado falsamente.
- Nginx ya no mantiene JavaScript/HTML antiguos durante un año.
- La tabla `solicitudes_validacion` dispone de script de creación explícito y
  también es administrada por JPA para instalaciones que ya tienen volumen.
# Integración persistente del flujo (v6)

## Fuente de verdad

Los estados ya no dependen del almacenamiento del navegador. La tabla
`solicitudes_validacion` conserva el envío, el origen, la respuesta del
Validador, quién revisó y las fechas. Al iniciar sesión, volver a una pestaña o
mantenerla abierta, las pantallas vuelven a consultar PostgreSQL.

| Emisor | Origen guardado | Respuesta sincronizada |
|---|---|---|
| Desarrollo | `DESARROLLO` | Mis Sistemas, Dashboard y Observaciones |
| Infraestructura | `INFRAESTRUCTURA` | Dashboard, Mis Sistemas, Registro e Historial |
| Responsable Funcional | `FUNCIONAL` | Dashboard, Mis Sistemas, Detalle e Historial |

El Validador recibe los tres orígenes en **Pendientes**. Cuando valida u observa,
la misma solicitud registra `VALIDADO`, `OBSERVADO` o `RECHAZADO`, el comentario
y el nombre del revisor. La respuesta aparece automáticamente en el módulo que
la envió.

## Refresco

- Al cargar cada pantalla.
- Al regresar a una pestaña.
- Cada 15 segundos mientras la pestaña está visible.
- Manualmente con el botón **Actualizar** donde corresponde.

Los roles Administrador, Auditor y Directivo permanecen como consulta o
administración; no generan solicitudes de validación.
# Corrección de asignación Desarrollo → Infraestructura (v7)

Cuando Desarrollo envía un sistema, la solicitud `DESARROLLO` cumple dos
funciones simultáneas:

1. Aparece en la bandeja **Pendientes** del Validador.
2. Aparece como **Nuevo** en Dashboard, Mis Sistemas y Registro técnico de
   Infraestructura.

Infraestructura ya no carga la lista fija de sistemas demostrativos. Consulta
los envíos reales de Desarrollo y, cuando completa el registro técnico, crea
una segunda solicitud con origen `INFRAESTRUCTURA`. El Validador puede revisar
las dos partes por separado y cada respuesta vuelve al área que la envió.

El favicon de las pantallas principales ahora usa el logo UNAS y Nginx también
responde `/favicon.ico` con ese logo para evitar el icono almacenado de XAMPP.

# Backend persistente por módulos (v8)

- El flujo compartido fue separado en controlador, servicio, repositorio,
  DTO y entidades JPA, conservando las rutas que ya utilizaba el Validador.
- Desarrollo cuenta con API para listar, consultar, guardar borradores,
  guardar correcciones, enviar, consultar historial y obtener estadísticas.
- Infraestructura cuenta con API para sistemas asignados, registro técnico,
  borradores, correcciones, envíos, historial, dashboard y estadísticas.
- La tabla `registros_area` conserva el último estado y los datos completos de
  cada sistema por área. `solicitudes_validacion` conserva cada intervención
  del Validador y su respuesta.
- Se eliminó el usuario fijo `desarrollador1`. Los servicios de Desarrollo
  usan el usuario de la sesión y `usuario_creador` para controlar propiedad.
- Las pantallas recuperan desde PostgreSQL los borradores y correcciones al
  iniciar, volver a la pestaña o actualizar.
- Todos los archivos Java pasan el análisis sintáctico y todos los JavaScript
  pasan `node --check`.

## Flujo verificado por contrato

1. Desarrollo guarda o envía un sistema con `usuario_origen`.
2. El envío aparece simultáneamente en Validador e Infraestructura.
3. Infraestructura guarda su registro técnico asociado al usuario conectado.
4. El Validador registra `VALIDADO`, `OBSERVADO` o `RECHAZADO`.
5. La respuesta sincroniza `solicitudes_validacion` y `registros_area`.
6. Desarrollo o Infraestructura recuperan el estado y la observación al volver
   a ingresar.

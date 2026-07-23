# Módulo Desarrollo: archivos y conexiones

> Alcance actual: el flujo compartido trabaja por **área**. Todos los
> desarrolladores pueden consultar los registros de Desarrollo, pero sólo el
> propietario puede modificarlos. La sección **Seguridad** pertenece al flujo
> activo de Infraestructura y ya no se muestra ni se envía desde el frontend de
> Desarrollo. Las clases antiguas que todavía mencionan infraestructura o
> seguridad se conservan únicamente para no romper rutas y datos legacy.

## Resultado de la simplificación

El módulo pasó de **73 a 52 archivos Java** sin cambiar las rutas HTTP, los
nombres de los campos JSON, las tablas ni el flujo entre roles.

- Se conservaron los 8 controladores y sus rutas.
- Los 8 pares `Service + ServiceImpl` se convirtieron en 8 servicios concretos.
  Los controladores siguen inyectando exactamente los mismos nombres
  (`RegistrarSistemaService`, `EditarSistemaService`, etc.).
- Los mapeadores técnicos de arquitectura, infraestructura, seguridad,
  evidencias e integraciones se agruparon en `SistemaDetalleMapper`.
- Los DTO pequeños que pertenecían a una misma operación se agruparon como
  clases internas. Esto solo cambia la organización Java, no el JSON.
- Se eliminaron `AuditoriaUtil` y `EstadoValidator` porque estaban vacíos.
- Se eliminaron `SistemaMapper`, `ValidacionMapper` y `ValidacionDTO` porque no
  tenían ninguna llamada funcional.

No se juntaron las entidades ni los repositorios. Cada entidad representa una
tabla diferente de PostgreSQL y mantenerla como clase pública independiente
evita problemas con JPA, relaciones, transacciones y consultas.

## Flujo funcional conservado

1. Desarrollo registra o edita la información funcional y técnica.
2. El backend guarda el sistema y sus secciones en PostgreSQL.
3. Al enviar, `DesarrolloFlujoService` persiste el registro compartido y crea la
   solicitud de validación.
4. El envío queda `NUEVO` para Infraestructura y `PENDIENTE` para el Validador.
5. El Validador registra `VALIDADO`, `OBSERVADO` o `RECHAZADO`.
6. Desarrollo vuelve a consultar el estado y, si corresponde, corrige y
   reenvía. El historial permanece en la base de datos después de cerrar sesión
   o actualizar la página.

La integración transversal usa estas clases compartidas del backend:

- `flujo.entity.RegistroArea`: último estado y datos enviados por el área.
- `flujo.repository.RegistroAreaRepository`: lectura y escritura persistente.
- `flujo.service.SolicitudValidacionService`: crea y consulta solicitudes.
- `flujo.entity.SolicitudValidacion`: historial visible entre roles.

## Controladores

Carpeta:
`backend/src/main/java/pe/edu/unas/ctic/diagti/desarrollador/controller`

| Archivo | Qué hace | Se conecta con |
| --- | --- | --- |
| `DashboardDesarrolloController.java` | Expone indicadores del dashboard. | `DashboardDesarrolloService` |
| `DesarrolloFlujoController.java` | Guarda borradores/correcciones, envía al flujo común y consulta historial. | `DesarrolloFlujoService`, frontend compartido de flujo |
| `EditarSistemaController.java` | Consulta y modifica sistemas, evidencias, URL e integraciones. | `EditarSistemaService` |
| `EnviarValidacionController.java` | Verifica completitud y solicita la validación técnica legacy. | `EnviarValidacionService` |
| `HistorialSistemaController.java` | Devuelve historial y resumen de un sistema. | `HistorialSistemaService` |
| `MisSistemasController.java` | Lista sistemas del usuario con filtros y estadísticas. | `MisSistemasService` |
| `RegistrarSistemaController.java` | Registra un sistema y agrega evidencias, URL e integraciones. | `RegistrarSistemaService` |
| `SubsanarObservacionesController.java` | Muestra observaciones, guarda correcciones y reenvía. | `SubsanarObservacionesService` |

## Servicios

Carpeta:
`backend/src/main/java/pe/edu/unas/ctic/diagti/desarrollador/service`

| Archivo | Qué hace | Se conecta con |
| --- | --- | --- |
| `DashboardDesarrolloService.java` | Calcula totales, actividad y riesgos del propietario. | Repositorios de sistemas y validaciones |
| `DesarrolloFlujoService.java` | Orquesta Desarrollo → Infraestructura/Validador, comparte la consulta por área y conserva el propietario. | `RegistroAreaRepository`, `SolicitudValidacionService`, `DesarrolloFlujoMapper` |
| `EditarSistemaService.java` | Lee y actualiza el sistema completo y sus adjuntos. | Todos los repositorios técnicos, `SistemaDetalleMapper`, `RiesgoCalculator` |
| `EnviarValidacionService.java` | Evalúa campos obligatorios, cambia el estado y crea una validación. | Sistemas, evidencias y validaciones |
| `HistorialSistemaService.java` | Construye eventos y resumen del sistema. | Sistemas, validaciones y evidencias |
| `MisSistemasService.java` | Aplica filtros, permisos por propietario y estadísticas. | `SistemaDesarrolloRepository`, `UsuarioActual` |
| `RegistrarSistemaService.java` | Guarda sistema, arquitectura, infraestructura, seguridad e integraciones. | Repositorios técnicos, `SistemaDetalleMapper`, `RiesgoCalculator` |
| `SubsanarObservacionesService.java` | Guarda correcciones, evidencias y el reenvío observado. | Sistemas, validaciones, arquitectura, seguridad y evidencias |

## DTO: datos que entran y salen de la API

Carpeta:
`backend/src/main/java/pe/edu/unas/ctic/diagti/desarrollador/dto`

| Archivo | Qué representa | Usado principalmente por |
| --- | --- | --- |
| `ArquitecturaDTO.java` | Arquitectura de software, base de datos y repositorio. | Registro, edición y `SistemaDetalleMapper` |
| `DashboardDesarrolloDTO.java` | Estadísticas, actividad y riesgos del dashboard. | Dashboard |
| `DesarrolloFlujoDTO.java` | Estado persistido del flujo y clase interna `Request` para guardar/enviar. | Flujo compartido |
| `EditarSistemaRequestDTO.java` | Datos que el frontend envía al editar. | Edición |
| `EnvioValidacionDTO.java` | Clases internas `Request` y `Response` de la solicitud de validación. | Envío a validación |
| `EvidenciaDTO.java` | Metadatos de archivos y enlaces de evidencia. | Edición y detalle |
| `HistorialSistemaDTO.java` | Eventos y resumen cronológico. | Historial |
| `InfraestructuraDTO.java` | Plataforma, servidor, despliegue y exposición. | Registro, edición y mapper |
| `IntegracionDTO.java` | Conexión del sistema con otro sistema. | Registro, edición y mapper |
| `MisSistemasDTO.java` | Fila de la bandeja, estadísticas y clase interna `Filter`. | Mis Sistemas |
| `OperacionSistemaDTO.java` | Respuestas internas `RegistroResponse` y `EdicionResponse`. | Registro y edición |
| `RegistrarSistemaRequestDTO.java` | Datos iniciales para crear el sistema. | Registro |
| `SeguridadDTO.java` | Compatibilidad con registros legacy; no se usa en el formulario activo de Desarrollo. | Datos históricos |
| `SistemaCompletoDTO.java` | Vista completa de todas las secciones. | Edición y detalle |
| `SistemaObservadoDTO.java` | Resumen de un sistema con observaciones pendientes. | Subsanación |
| `SistemaValidacionDTO.java` | Completitud, faltantes y capacidad de envío. | Validación |
| `SubsanarObservacionesRequestDTO.java` | Correcciones enviadas por Desarrollo. | Subsanación |
| `SubsanarObservacionesResponseDTO.java` | Observaciones y resultado de la corrección. | Subsanación |

## Entidades y tablas

Carpeta:
`backend/src/main/java/pe/edu/unas/ctic/diagti/desarrollador/entity`

| Archivo | Tabla PostgreSQL | Relación |
| --- | --- | --- |
| `SistemaEntity.java` | `sistemas_informaticos` | Entidad principal; pertenece a un usuario de Desarrollo |
| `ArquitecturaEntity.java` | `arquitecturas_software` | Uno a uno con sistema |
| `InfraestructuraEntity.java` | `infraestructura_tecnologica` | Uno a uno con sistema |
| `SeguridadEntity.java` | `seguridad_sistemas` | Compatibilidad con datos históricos; Seguridad se completa actualmente en Infraestructura |
| `EvidenciaEntity.java` | `evidencias_tecnicas` | Varias evidencias por sistema |
| `IntegracionEntity.java` | `integraciones` | Varias integraciones por sistema |
| `ValidacionEntity.java` | `validaciones_tecnicas` | Historial de validaciones y subsanaciones |

## Repositorios

Carpeta:
`backend/src/main/java/pe/edu/unas/ctic/diagti/desarrollador/repository`

| Archivo | Qué consulta o guarda | Entidad |
| --- | --- | --- |
| `SistemaDesarrolloRepository.java` | Sistemas por propietario, estado, código y filtros. | `SistemaEntity` |
| `ArquitecturaRepository.java` | Arquitectura del sistema. | `ArquitecturaEntity` |
| `InfraestructuraRepository.java` | Infraestructura técnica. | `InfraestructuraEntity` |
| `SeguridadRepository.java` | Controles de seguridad. | `SeguridadEntity` |
| `EvidenciaRepository.java` | Archivos y URL activos o eliminados lógicamente. | `EvidenciaEntity` |
| `IntegracionRepository.java` | Conexiones con otros sistemas. | `IntegracionEntity` |
| `DesarrolladorValidacionRepository.java` | Última validación e historial por sistema. | `ValidacionEntity` |

## Mapeadores y utilitarios

| Archivo | Qué hace | Se conecta con |
| --- | --- | --- |
| `mapper/DesarrolloFlujoMapper.java` | Convierte `RegistroArea` y su JSON persistido a `DesarrolloFlujoDTO`. | Jackson y flujo compartido |
| `mapper/SistemaDetalleMapper.java` | Centraliza conversiones de arquitectura, infraestructura, seguridad, evidencia e integración. | MapStruct, servicios de registro y edición |
| `util/RiesgoCalculator.java` | Calcula puntaje y nivel de riesgo del sistema. | Registro, edición y subsanación |
| `util/UsuarioActual.java` | Resuelve el usuario autenticado y verifica propiedad. | Servicios que aíslan información por usuario |

## Frontend que consume el módulo

Las rutas anteriores siguen siendo consumidas por:

- `frontend/pages/desarrollo/modules/js/config.js`
- `frontend/pages/desarrollo/modules/js/editar-sistema.js`
- `frontend/pages/desarrollo/modules/js/enviar-validacion.js`
- `frontend/pages/desarrollo/modules/js/historial-sistema.js`
- `frontend/pages/desarrollo/modules/js/subsanar-observaciones.js`
- `frontend/pages/shared/js/flujo-validacion.js`

## Regla para futuras modificaciones

Para no romper el flujo:

1. No cambiar rutas `/api/desarrollador/**` sin actualizar el frontend.
2. No renombrar propiedades de los DTO sin una migración del JSON.
3. No eliminar `usuarioOrigen` o el filtro por propietario.
4. No reemplazar las escrituras de PostgreSQL por `localStorage`.
5. Toda respuesta del Validador debe actualizar la solicitud compartida y
   conservar el historial.

## Cómo ejecutar esta versión

Desde la carpeta que contiene `docker-compose.yml`:

```powershell
docker compose down
docker compose build --no-cache backend
docker compose up -d
docker compose ps
```

Luego abrir `http://localhost`. No usar `docker compose down -v` si se desea
conservar la información que ya existe en PostgreSQL.

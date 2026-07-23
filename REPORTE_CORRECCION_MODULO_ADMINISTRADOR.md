# REPORTE DE CORRECCIÓN · MÓDULO ADMINISTRADOR

## 1. Rama y commit inicial

| Campo | Valor |
|-------|--------|
| Rama | `feature/estabilizacion-diagti` |
| Commit inicial | `544c4a8` — `feat: conectar modulo auditor a tablas oficiales` |
| Working tree inicial | limpio |
| Commit / push / merge / cambio a main | **No realizados** |

## 2. Situación inicial

El módulo Administrador ya existía con:

- Frontend en `frontend/pages/admin/modules/` (6 pantallas).
- Backend en `pe.edu.unas.ctic.diagti.administrador` bajo `/api/admin/*`.
- Uso de tablas oficiales (`usuarios`, `roles`, `usuarios_roles`, `catalogos`, `sistemas`, `auditoria`, `evidencias`, `permisos`).
- Consumo API con URL absoluta `http://localhost:8080` (incompatible con Nginx en `http://localhost`).
- `@CrossOrigin(origins = "*")` en todos los controladores.
- Eliminaciones físicas de usuarios, roles y catálogos.
- Sin registro de auditoría en escrituras.
- Sin pruebas unitarias del paquete administrador.
- Filtros incompletos en sistemas / auditoría / evidencias.
- Tipo de catálogo de áreas incorrecto en frontend (`AREA_USUARIA` vs oficial `AREA_USUARIO`).

## 3. Frontend encontrado

```
frontend/pages/admin/modules/
  index.html
  styles.css
  gestion-usuarios/     (.html .js .css)
  roles-permisos/       (.html .js .css)
  gestion-catalogos/    (.html .js .css)
  reportes-inventario/  (.html .js .css)   ← consulta sistemas oficiales
  auditoria-trazabilidad/ (.html .js .css)
  evidencias-obligatorias/ (.html .js .css)
```

## 4. Backend encontrado

| Componente | Ubicación |
|---|---|
| Controllers | `UsuarioController`, `RolPermisoController`, `CatalogoController`, `SistemaAdminController`, `AuditoriaController`, `EvidenciaController` |
| Services | Usuario, Rol, Permiso, Catalogo, SistemaAdmin, Auditoria, Evidencia |
| Entities | `UsuarioEntity`, `RolEntity`, `CatalogoEntity`, `AuditoriaEntity`, `PermisoEntity` |
| Sistemas / Evidencias | Reutiliza `director.entity.SistemaEntity` y `EvidenciaEntity` |
| Base path | `/api/admin` (conservado; no se creó `/api/administrador` duplicado) |

## 5. Problemas detectados

1. Rutas absolutas al puerto 8080 (bypass de Nginx / riesgo CORS).
2. `@CrossOrigin` redundante.
3. DELETE físico de usuarios/roles/catálogos.
4. Escrituras sin traza en `auditoria`.
5. Duplicados respondían como 400 genérico (ahora 409).
6. Detalle de sistemas/auditoría/evidencias podía devolver `null` (HTTP 200).
7. Filtros de sistemas/auditoría/evidencias incompletos.
8. Sistemas eliminados (`fecha_eliminacion`) no filtrados.
9. Catálogo de áreas mal tipado en frontend.
10. Usuarios Local creados sin `password_hash` (login imposible).
11. Cero pruebas del módulo.

## 6. Causas

- Evolución incremental del admin sin alinear proxy Nginx.
- Contrato UI con botón “Eliminar” interpretado como borrado físico.
- Ausencia de capa de auditoría administrativa.
- Entidades compartidas sin filtro soft-delete.
- Tipado de catálogos desalineado respecto a `DataBase/init.sql`.

## 7. Archivos modificados / creados

### Backend

- Controllers admin: sin `@CrossOrigin`; respuestas con `ResponseEntity`; 404/409.
- `UsuarioServiceImpl`: soft-delete, username=DNI, password Local compatible, auditoría, roles idempotentes.
- `RolServiceImpl` / `CatalogoServiceImpl`: soft-delete + auditoría + conflictos.
- `SistemaAdminServiceImpl`: filtros, soft-delete, PUT administrativo, PUT responsables.
- `AuditoriaServiceImpl` / `EvidenciaServiceImpl`: filtros y 404.
- `PermisoServiceImpl`: auditoría en actualización.
- `AdminAuditoriaWriter`, `ConflictException`, DTOs de actualización/responsables.
- `GlobalExceptionHandler`: HTTP 409.
- Tests: `AdministradorServicesTest`, `AdministradorControllersTest`.

### Frontend

- Todos los JS admin: `API_BASE = '/api/admin...'` (relativo).
- Soft-delete en textos/acciones (Desactivar).
- Catálogos: `AREA_USUARIO`.
- Prevención de doble envío en alta/edición de usuarios.

### Datos

- `DataBase/test-data-administrador.sql` (**no ejecutado**).

### Informe

- `REPORTE_CORRECCION_MODULO_ADMINISTRADOR.md` (este archivo).

## 8. Endpoints

### Usuarios (`/api/admin/usuarios`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar (filtros search/rol/estado/origen) |
| GET | `/{dni}` | Detalle |
| POST | `/?rolId=` | Crear |
| PUT | `/{dni}?rolId=` | Actualizar |
| PATCH | `/{dni}/estado` | Activar/desactivar |
| DELETE | `/{dni}` | Soft-delete (desactivar) |
| POST | `/{dni}/roles/{rolId}` | Asignar rol (idempotente) |
| DELETE | `/{dni}/roles/{rolId}` | Retirar rol (idempotente) |

### Roles / permisos

| Método | Ruta |
|--------|------|
| GET/POST | `/api/admin/roles` |
| GET/PUT/DELETE | `/api/admin/roles/{id}` (DELETE = desactivar) |
| GET/PUT | `/api/admin/permisos/{rolId}` |

### Catálogos

| Método | Ruta |
|--------|------|
| GET/POST | `/api/admin/catalogos/{tipo}` |
| PUT/DELETE | `/api/admin/catalogos/{tipo}/{codigo}` (DELETE = desactivar) |

### Sistemas

| Método | Ruta |
|--------|------|
| GET | `/api/admin/sistemas` |
| GET | `/api/admin/sistemas/stats` |
| GET | `/api/admin/sistemas/{id}` |
| PUT | `/api/admin/sistemas/{id}` |
| PUT | `/api/admin/sistemas/{id}/responsables` |

### Auditoría / evidencias (lectura)

- `GET /api/admin/auditoria`, `/stats`, `/{id}`
- `GET /api/admin/evidencias`, `/stats`, `/{id}`

## 9. Contratos JSON

### Usuario (respuesta)

```json
{
  "usuarioId": 1,
  "username": "76551691",
  "nombres": "...",
  "apellidos": "...",
  "dni": "76551691",
  "nombreCompleto": "...",
  "correo": "...",
  "area": "...",
  "rolId": 1,
  "rol": "admin",
  "origen": "Local",
  "estado": "Activo",
  "ultimoAcceso": null,
  "fechaCreacion": "dd/MM/yyyy HH:mm",
  "roles": ["admin"]
}
```

**No incluye** `passwordHash` / `password_hash`.

### Responsables

```json
{ "idResponsableTecnico": 10, "idResponsableFuncional": 1 }
```

## 10. Tablas oficiales utilizadas

`usuarios`, `roles`, `usuarios_roles`, `catalogos`, `sistemas`, `validaciones` (solo lectura indirecta), `observaciones` (no escritas), `evidencias`, `auditoria`, `permisos`.

## 11. Tablas legacy detectadas / evitadas

No usadas por el flujo activo de Administrador:

- `sistemas_informaticos`
- `validaciones_tecnicas`
- `arquitecturas_software`
- `infraestructura_tecnologica`
- `seguridad_sistemas`
- `evidencias_tecnicas`

## 12. Gestión de usuarios

- CRUD sobre tabla oficial `usuarios`.
- Username por defecto = DNI (convención del seed).
- Soft-delete vía `estado=false`.
- Local: `password_hash="admin123"` (compatibilidad con login plano actual; **no expuesto**).
- LDAP: no se fuerza password_hash.

## 13. Gestión de roles

Roles oficiales verificados en `init.sql`: `admin`, `auditor`, `desarrollo`, `directivo`, `funcional`, `infraestructura`, `validacion`.

Soft-delete: `estado=false` sin borrar asignaciones.

## 14. Asignaciones usuario–rol

- Asignación principal en crear/actualizar (`rolId`).
- Endpoints explícitos POST/DELETE idempotentes.
- Tabla `usuarios_roles`.

## 15. Catálogos

Tipos UI alineados a BD: `AREA_USUARIO`, `TIPO_APLICATIVO`, `CRITICIDAD`, etc. Soft-delete por `estado`.

## 16. Sistemas

Misma tabla `sistemas` / mismo `id_sistema` que Desarrollador, Validación, Infraestructura, Director y Auditor. No se fuerza `VALIDADO`.

## 17. Asignación de responsables

Columnas reales: `id_responsable_tecnico`, `id_responsable_funcional`. Rechaza usuarios desactivados (HTTP 409).

## 18. Auditoría administrativa

Escrituras registran en `auditoria` (módulo `Administrador`). Los GET no generan eventos.

## 19–23. Integración con otros módulos

| Módulo | Compatibilidad |
|--------|----------------|
| Desarrollador | Conserva responsables técnicos y `sistemas.id` |
| Validación | No altera decisiones; endpoints `/api/validacion/pendientes` y `/estadisticas` → 200 |
| Infraestructura | No altera evaluaciones; dashboard → 200 |
| Director | Inventario → 200 sobre mismos sistemas |
| Auditor | Solo lectura; inventario → 200; reutiliza `AuditoriaEntity` |
| Funcional | **Fuera de alcance** (no modificado) |

## 24. Módulo Funcional fuera del alcance

Sin cambios en frontend/backend/servicios/rutas de Funcional.

## 25. Validaciones

- Obligatorios: DNI, nombre, correo, rol.
- Unicidad: DNI, correo, username, código de catálogo, nombre de rol → 409.
- Recursos inexistentes → 404.
- Datos inválidos → 400.
- Responsable inactivo → 409.

## 26. Pruebas

| Suite | Tests |
|-------|------:|
| Previas (otros módulos) | 81 |
| Nuevas Administrador (services + controllers) | 35 |
| **Total** | **116** |
| Fallos | **0** |
| Resultado | **BUILD SUCCESS** |

## 27. Resultado de compilación

```
./mvnw clean test          → BUILD SUCCESS (116 tests)
./mvnw -DskipTests compile → BUILD SUCCESS
```

## 28. Estado de Docker

| Servicio | Estado |
|----------|--------|
| postgres | Up (healthy) |
| backend | Up |
| frontend | Up (Nginx, volumen `./frontend`) |

Logs backend: arranque OK. Hibernate con `ddl-auto=update` sigue emitiendo `ALTER TABLE` (riesgo documentado).

## 29. Endpoints verificados (`curl.exe` vía Nginx)

| Endpoint | HTTP |
|----------|------|
| `/auth/health` | 200 |
| `/api/admin/usuarios` | 200 |
| `/api/admin/roles` | 200 |
| `/api/admin/catalogos/CRITICIDAD` | 200 |
| `/api/admin/sistemas` | 200 |
| `/api/admin/auditoria` | 200 |
| `/api/admin/evidencias` | 200 |
| `/api/admin/usuarios/00000000` | 404 |
| `/api/auditor/inventario` | 200 |
| `/api/director/inventario` | 200 |
| `/api/infraestructura/dashboard` | 200 |
| `/api/validacion/pendientes` | 200 |
| `/api/validacion/estadisticas` | 200 |

`findstr password` sobre `/api/admin/usuarios` → sin coincidencias.

## 30. SQL preparado y no ejecutado

Archivo: `DataBase/test-data-administrador.sql`

- Idempotente (`INSERT ... WHERE NOT EXISTS` / SELECT por username/rol/código).
- Prepara usuarios ADM-* por perfil, roles, catálogos, `SYS-ADM-DEMO`, auditoría.
- **No ejecutado** en esta tarea.

## 31. Seguridad y LDAP pendientes

- Sin LDAP.
- Sin rediseño de autenticación.
- `/api/**` sigue `permitAll` (pendiente institucional).

## 32. Riesgo de password_hash

- Login actual compara texto plano.
- Usuarios Local nuevos reciben `admin123` (mismo patrón del seed).
- Nunca se serializa en DTO ni logs de API.
- Debe reemplazarse por hash seguro en una tarea de seguridad dedicada.

## 33. Riesgo de ddl-auto=update

`spring.jpa.hibernate.ddl-auto=update` continúa activo vía `.env`. Logs muestran `ALTER TABLE` sobre tablas oficiales y legacy. No se modificó `.env`. No se agregaron entidades que creen tablas paralelas nuevas en Administrador.

## 34. Dependencias técnicas / deuda

1. Entidades JPA duplicadas (`usuarios`/`roles` en Login vs Administrador; `sistemas` en director vs otros).
2. `AuditoriaEntity` compartida (aceptable; no duplicar).
3. Matriz de permisos UI no enforzada en Security.
4. Frontend reportes-inventario aún consulta catálogos vía `/api/director/reportes` (funciona; se puede unificar después).
5. Columnas metadata (`creado_por`, `bloqueado`, etc.) no mapeadas en entidades admin.
6. Seguridad / LDAP / autenticación avanzada pendientes.

## 35. Corrección adicional · GET `/api/admin/catalogos` (ruta base)

### Problema encontrado

`GET /api/admin/catalogos` respondía **HTTP 500** con el mensaje:

`No static resource api/admin/catalogos.`

En cambio, `GET /api/admin/catalogos/AREA_USUARIO` ya funcionaba (HTTP 200, `[]`).

### Causa

`CatalogoController` solo exponía:

- `GET /{tipo}`
- `POST /{tipo}`
- `PUT /{tipo}/{codigo}`
- `DELETE /{tipo}/{codigo}`

No existía un `@GetMapping` sin path variable para la ruta base `/api/admin/catalogos`. Spring trataba la petición como recurso estático inexistente y devolvía 500.

### Frontend

La pantalla de Catálogos (`gestion-catalogos.component.js`) **filtra por tipo** (`/api/admin/catalogos/{tipoBD}`) y no requiere el listado global para su flujo principal. Aun así, la ruta base debe existir para evitar el 500 y permitir consumo/agrupación por `tipo` cuando se necesite.

### Archivos corregidos

- `CatalogoController.java` — `@GetMapping` base
- `CatalogoService` / `CatalogoServiceImpl` — `listarTodos()`
- `CatalogoRepository` — `findAllByOrderByTipoCatalogoAscOrdenAsc()`
- `CatalogoDTO` + `CatalogoMapper` — campo `tipo` en el DTO
- Pruebas en `AdministradorControllersTest` y `AdministradorServicesTest`

### Endpoint agregado

| Método | Ruta | Respuesta |
|--------|------|-----------|
| GET | `/api/admin/catalogos` | `200` + lista de `CatalogoDTO` o `[]` |

Contrato (DTO, sin entidad JPA):

```json
[
  {
    "tipo": "AREA_USUARIO",
    "codigo": "ADMIN",
    "nombre": "Administración",
    "descripcion": "...",
    "estado": "Activo",
    "orden": 1
  }
]
```

### Pruebas añadidas

- `GET /api/admin/catalogos` → 200 y `[]` (vacío)
- `GET /api/admin/catalogos` con datos → JSON con `tipo`/`codigo`/`nombre`
- `GET /api/admin/catalogos/{tipo}` sigue OK
- Tipo sin resultados → `[]`
- Sin HTTP 500 en ruta base

### Resultado HTTP final (verificado)

```
curl.exe -i http://localhost/api/admin/catalogos
→ HTTP/1.1 200
→ []

curl.exe -i http://localhost/api/admin/catalogos/AREA_USUARIO
→ HTTP/1.1 200
→ []
```

Compilación: **121 tests**, 0 fallos, **BUILD SUCCESS**. Docker backend Up.

---

**Fin del reporte.** Sin commit, sin push, sin merge, sin cambio a `main`, sin ejecución del SQL de prueba.

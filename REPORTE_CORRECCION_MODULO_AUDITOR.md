# REPORTE DE CORRECCIÓN · MÓDULO AUDITOR

## 1. Rama y commit de inicio

- **Rama:** `feature/estabilizacion-diagti`
- **Commit inicial:** `baddf3d` — `feat: integrar desarrollador validacion infraestructura y director`
- **Working tree inicial:** limpio
- **Sin commit / push / merge / cambio a main** en esta tarea

## 2. Situación inicial

El módulo Auditor existía parcialmente:

- Frontend en `frontend/pages/auditor/modules/` (Inventario, Auditoría, Reportes)
- Backend en `backend/.../auditor/` con controladores bajo `/auditor` (fuera de `/api`)
- Uso de entidades/repos duplicados (`auditor.model.Auditoria`, `sistemas.model.Sistema` / `ssSistemaRepository`)
- `@CrossOrigin(origins = "*")` en controladores
- Reportes con mocks locales como fallback
- Historial registraba evento en cada consulta GET
- Detalle de sistema leía solo la fila del inventario en memoria (sin consolidado)

## 3. Frontend encontrado

```
frontend/pages/auditor/modules/
  html/inventario.html
  html/auditoria.html
  html/reportes.html
  js/inventario.js
  js/auditoria.js
  js/reportes.js
  css/inventario.css
  css/auditoria.css
  css/reportes.css
```

Decisiones de UI conservadas:

- Inventario como pantalla principal
- Detalle por modal (no se restauró `detalle-sistema.html` ni `dashboard-auditor.html`)
- Pantallas Auditoría y Reportes
- Exportación Excel (CSV) y PDF (impresión)
- Modo solo lectura
- Etiqueta “Sistema pendiente” en lugar de “legacy”

## 4. Backend encontrado (antes)

| Componente | Ubicación |
|---|---|
| Controllers | `AuditorInventarioController`, `AuditorAuditoriaController`, `AuditorReportesController` |
| Service | `AuditorAuditoriaService` + `AuditorAuditoriaServicelmpl` (typo) |
| Repo | `AuditorAuditoriaRepository` → entidad duplicada `Auditoria` |
| Model | `auditor.model.Auditoria` (`@Table(auditoria)`) |
| Inventario | usaba `ssSistemaRepository` / `Sistema` |

## 5. Problemas detectados

1. Rutas `/auditor/...` incompatibles con el patrón `/api/...` vía Nginx
2. `@CrossOrigin` redundante
3. Doble mapeo JPA de `auditoria` (`Auditoria` vs `AuditoriaEntity`)
4. Inventario sin filtros reales y sin DTO
5. Sin detalle consolidado por `sistema_id`
6. Mocks en Reportes
7. Escritura de auditoría en cada consulta GET
8. Campos “legacy” / IDs crudos en UI
9. Query JPQL con parámetros nulos → error PostgreSQL `could not determine data type`

## 6. Causas

- Módulo Auditor quedó a medias respecto a Director/Validación/Infra
- Entidades paralelas y proxy Nginx específico `/auditor/`
- Fallback a datos locales para “no romper” la UI
- JPQL opcional mal tipado para PostgreSQL 17

## 7. Archivos modificados / creados

### Backend (principales)

- Controllers reescritos bajo `/api/auditor`
- `AuditorInventarioService` + `Impl`
- `AuditorReportesService` + `Impl`
- `AuditorAuditoriaServiceImpl` (reemplaza `Servicelmpl`)
- DTOs: inventario, detalle, observación, resumen reportes
- `AuditorAuditoriaRepository` sobre `AuditoriaEntity`
- `AuditoriaEntity`: columnas `user_agent`, `sesion_id` (aditivo)
- Eliminado: `auditor.model.Auditoria`, `AuditorAuditoriaServicelmpl`
- Tests: `AuditorServicesTest`, `AuditorControllersTest`

### Frontend

- `inventario.js`, `auditoria.js`, `reportes.js` → `/api/auditor/...`
- `inventario.html` → estados oficiales y “pendiente”

### Infra

- `nginx.conf`: eliminado `location /auditor/` (queda `/api/`)
- `DataBase/test-data-auditor.sql` (no ejecutado)

## 8. Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/auditor/inventario` | Inventario filtrable |
| POST | `/api/auditor/inventario` | Compatibilidad FE histórico |
| GET | `/api/auditor/inventario/kpis` | KPIs inventario |
| GET | `/api/auditor/inventario/{sistemaId}` | Detalle consolidado (404 si no existe) |
| GET | `/api/auditor/observaciones` | Observaciones (origen por prefijo) |
| GET/POST | `/api/auditor/auditoria` | Historial (solo lectura) |
| GET | `/api/auditor/kpis` | KPIs auditoría |
| GET | `/api/auditor/auditoria/kpis` | Alias KPIs |
| GET | `/api/auditor/reportes/resumen` | Indicadores oficiales |
| GET | `/api/auditor/reportes/datos?tipo=` | sistemas/auditoria/observaciones/validaciones/evidencias |
| POST | `/api/auditor/reporte` | Compatibilidad FE |
| GET | `/api/auditor/kpis-reportes` | KPIs pantalla reportes |

**Sin endpoint de escritura** (`/registrar` eliminado del controlador Auditor).

## 9. Contratos JSON (resumen)

**Inventario item:** `sistemaId`, `codigo`, `nombre`, `descripcion`, `area`, `tipo`, `criticidad`, `estado`, `responsableTecnico`, `responsableFuncional`, `estadoValidacion`, `cantidadObservaciones`, `nivelRiesgo`, `sistemaPendiente`, `contratoVigente`, fechas ISO.

**Detalle:** mismos campos + listas `arquitectura`, `infraestructura`, `seguridad`, `integraciones`, `evidencias`, `validaciones`, `observaciones`, `auditoria` (vacías si no hay datos).

**Auditoría item:** `idAuditoria`, `idUsuario`, `nombreUsuario`, `correoUsuario`, `modulo`, `accion`, `descripcion`, `fechaEvento`, `direccionIp`.

**Reportes resumen:** totales + mapas `porEstado`, `porCriticidad`, `porArea`, observaciones por estado/origen, actividad, rankings.

Base vacía → `[]` o ceros; sin HTTP 500.

## 10. Tablas oficiales utilizadas

`sistemas`, `validaciones`, `observaciones`, `infraestructura`, `arquitectura`, `seguridad`, `integraciones`, `evidencias`, `auditoria`, `usuarios`, `roles`/`usuarios_roles` (lectura vía nombres), `catalogos`.

## 11. Tablas legacy evitadas en el flujo activo

`sistemas_informaticos`, `validaciones_tecnicas`, `arquitecturas_software`, `infraestructura_tecnologica`, `seguridad_sistemas`, `evidencias_tecnicas`.

No se eliminaron.

## 12. Inventario

- Fuente: `sistemas` vía `DirectorSistemaRepository.findAllActivos()` (soft-delete)
- Un registro por `sistemas.id`
- Filtros: nombre/búsqueda, código, área, estado, criticidad
- KPI “pendientes” (compat `legacy` en JSON)

## 13. Detalle consolidado

`GET /api/auditor/inventario/{sistemaId}` agrega datos oficiales relacionados por el mismo `sistema_id`.

## 14. Historial de auditoría

Lee tabla oficial `auditoria` (entidad admin). No escribe en consultas GET. Filtros: texto, módulo, acción, usuario, sistema, IP, fechas.

## 15. Observaciones

Clasificación de origen por prefijos en `descripcion`: `[VALIDACION]`, `[INFRAESTRUCTURA]`, `[FUNCIONAL]`. Solo lectura.

## 16. Validaciones

Incluidas en detalle y reportes vía `validaciones.sistema_id`.

## 17. Infraestructura

Incluida en detalle/reportes vía tabla `infraestructura` oficial.

## 18. Reportes

Cálculos reales: totales, por estado/criticidad/área, observaciones, actividad, top sistemas, resultados validación/infra. Sin números estáticos.

## 19. Exportaciones

Excel/CSV y PDF del frontend conservados; exportan datos cargados desde API (sin mocks).

## 20–24. Integraciones

| Módulo | Integración |
|---|---|
| Desarrollador | Lectura de sistema, responsables, estado, observaciones/subsanaciones |
| Validación | Lectura validaciones/observaciones/estados |
| Infraestructura | Lectura evaluación/capacidad/evidencias/obs |
| Director | Mismo `sistemas.id` y repos/entidades Director (deuda: dependencia de paquete `director`) |
| Administrador | Nombres de usuario; `AuditoriaEntity` compartida; sin password_hash |

## 25. Solo lectura

- Sin POST de registro de eventos en Auditor
- Sin editar/eliminar sistemas, observaciones, validaciones, auditorías
- UI mantiene aviso “Solo lectura”

## 26. Pruebas

- Previas: 54
- Nuevas Auditor: 27 (`AuditorServicesTest` 18 + `AuditorControllersTest` 9)
- **Total: 81** — Failures 0 — Errors 0

Cobertura: inventario vacío/con datos, filtros estado/criticidad/área, detalle 200/404, consolidado, auditoría vacía/con datos, filtros usuario/acción/sistema, reportes vacíos/con conteos, observaciones por prefijo, JSON FE, sin CORS header, sin `save()`.

## 27. Resultado de compilación

`./mvnw clean test` → **BUILD SUCCESS**
`./mvnw -DskipTests compile` → **BUILD SUCCESS**

## 28. Estado de Docker

| Contenedor | Estado |
|---|---|
| `diagti_postgres` | Up (healthy) |
| `diagti_backend` | Up |
| `diagti_frontend` | Up (nginx reload aplicado) |

## 29. Endpoints verificados (curl)

| Endpoint | HTTP |
|---|---|
| `/auth/health` | 200 |
| `/api/auditor/inventario` | 200 (`[]`) |
| `/api/auditor/auditoria` GET/POST | 200 |
| `/api/auditor/reportes/resumen` | 200 (ceros) |
| `/api/auditor/inventario/999999` | 404 |
| `http://localhost/api/auditor/inventario` (Nginx) | 200 |
| `/api/director/dashboard/kpis` | 200 |
| `/api/infraestructura/dashboard` | 200 |
| `/api/validacion/pendientes` | 200 |

## 30. SQL preparado y no ejecutado

Archivo: `DataBase/test-data-auditor.sql`

- Idempotente (`INSERT ... SELECT ... WHERE NOT EXISTS`)
- Códigos: `SYS-AUD-PEND`, `SYS-AUD-OBS`, `SYS-AUD-OK`
- Validaciones, observaciones con prefijos, infraestructura, evidencias, auditoría con `direccion_ip`
- IDs por `username` / `codigo_unico` (sin IDs fijos)

**No ejecutado** en esta tarea.

## 31. Funcional fuera del alcance

Sin cambios en frontend/backend/rutas/tablas exclusivas de Funcional.

## 32. Seguridad y LDAP pendientes

Sin Spring Security adicional, sin LDAP, sin cambios de login/roles/credenciales.

## 33. Riesgo pendiente `ddl-auto=update`

Persiste. Logs muestran `ALTER TABLE ... TEXT`.
Cambio aditivo documentado: `AuditoriaEntity.userAgent` / `sesionId` (columnas ya existentes en DDL oficial).

Deuda: `sistemas.model.Sistema` sigue mapeando `sistemas` (no usada por Auditor activo).

## 34. Dependencias técnicas pendientes

1. Extraer capa shared para no depender del paquete `director`
2. Unificar/eliminar `sistemas.model.Sistema` dual
3. Seguridad real (401/403)
4. Migrar de `ddl-auto=update` a migraciones controladas
5. Ejecutar `test-data-auditor.sql` solo cuando se requiera demo con datos

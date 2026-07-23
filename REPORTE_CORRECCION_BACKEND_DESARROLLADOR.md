# REPORTE — Corrección Backend Módulo Desarrollador

**Rama:** `feature/estabilizacion-diagti`
**Fecha:** 22 de julio de 2026
**Alcance:** Integración del módulo desarrollador con tablas oficiales y frontend Luis Lara (`frontend/pages/desarrollo`).

---

## 1. Problemas encontrados

| # | Problema |
|---|----------|
| P1 | Frontend Luis Lara (dashboard / mis-sistemas / observaciones) usaba **solo `localStorage`** y datos mock; no consumía API. |
| P2 | Backend desarrollador persistía en tablas **paralelas** (`sistemas_informaticos`, `validaciones_tecnicas`, etc.) mientras director/auditor/admin usan `sistemas` / `validaciones` / `observaciones`. |
| P3 | Entidad `IntegracionEntity` (desarrollador) mapeaba a `integraciones` con esquema incompatible (ya había columnas mezcladas por `ddl-auto=update`). |
| P4 | `ValidacionMapper` advertía propiedad no mapeada `sistema`. |
| P5 | Dashboard/Mis Sistemas resolvían usuario hardcodeado (`desarrollador1` / `Carlos Rojas`). |
| P6 | Tabla `sistemas` vacía en el volumen actual (seed de `init.sql` no se reejecutó). |
| P7 | `DiagtiApiApplicationTests` fallaba fuera de Docker al usar host `postgres`. |

---

## 2. Causa de cada problema

| # | Causa |
|---|-------|
| P1 | Sustitución del frontend por la rama `frontend/LuisLara` con prototipo local. |
| P2 | Modelo JPA propio del módulo desarrollador creado en paralelo al esquema oficial de `DataBase/`. |
| P3 | Dos entidades JPA distintas sobre la misma tabla `integraciones` con columnas diferentes + `ddl-auto=update`. |
| P4 | DTO sí tenía `sistemaId`, pero el mapper ignoraba la relación `sistema` sin `@Mapping(ignore=true)`. |
| P5 | Servicios legacy sin resolución de sesión/`username`. |
| P6 | Volumen PostgreSQL preexistente; bloque `IF NOT EXISTS (SELECT 1 FROM usuarios)` impidió seed completo. |
| P7 | `application.properties` principal apunta a hostname Docker `postgres`. |

---

## 3. Archivos modificados / creados

### Backend (nuevos)

- `desarrollador/support/EstadoFlujoNormalizer.java`
- `desarrollador/support/DesarrolladorUsuarioResolver.java`
- `desarrollador/dto/frontend/SistemaFrontendDTO.java`
- `desarrollador/service/DesarrolladorInventarioService.java`
- `desarrollador/service/impl/DesarrolladorInventarioServiceImpl.java`
- `desarrollador/controller/DesarrolladorInventarioController.java`
- Tests: `DesarrolladorInventarioServiceTest`, `DesarrolladorInventarioControllerTest`, `DesarrolladorUsuarioResolverTest`
- `src/test/resources/application.properties` (PostgreSQL `localhost:5433`, `ddl-auto=none`)

### Backend (modificados)

- `desarrollador/entity/IntegracionEntity.java` → `@Table(integraciones_tecnicas)` (deja de tocar `integraciones` oficial)
- `desarrollador/mapper/ValidacionMapper.java` → mapeo `sistemaId` + ignore `sistema`
- `desarrollador/service/impl/DashboardDesarrolloServiceImpl.java` → tablas oficiales
- `desarrollador/service/impl/MisSistemasServiceImpl.java` → tablas oficiales
- `desarrollador/controller/DashboardDesarrolloController.java`
- `desarrollador/controller/MisSistemasController.java`
- `director/repository/DirectorSistemaRepository.java` → consultas por responsable técnico
- `director/repository/ObservacionRepository.java` → consultas por sistemas / estado

### Frontend (mínimo, contrato API)

- `frontend/pages/desarrollo/modules/js/api-desarrollo.js` (**nuevo**)
- `dashboard.js`, `mis-sistemas.js`, `observaciones.js`
- `dashboard.html`, `mis-sistemas.html`, `observaciones.html` (incluyen `api-desarrollo.js`)

### Documentación

- `REPORTE_CORRECCION_BACKEND_DESARROLLADOR.md` (este archivo)

**No se modificaron:** `.env`, `init.sql`, credenciales, pantallas antiguas eliminadas, `main`.

---

## 4. Endpoints corregidos o creados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/desarrollador/inventario?username=` | Listado sistemas del desarrollador (contrato frontend) |
| GET | `/api/desarrollador/inventario/{id}?username=` | Detalle con ownership |
| POST | `/api/desarrollador/inventario/{id}/enviar-validacion?username=` | `estado_flujo=ENVIADO` + fila en `validaciones` |
| POST | `/api/desarrollador/inventario/{id}/subsanar?username=` | Observaciones → ATENDIDA; sistema → SUBSANADO |
| GET | `/api/desarrollador/observaciones/conteo?username=` | pendientes / atendidas / total |
| GET | `/api/desarrollador/dashboard?username=` | KPIs desde tablas oficiales |
| GET | `/api/desarrollador/dashboard/sistemas?username=` | Listado formato frontend |
| GET | `/api/desarrollador/mis-sistemas?username=` | Listado (mismo contrato inventario) |

Endpoints legacy (`registrar-sistema`, `editar-sistema`, `subsanar` paralelo, etc.) **siguen existiendo** pero aún apuntan a tablas paralelas; no son usados por el frontend Luis Lara actual.

---

## 5. Tablas utilizadas (fuente compartida)

| Uso | Tabla oficial |
|-----|---------------|
| Sistemas del desarrollador | `sistemas` (`id_responsable_tecnico`) |
| Observaciones | `observaciones` |
| Envío a validación | `validaciones` |
| Catálogos (tipo/área/criticidad) | `catalogos` |
| Usuarios / roles | `usuarios`, `roles`, `usuarios_roles` |
| Auditoría de acciones | `auditoria` |

Tabla legacy redirigida: `integraciones_tecnicas` (antes chocaba con `integraciones`).

---

## 6. Relación del desarrollador con las demás áreas

```
Desarrollador ──escribe/consulta──► sistemas / validaciones / observaciones
Validación / Infra / Funcional ──mismas tablas──► mismo id_sistema
Director / Auditor / Admin ──leen──► mismos registros oficiales
```

- El desarrollador solo ve sistemas con `id_responsable_tecnico =` su `id_usuario`.
- Enviar a validación crea registro en `validaciones` con el mismo `id_sistema`.
- Observaciones de validación se muestran en el módulo desarrollo.
- Acciones relevantes se registran en `auditoria`.

---

## 7. Pruebas ejecutadas

```
cd backend
./mvnw clean test
./mvnw -DskipTests compile
```

Incluye:

1. Dashboard/listado sin sistemas
2. Listado con sistemas asignados
3. Sistema ajeno → 403
4. Sistema inexistente → 404
5. Conteo observaciones pendientes/atendidas
6. Envío a validación
7. Filtro solo observados
8. JSON frontend (`observaciones_validador`)
9. Rol no autorizado
10. `contextLoads` con PostgreSQL local

---

## 8. Resultados obtenidos

| Verificación | Resultado |
|--------------|-----------|
| `mvnw clean test` | **BUILD SUCCESS** — 13 tests, 0 fallos |
| `mvnw -DskipTests compile` | **BUILD SUCCESS** |
| `docker compose up -d --build` | Backend Up, sin `BeanDefinitionOverrideException` |
| `GET /auth/health` | **200** |
| Login `71234567` (desarrollo) | **200**, redirect dashboard desarrollo |
| `GET /api/desarrollador/inventario?username=71234567` | **200** `[]` (tabla `sistemas` vacía) |
| Página dashboard HTML | **200** |
| Arranque JPA | Creó `integraciones_tecnicas`; no se ejecutó `down -v` |

---

## 9. Problemas pendientes

1. **Tabla `sistemas` vacía:** el inventario del desarrollador responde `[]` hasta sembrar/asignar sistemas a `id_responsable_tecnico = 4` (usuario `71234567`).
2. **Servicios legacy** (`RegistrarSistema`, `EditarSistema`, `SubsanarObservaciones` antiguos) aún usan tablas paralelas; hay que migrarlos o deprecarlos en una siguiente iteración.
3. **`ddl-auto=update` en `.env`** sigue activo (no se modificó `.env`); puede seguir alterando esquema. Ideal futuro: `validate`/`none` + migraciones Flyway.
4. **Tabla `integraciones` ya contaminada** históricamente con columnas duales; requiere migración limpia futura (no destructiva en esta tarea).
5. **Catálogos vacíos:** tipología/área/criticidad salen vacíos hasta cargar `catalogos`.
6. **Seguridad API:** sigue `permitAll` en gran parte; el filtrado por username es defensa en profundidad, no JWT.
7. **Frontend:** el modal completo de edición local aún no persiste todos los campos técnicos en tablas oficiales de arquitectura/infra/seguridad.

---

## 10. Cambios que podrían requerir migración futura

- ETL de `sistemas_informaticos` → `sistemas` (si hubiera datos productivos en paralelo).
- Limpieza de columnas huérfanas en `integraciones`.
- Unificación definitiva de entidades JPA en un paquete `shared`/`domain`.
- Desactivar entidades paralelas y pasar `ddl-auto` a `validate`.
- Autenticación por token/sesión servidor en lugar de `username` query param.

---

## Comandos manuales de prueba

```powershell
# Login desarrollador
$body = '{"username":"71234567","password":"admin123"}'
Invoke-RestMethod -Method POST -Uri http://localhost/auth/login -ContentType 'application/json' -Body $body

# Inventario
Invoke-RestMethod -Uri 'http://localhost/api/desarrollador/inventario?username=71234567'

# Dashboard KPIs
Invoke-RestMethod -Uri 'http://localhost/api/desarrollador/dashboard?username=71234567'

# UI
# http://localhost/pages/login/html/login.html
# http://localhost/pages/desarrollo/modules/html/dashboard.html
```

**Nota:** Para ver datos reales en UI hace falta autorizar un INSERT no destructivo de sistemas de prueba (equivalentes a `init.sql`) asignados al usuario `71234567`.

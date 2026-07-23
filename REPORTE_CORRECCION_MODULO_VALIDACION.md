# REPORTE — Corrección Módulo Validación

**Rama:** `feature/estabilizacion-diagti`
**Fecha:** 22 de julio de 2026
**Alcance:** Integrar Validación con Desarrollador y tablas oficiales compartidas.

---

## 1. Situación inicial

- Frontend en `frontend/pages/validacion` con lecturas parciales a `/api/validacion/*` y **acciones Aprobar/Observar mockeadas**.
- Backend `validador` existía sobre tabla oficial `validaciones`, pero incompleto: no registraba observaciones oficiales, no actualizaba `sistemas.estado_flujo` de forma coherente, y devolvía entidades crudas en detalle.
- Desarrollador ya enviaba a validación sobre `validaciones` oficiales, pero `subsanar` cerraba observaciones como `ATENDIDA` sin pasar por revisión del validador.
- Tabla `sistemas` podía estar vacía en el volumen actual.

## 2. Problemas encontrados

1. Aprobar/Observar en UI no persistían.
2. Observaciones del frontend iban a `/api/observaciones` (sin backend real) o `localStorage`.
3. No había flujo de aprobación/rechazo de subsanación.
4. Validación activa duplicable al reenviar.
5. Esquema `observaciones` sin columna `area` (hay que codificar área sin inventar columnas).
6. `ValidacionMapper` (desarrollador) tenía unmapped `sistema` (ya corregido en fase anterior).
7. Entidad `Validacion` del validador sin nombre JPA único.

## 3. Causas

- Prototipo frontend con `setTimeout` y mocks.
- API incompleta respecto al contrato UI.
- Subsanación del desarrollador cerraba observaciones prematuramente.
- Ausencia de estados intermedios (`EN_REVISION`).

## 4. Archivos modificados / creados

### Backend nuevos
- `validador/support/ValidacionEstados.java`
- `validador/dto/SistemaValidacionDTO.java`
- `validador/dto/ObservacionValidacionDTO.java`
- `validador/dto/ObservacionRequestDTO.java`
- `validador/dto/DecisionValidacionRequestDTO.java`
- `validador/controller/ObservacionesCompatController.java`
- `validador/service/ValidadorServiceImpl.java` (reescrito)
- Tests: `ValidadorServiceImplTest.java`

### Backend modificados
- `validador/controller/ValidadorController.java`
- `validador/service/ValidadorService.java`
- `validador/entity/Validacion.java` → `@Entity(name="ValidadorValidacion")`
- `validador/repository/ValidadorValidacionRepository.java`
- `validador/dto/ValidadorDTO.java` (+ `area`)
- `desarrollador/.../DesarrolladorInventarioServiceImpl.java` (anti-duplicado + subsanar → `EN_REVISION`)

### Frontend (mínimo)
- `validacion/.../js/validar-desarrollo.js` (POST real validar/observar)
- `validacion/.../js/pendientes.js` (sin mock como fallback principal)
- `validacion/.../js/registrar-observacion.js` (payload alineado)

### Datos / docs
- `DataBase/test-data-validacion.sql` (**preparado, no ejecutado**)
- `REPORTE_CORRECCION_MODULO_VALIDACION.md`

## 5. Tablas oficiales utilizadas

`sistemas`, `validaciones`, `observaciones`, `auditoria`, `usuarios`, `catalogos`

## 6. Tablas legacy detectadas (no usadas en flujo activo)

`sistemas_informaticos`, `validaciones_tecnicas`, `arquitecturas_software`, `infraestructura_tecnologica`, `seguridad_sistemas`, `evidencias_tecnicas`, `integraciones_tecnicas`

## 7. Endpoints funcionales

| Método | Ruta |
|--------|------|
| GET | `/api/validacion/pendientes` |
| GET | `/api/validacion/subsanacion` / `/observados` |
| GET | `/api/validacion/validados` |
| GET | `/api/validacion/estadisticas` |
| GET | `/api/validacion/sistema/{id}` |
| POST | `/api/validacion/validar` |
| POST | `/api/validacion/observar` |
| POST | `/api/validacion/rechazar` |
| POST | `/api/validacion/observaciones` |
| GET | `/api/validacion/sistema/{id}/observaciones` |
| POST | `/api/validacion/observaciones/{id}/aprobar-subsanacion` |
| POST | `/api/validacion/observaciones/{id}/rechazar-subsanacion` |
| POST | `/api/observaciones` (compat frontend) |

## 8. Contratos JSON (resumen)

**Pendiente:** `{ idSistema, nombreSistema, area, estadoValidacion, fechaCreacion, ... }`
**Detalle:** `{ idSistema, codigo, nombreSistema, nombre, responsableTecnico, estado, estadoValidacion, observaciones[], ... }`
**Observación request:** `{ idSistema|sistemaId, area, titulo, descripcion|detalle, username }`
**Decisión:** `{ idSistema, comentario|observacionGeneral, username }`

## 9. Flujo Desarrollador → Validación

1. Desarrollador `POST .../enviar-validacion` → `sistemas.estado_flujo=ENVIADO` + `validaciones.PENDIENTE` (reutiliza activa si existe).
2. Validación lista pendientes oficiales.
3. Observar / registrar observación → `observaciones` + sistema `OBSERVADO`.
4. Desarrollador `subsanar` → observación `EN_REVISION` (no se elimina) + sistema `SUBSANADO`.
5. Validación aprueba/rechaza subsanación.
6. Validar sistema solo si no quedan observaciones abiertas → `VALIDADO`.

## 10–14. Integración con otros módulos

| Módulo | Integración |
|--------|-------------|
| Infraestructura / Funcional | Observaciones con prefijo `[INFRAESTRUCTURA]` / `[FUNCIONAL]` en `descripcion` (sin columna area) |
| Director / Auditor | Leen mismas tablas `sistemas` / `validaciones` / `observaciones` |
| Administrador | Sin cambios de usuarios/roles; FKs a `usuarios` intactas |

## 15. Estados y transiciones

**Sistema:** `BORRADOR → ENVIADO → OBSERVADO → SUBSANADO → VALIDADO` (o `RECHAZADO`)
**Validación:** `PENDIENTE ↔ OBSERVADO ↔ SUBSANADO → VALIDADO|RECHAZADO`
**Observación:** `PENDIENTE → EN_REVISION → ATENDIDA` (o vuelta a `PENDIENTE` si rechazo)

## 16. Auditoría

Acciones registradas en `auditoria` (best-effort, no revierte operación principal).

## 17–18. Pruebas y resultados

```
cd backend
./mvnw clean test     → BUILD SUCCESS (24 tests)
./mvnw -DskipTests compile → BUILD SUCCESS
```

## 19. Docker

Requiere `docker compose up -d --build` tras estos cambios. No se ejecutó `down -v`.

## 20. SQL de prueba (NO ejecutado)

Archivo: `DataBase/test-data-validacion.sql`
Inserta idempotente `SYS-VAL-001` para usuario `71234567`, validación pendiente, observaciones Validación/Infra/Funcional + una ATENDIDA + auditoría.

## 21. Riesgos pendientes

- `sistemas` puede seguir vacía hasta ejecutar el SQL de prueba (autorización requerida).
- `ddl-auto=update` sigue en `.env` (no modificado): riesgo de alteraciones Hibernate.
- Historial UI y `validar-informacion.js` aún tienen mocks parciales.
- Servicios legacy desarrollador (registrar/editar paralelos) pendientes.
- Columna `area` no existe: se usa prefijo en `descripcion`.
- Seguridad/JWT pendiente para otra fase.

## 22. Seguridad pendiente

No se implementó Spring Security adicional, LDAP ni cambios de login/roles.

## 23. Servicios legacy pendientes

- `desarrollador` registrar/editar/subsanar antiguos sobre tablas paralelas.
- `panel-validacion.js` / `detalle-sistema.js` huérfanos.
- `historial.js` mock.

---

## Comandos manuales

```powershell
# Login desarrollador / auditor(validador de prueba)
$body='{"username":"71234567","password":"admin123"}'
Invoke-RestMethod -Method POST -Uri http://localhost/auth/login -ContentType application/json -Body $body

# Pendientes validación
Invoke-RestMethod http://localhost/api/validacion/pendientes
Invoke-RestMethod http://localhost/api/validacion/estadisticas

# UI
# http://localhost/pages/validacion/modules/html/dashboard.html
# http://localhost/pages/validacion/modules/html/pendientes.html
```

**Para cargar datos de prueba (solo tras autorización explícita):**

```powershell
Get-Content DataBase/test-data-validacion.sql | docker exec -i diagti_postgres psql -U postgres -d diagti_db
```

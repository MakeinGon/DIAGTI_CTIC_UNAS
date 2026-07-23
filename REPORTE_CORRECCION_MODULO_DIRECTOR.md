# REPORTE · Corrección módulo Director / Directivo

**Rama:** `feature/estabilizacion-diagti`
**Fecha:** 22 de julio de 2026
**Alcance:** conectar frontend ↔ backend del módulo Director sobre tablas oficiales, integrando lectura con Desarrollador, Validación e Infraestructura.
**Fuera de alcance:** módulo Funcional, seguridad/LDAP/login, commits/push.

---

## 1. Situación inicial

El módulo Director ya existía con 3 pantallas (`resumen-ejecutivo`, `dashboard-riesgos`, `reportes-ejecutivos`) y 3 controladores backend (`Dashboard`, `Riesgos`, `Reportes`) sobre entidades del paquete `director` mapeadas a tablas oficiales (`sistemas`, `validaciones`, `observaciones`, etc.).

Problemas principales:

- `@CrossOrigin(origins = "*")` en controladores Director (riesgo de reintroducir el fallo CORS corregido en Infraestructura).
- Frontend hardcodeaba `http://localhost:8080`, saltándose Nginx.
- Catálogo de áreas usaba `AREA_USUARIA` (incorrecto); el seed oficial usa `AREA_USUARIO`.
- Catálogo de estados de validación apuntaba a `ESTADO_LEVANTAMIENTO` (no sembrado).
- KPIs/criticidades desalineados con Alta/Media/Baja oficiales.
- NPE potencial en `SistemaEntity.getEstadoValidacion()` con fechas nulas.
- Riesgos con IDs `UUID` inestables y múltiples filas por sistema.
- Sin inventario consolidado ni detalle por `sistema_id`.
- Sin pruebas unitarias del módulo Director.
- Login redirige a `pages/directivo/...` (ruta inexistente); no se modificó autenticación en esta tarea.

---

## 2. Problemas encontrados

| # | Problema | Impacto |
|---|----------|---------|
| 1 | CORS redundante en Director | Riesgo HTTP 400 / CORS en navegador |
| 2 | API absoluta `:8080` en JS | Incompatibilidad con `http://localhost` (Nginx) |
| 3 | Tipo catálogo `AREA_USUARIA` | Filtros de área vacíos |
| 4 | Criticidad UI académica/financiera vs BD Alta/Media/Baja | Gráfico vacío/incorrecto |
| 5 | NPE en comparación de fechas de validación | HTTP 500 intermitente |
| 6 | Soft-delete no filtrado (`fecha_eliminacion`) | Conteos inflados |
| 7 | Filtros slug vs texto con tildes | Filtros sin efecto |
| 8 | Campos inventados (`estadoOperativo=Activo`, `tipo=No especificado`) | Datos no oficiales |
| 9 | Sin endpoint de detalle consolidado | UI limitada a modal local |
| 10 | Riesgos duplicados por sistema | Listas confusas |
| 11 | Observaciones por prefijo no consolidadas | Dashboard incompleto |
| 12 | Redirect login `directivo/` | Entrada rota (pendiente; no se tocó auth) |

---

## 3. Archivos modificados / creados

### Backend (principales)

- Controllers: `DashboardController`, `RiesgosController`, `ReportesController`, **nuevo** `InventarioDirectorController`
- Services: `DashboardService(+Impl)`, `RiesgosServiceImpl`, `ReportesServiceImpl`, **nuevo** `DirectorInventarioService(+Impl)`
- Mappers: `SistemaMapper`, `RiesgoMapper`
- Entity: `SistemaEntity` (NPE-safe)
- Repository: `DirectorSistemaRepository` (`findAllActivos`)
- Support: `DirectorTexto`, `DirectorEstados`, `DirectorCatalogHelper`
- DTOs nuevos: `SistemaInventarioDTO`, `SistemaDetalleDirectorDTO`, `ObservacionConsolidadaDTO`, `ActividadRecienteDTO`; KPI ampliado

### Frontend

- `frontend/pages/director/modules/js/api-director.js` (nuevo)
- `resumen-ejecutivo.component.{js,html}`
- `dashboard-riesgos.component.{js,html}`
- `reportes-ejecutivos.component.{js,html}`

### Pruebas / datos / informe

- Tests bajo `backend/src/test/.../director/**`
- `DataBase/test-data-director.sql` (**no ejecutado**)
- Este informe

---

## 4. Conexión frontend–backend

| Pantalla | Archivo JS | Endpoint | Método | Backend | Estado |
|----------|------------|----------|--------|---------|--------|
| Dashboard Ejecutivo | `resumen-ejecutivo.component.js` | `/api/director/dashboard/kpis` | GET | Sí | Conectado |
| Dashboard Ejecutivo | idem | `/api/director/dashboard/resumen-validacion` | GET | Sí | Conectado |
| Dashboard Ejecutivo | idem | `/api/director/dashboard/criticidades` | GET | Sí | Conectado |
| Dashboard Ejecutivo | idem | `/api/director/dashboard/sistemas` | GET | Sí | Conectado |
| Dashboard Ejecutivo | idem | `/api/director/inventario/{id}` | GET | Sí | Detalle consolidado |
| Riesgos | `dashboard-riesgos.component.js` | `/api/director/riesgos` | GET | Sí | Conectado |
| Reportes | `reportes-ejecutivos.component.js` | `/api/director/reportes/inventario` | GET | Sí | Conectado |
| Reportes | idem | `/api/director/reportes/riesgos` | GET | Sí | Conectado |
| Reportes | idem | `/api/director/reportes/validacion` | GET | Sí | Conectado |
| Filtros | todas | `/api/director/reportes/catalogos/*` | GET | Sí | Conectado |

Fuente de verdad: PostgreSQL vía API.
`localStorage` solo para sesión (`diagti_session`) y limpieza al logout.

---

## 5. Endpoints

### Existentes reforzados

- `GET /api/director/dashboard/kpis`
- `GET /api/director/dashboard/resumen-validacion`
- `GET /api/director/dashboard/criticidades`
- `GET /api/director/dashboard/sistemas`
- `GET /api/director/riesgos`
- `GET /api/director/reportes/inventario|validacion|riesgos`
- `GET /api/director/reportes/catalogos/{areas,criticidades,tipos,riesgos,estados-validacion}`

### Nuevos

- `GET /api/director/dashboard/actividad-reciente`
- `GET /api/director/dashboard/observaciones?origen&estado`
- `GET /api/director/inventario`
- `GET /api/director/inventario/{sistemaId}` → 404 si no existe

Contratos: listas vacías (no null), fechas ISO-8601 cuando aplica, estados normalizados, sin entidades JPA circulares.

---

## 6. Contratos JSON (resumen)

**KPIs:** `totalSistemas`, `validados`, `observados`, `pendientes`, más campos extendidos (`enValidacion`, `observacionesPendientes`, `observacionesValidacion`, `observacionesInfraestructura`, `sistemasConRiesgo`, …).

**Sistema resumen:** `sistemaId`, `codigo`, `nombre`, `area`, `tipo`, `exposicion`, `validacion`, `criticidad`, `alerta`, `detalle`, `recomendacion`, `cantidadObservaciones`, `resultadoInfraestructura`.

**Inventario:** `sistemaId`, `codigo`, `nombre`, `descripcion`, `area`, `criticidad`, `estado`, responsables, `estadoValidacion`, `cantidadObservaciones`, `resultadoInfraestructura`, fechas ISO.

**Riesgo (1 por sistema):** `id=R-{sistemaId}`, `codigo`, `titulo`, `area`, `categoria`, `nivel` (`critico|advertencia|controlado`), `nivelTexto`, `estado`, `detectado`, etc.

---

## 7. Tablas oficiales utilizadas

`sistemas`, `validaciones`, `observaciones`, `infraestructura`, `arquitectura`, `seguridad`, `integraciones`, `evidencias`, `auditoria`, `usuarios`, `catalogos`.

---

## 8. Tablas legacy detectadas (no usadas en flujo activo Director)

`sistemas_informaticos`, `validaciones_tecnicas`, `arquitecturas_software`, `infraestructura_tecnologica`, `seguridad_sistemas`, `evidencias_tecnicas`.

No se eliminaron ni migraron de forma destructiva.

---

## 9. Integración con Desarrollador

Director lee el mismo `sistemas.id` / `codigo_unico` que Desarrollador. No modifica datos técnicos del desarrollador. Los cambios de `estado_flujo` realizados por Desarrollador/Validación se reflejan en KPIs e inventario.

---

## 10. Integración con Validación

Consulta `validaciones.sistema_id` y `observaciones` con prefijo `[VALIDACION]`. Usa estados oficiales del flujo. No usa `validaciones_tecnicas`.

---

## 11. Integración con Infraestructura

Lee `infraestructura` del mismo `sistema_id`, expone resultado/evaluación en resumen y detalle, y contabiliza observaciones `[INFRAESTRUCTURA]`. No crea una segunda evaluación.

---

## 12. Compatibilidad con Auditor

Comparte el mismo inventario oficial (`sistemas` + estados + observaciones + auditoría). No se refactorizó ampliamente el módulo Auditor; se preservó el modelo compartido vía entidades/repositorios `director`.

---

## 13. Compatibilidad con Administrador

No se modificó gestión de usuarios/roles/permisos. Los DTO Director no exponen `password_hash` ni credenciales.

---

## 14. Dashboard

Calcula totales reales, estados, criticidades Alta/Media/Baja, observaciones por estado/origen, sistemas con riesgo y actividad reciente desde `auditoria`. Base vacía → ceros y arrays vacíos (HTTP 200).

---

## 15. Riesgos — regla de cálculo

Un sistema aparece **una sola vez**. Se consolidan factores y se elige el de mayor severidad (`critico > advertencia > controlado`):

1. Observaciones abiertas (`PENDIENTE` / `EN_REVISION` / `RECHAZADA`), criticidad Alta eleva a crítico.
2. Estado/validación `OBSERVADO` o `RECHAZADO`.
3. Seguridad sin SSL/TLS **solo si existen** registros en `seguridad`.
4. Contrato no vigente (excepto borrador).
5. Legacy.
6. Borrador > 30 días.

ID estable: `R-{id_sistema}`. No se persiste riesgo en `localStorage`.

---

## 16. Reportes

Inventario, riesgos y validación consumen tablas oficiales. Filtros por área/criticidad/estado normalizados (slug-tolerant). Export PDF/Excel del frontend se mantienen (print + CSV) sobre filas reales visibles.

---

## 17. Pruebas

- Previas (Desarrollador/Validación/Infraestructura + contexto): mantenidas.
- Nuevas Director: dashboard vacío/con datos, conteos, inventario, detalle 404, riesgos, reportes, CORS/MockMvc, JSON frontend, observaciones por prefijo.
- Resultado: **Tests run: 54, Failures: 0, Errors: 0** → **BUILD SUCCESS**.

---

## 18. Resultado de compilación

```
./mvnw clean test          → BUILD SUCCESS (54 tests)
./mvnw -DskipTests compile → BUILD SUCCESS
```

---

## 19. Estado de Docker

| Servicio | Estado |
|----------|--------|
| `diagti_backend` | Up |
| `diagti_postgres` | Up (healthy) |
| `diagti_frontend` | Up (Nginx) |

Logs backend: arranque OK. Persisten `ALTER TABLE` por `ddl-auto=update` (riesgo documentado).

Endpoints verificados HTTP 200:

- `/auth/health`
- `/api/director/dashboard/*`, `/riesgos`, `/inventario`, `/reportes/*`
- `/api/validacion/pendientes`
- `/api/infraestructura/dashboard`, `/api/infraestructura/sistemas`

`GET /api/director/inventario/{idInexistente}` → HTTP 404.

---

## 20. SQL preparado y no ejecutado

Archivo: `DataBase/test-data-director.sql`

- Idempotente, tablas oficiales, IDs por `username`/`codigo_unico`.
- Prepara `SYS-DIR-PEND`, `SYS-DIR-OBS`, `SYS-DIR-OK` + validaciones, observaciones `[VALIDACION]`/`[INFRAESTRUCTURA]`, infraestructura, seguridad y auditoría.
- **No ejecutado** en esta tarea.

---

## 21. Módulo Funcional fuera del alcance

No se modificaron frontend, backend, tablas, servicios ni rutas del módulo Funcional. Director solo puede **contar** observaciones existentes con prefijo `[FUNCIONAL]` si ya existen; no las crea ni edita.

---

## 22. Seguridad pendiente

No se implementó seguridad, LDAP ni control 401/403. `/api/**` sigue abierto según configuración previa. Redirect de rol `directivo` hacia carpeta inexistente `directivo/` permanece pendiente (requeriría tocar autenticación).

---

## 23. Riesgo pendiente `ddl-auto=update`

Docker sigue usando Hibernate `ddl-auto=update`. Los logs muestran múltiples `ALTER TABLE` sobre tablas oficiales y legacy. No se modificó `.env`. Riesgo: drift de esquema no controlado por migraciones Flyway (deshabilitado).

---

## 24. Dependencias técnicas pendientes

1. Entidades/repositorios del paquete `director` siguen siendo hub compartido por Validación/Infraestructura/Desarrollador (no se creó paquete `shared`).
2. Redirect login `directivo/` → debe corregirse en Auth cuando se autorice tocar login.
3. Pantallas documentadas Obsolescencia/Roadmap no existen en el FE real; no se inventaron.
4. Export server-side PDF/Excel no existe; se conserva print/CSV del frontend.
5. Consolidación futura a paquete compartido de entidades oficiales recomendada, no bloqueante hoy.

---

## Matriz final FE ↔ BE

| Pantalla | JS | Endpoint esperado | Método | Response esperada | Backend | Estado |
|----------|----|-------------------|--------|-------------------|---------|--------|
| Ejecutivo | resumen-ejecutivo | `/api/director/dashboard/kpis` | GET | KPI reales | Sí | OK |
| Ejecutivo | resumen-ejecutivo | `/api/director/dashboard/sistemas` | GET | lista DTO | Sí | OK |
| Ejecutivo | resumen-ejecutivo | `/api/director/inventario/{id}` | GET | detalle consolidado | Sí | OK |
| Riesgos | dashboard-riesgos | `/api/director/riesgos` | GET | 1 riesgo/sistema | Sí | OK |
| Reportes | reportes-ejecutivos | `/api/director/reportes/*` | GET | inventarios/riesgos/validación | Sí | OK |

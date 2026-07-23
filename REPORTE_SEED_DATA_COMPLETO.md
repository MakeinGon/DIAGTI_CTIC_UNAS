# REPORTE · Seed de datos completo DIAGTI

**Archivo SQL:** `DataBase/seed-data-completo.sql`
**Rama de referencia:** `feature/estabilizacion-diagti`
**Commit de contexto:** `773fc32`
**Backup previo:** `Backups/diagti_before_seed_20260722_222042.dump`
**Estado:** script corregido — **seed definitivo no ejecutado** · **sin commit ni push**

---

## 0. Resultado de la primera prueba (ROLLBACK)

La primera prueba con `ROLLBACK` **terminó en ERROR** y **no guardó filas**.

Causa confirmada en la base actual (Hibernate `ddl-auto=update`):

| Hallazgo | Detalle |
|----------|---------|
| `sistemas.id_sistema` | `bigint` PK, default `nextval('sistemas_id_sistema_seq')` |
| `sistemas.id` | `bigint NOT NULL` **sin default** (columna heredada JPA) |
| Columnas heredadas nullable | `codigo`, `estado`, `area_usuaria`, `tipo_aplicativo` |
| `integraciones` | mezcla modelo oficial (`id_integracion`, origen/destino → `sistemas.id_sistema`) y modelo JPA (`id`, `sistema_id` → `sistemas_informaticos.id`) |

Por eso un `INSERT` solo con columnas oficiales fallaba al no rellenar `sistemas.id`, y sembrar `integraciones` usando `sistemas.id_sistema` como `sistema_id` **no es válido**.

**No se modificó el esquema** (sin `ALTER` / `DROP` / `TRUNCATE` / `DELETE`).

---

## 1. Datos preparados

| Dominio | Contenido |
|--------|-----------|
| Roles | `admin`, `auditor`, `desarrollo`, `directivo`, `infraestructura`, `validacion` |
| Usuarios | Auditor `74331380`, Desarrollador `71234567`, Directivo `72345678`, Infraestructura `74567890`, Validador `75678901` |
| Admin | Usuario existente (p. ej. `76551691`) **conservado**; solo se asegura vínculo a rol `admin` |
| Catálogos | `TIPO_APLICATIVO` (WEB, DESKTOP, MOVIL, CLOUD), `CRITICIDAD` (ALTO, MEDIO, BAJO), `AREA_USUARIO` (ADMIN, ACAD, INV, FIN) |
| Sistemas | `SYS-001` … `SYS-005` con `id_sistema` = `id` = mismo `nextval` |
| Validaciones | Una por sistema si no existe, alineada a `estado_flujo` |
| Observaciones | Prefijos `[VALIDACION]` e `[INFRAESTRUCTURA]` en `SYS-002` y `SYS-003` |
| Técnico | Infraestructura, seguridad, arquitectura, evidencias mínimas |
| Integraciones | **Omitidas** (conflicto de modelos / FK a `sistemas_informaticos`) |
| Auditoría | Eventos idempotentes por módulo/acción/descripción |

Contraseñas de **usuarios nuevos**: texto plano `admin123` (compatible con el login temporal actual).
**No se modifican** `password_hash` de usuarios ya existentes.

---

## 2. Tablas afectadas

| Tabla | Operación |
|-------|-----------|
| `roles` | INSERT si falta por `nombre` |
| `usuarios` | INSERT si falta por `username` |
| `usuarios_roles` | INSERT si falta par usuario–rol |
| `catalogos` | INSERT si falta `tipo_catalogo` + `codigo` |
| `sistemas` | INSERT con `id_sistema` e `id` = mismo `nextval` si falta `codigo_unico` |
| `validaciones` | INSERT si el sistema no tiene validación |
| `observaciones` | INSERT si no existe misma descripción+estado en el sistema |
| `infraestructura` | INSERT si el sistema no tiene fila |
| `seguridad` | INSERT si el sistema no tiene fila |
| `arquitectura` | INSERT si el sistema no tiene fila |
| `evidencias` | INSERT si no existe mismo `nombre_archivo` en el sistema |
| `auditoria` | INSERT si no existe misma descripción de seed |
| `integraciones` | **Sin INSERT** (omitida de forma segura) |

**No tocadas:** `permisos`, `sistemas_informaticos`, tablas `*_tecnicas`, esquema DDL.

---

## 3. Corrección de sistemas (`id_sistema` e `id`)

Para cada `SYS-001` … `SYS-005`:

1. Comprobar que no exista por `codigo_unico`.
2. Llamar **una sola vez** a `nextval('sistemas_id_sistema_seq')` solo si falta.
3. Insertar ese valor en **`id_sistema` e `id`**.
4. Rellenar también `codigo`, `estado`, `area_usuaria`, `tipo_aplicativo` (heredadas).
5. Resolver catálogos por `tipo_catalogo` + `codigo` y técnico por `username`.
6. **No** consumir secuencia si el sistema ya existe.
7. **No** usar números fijos.

Patrón: `WITH nuevo_id AS (SELECT nextval(...) WHERE NOT EXISTS (...)) INSERT ... SELECT nuevo_id.valor, nuevo_id.valor, ...`.

| Código | Nombre | Área | Tipo | Criticidad | Técnico | Flujo / estado | Riesgo |
|--------|--------|------|------|------------|---------|----------------|--------|
| SYS-001 | Sistema Académico | ACAD | WEB | MEDIO | 71234567 | VALIDADO | MEDIO |
| SYS-002 | Trámite Documentario | ADMIN | WEB | ALTO | 71234567 | OBSERVADO | ALTO |
| SYS-003 | Sistema de Biblioteca | INV | WEB | ALTO | NULL | OBSERVADO | CRITICO |
| SYS-004 | Recursos Humanos | ADMIN | WEB | BAJO | 71234567 | VALIDADO | BAJO |
| SYS-005 | Sistema Financiero | FIN | WEB | ALTO | 71234567 | ENVIADO | ALTO |

`id_responsable_funcional` = **NULL** (Funcional fuera de alcance).

Área financiera: catálogo existente `AREA_USUARIO` / `FIN` (sin quinta área).

---

## 4. Integraciones omitidas

Motivo: la tabla mezcla dos modelos. La columna `sistema_id` referencia `sistemas_informaticos.id`, no `sistemas.id_sistema`.

- No se inserta en `integraciones`.
- No se inserta en `sistemas_informaticos`.
- No se inventan valores para `sistema_id`.
- No se elimina ni modifica la tabla.
- Compatible con `init.sql` original (tampoco sembraba integraciones).

---

## 5. Validaciones, observaciones y resto (conservado)

### Validaciones (hasta 5)

| Sistema | estado_validacion | resultado |
|---------|-------------------|-----------|
| SYS-001 | VALIDADO | VALIDADO |
| SYS-002 | OBSERVADO | OBSERVADO |
| SYS-003 | OBSERVADO | OBSERVADO |
| SYS-004 | VALIDADO | VALIDADO |
| SYS-005 | PENDIENTE | PENDIENTE |

Validador: `75678901`.

### Observaciones (hasta 4)

- SYS-002: `[VALIDACION] Documentación — …`, `[INFRAESTRUCTURA] Capacidad — …`
- SYS-003: `[VALIDACION] Seguridad — …`, `[INFRAESTRUCTURA] Continuidad — …`

### Relacionados (mínimos)

- Infraestructura: SYS-001, SYS-002, SYS-003
- Seguridad: SYS-001, SYS-004
- Arquitectura: SYS-001, SYS-003
- Evidencias: `acta_sys_001.pdf`, `manual_sys_002.pdf`
- Auditoría: hasta 6 eventos de seed

---

## 6. Relaciones utilizadas

| Relación | Resolución |
|----------|------------|
| Usuario ↔ Rol | `usuarios.username` + `roles.nombre` |
| Sistema ↔ Catálogo | `catalogos.tipo_catalogo` + `catalogos.codigo` |
| Sistema ↔ Técnico | `usuarios.username = '71234567'` |
| `sistemas.id_sistema` / `sistemas.id` | mismo `nextval('sistemas_id_sistema_seq')` |
| Validación ↔ Sistema | `sistemas.codigo_unico` |
| Validación ↔ Validador | `usuarios.username = '75678901'` |
| Observación ↔ Sistema/Validación | `codigo_unico` + `validaciones.id_sistema` |
| Auditoría ↔ Usuario | `usuarios.username` |

---

## 7. Decisiones tomadas

1. Idempotencia por fila (no por “tabla vacía”).
2. Coexistencia Hibernate: `id_sistema` e `id` sincronizados con un solo `nextval`.
3. Columnas heredadas `codigo` / `estado` / `area_usuaria` / `tipo_aplicativo` rellenadas.
4. Integraciones omitidas hasta consolidar esquema.
5. Estados alineados a `ValidacionEstados`.
6. Funcional fuera de alcance.
7. Password solo en INSERT de usuarios nuevos.
8. Transacción `BEGIN` … `COMMIT`; SELECT de verificación al final.
9. Archivo SQL en **UTF-8 sin BOM**.
10. **Esquema no modificado**; **seed definitivo no ejecutado**; **sin commit ni push**.

---

## 8. Datos omitidos

| Omitido | Motivo |
|---------|--------|
| Rol / usuario `funcional` | Fuera de alcance |
| Observaciones `[FUNCIONAL]` | Fuera de alcance |
| INSERT en `integraciones` | FK `sistema_id` → `sistemas_informaticos.id` |
| Datos en `sistemas_informaticos` | No sembrar modelo paralelo |
| Usuario admin nuevo | Conservar el existente |
| Cambios de esquema | Prohibido en este seed |

---

## 9. Consultas de verificación

Al final de `DataBase/seed-data-completo.sql`:

- Conteos (incluye `integraciones` solo como lectura del estado actual)
- Usuarios y roles
- Sistemas y responsables
- Sistemas y catálogos
- Validaciones por sistema
- Observaciones por sistema (`SYS-002`, `SYS-003`)

---

## 10. Instrucciones · prueba con ROLLBACK

```powershell
Get-Content "DataBase\seed-data-completo.sql" -Encoding UTF8 |
  ForEach-Object { $_ -replace '^COMMIT;','ROLLBACK;' } |
  docker exec -i diagti_postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

Sustituir usuario/base según `.env` (**no modificar** `.env`). Puerto host típico: **5433**.

Tras `ROLLBACK`, la base no debe conservar los INSERT de la prueba.

---

## 11. Instrucciones · ejecución definitiva

1. Confirmar backup: `Backups/diagti_before_seed_20260722_222042.dump`
2. Confirmar contenedor `diagti_postgres` activo
3. Ejecutar el SQL en UTF-8:

```powershell
Get-Content "DataBase\seed-data-completo.sql" -Raw -Encoding UTF8 |
  docker exec -i diagti_postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

4. Revisar SELECT finales
5. **No** ejecutar `DataBase/init.sql`
6. **No** usar `docker compose down -v`

---

## 12. Restauración con el backup existente

```powershell
docker cp "Backups/diagti_before_seed_20260722_222042.dump" diagti_postgres:/tmp/diagti_restore.dump

docker exec -it diagti_postgres pg_restore `
  -U <POSTGRES_USER> `
  -d <POSTGRES_DB> `
  --clean --if-exists `
  /tmp/diagti_restore.dump
```

---

## Resumen

Se corrigió `seed-data-completo.sql` tras el ERROR de la prueba ROLLBACK: los INSERT de `SYS-001`…`SYS-005` ahora asignan el mismo `nextval` a `id_sistema` e `id`, rellenan columnas heredadas y no consumen secuencia si el código ya existe. La siembra de `integraciones` quedó omitida por el conflicto con `sistemas_informaticos`. El esquema no se alteró; el seed definitivo no se ejecutó; no hubo commit ni push.

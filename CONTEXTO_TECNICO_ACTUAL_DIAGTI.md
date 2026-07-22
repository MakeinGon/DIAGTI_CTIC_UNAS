# DIAGTI – CTIC UNAS

Documento de contexto técnico actual del proyecto. Generado a partir de análisis estático, verificación de ejecución, `git status` / `git diff` y estado Docker/PostgreSQL verificados en el workspace.  
Fecha de verificación de ejecución: 22 de julio de 2026.

---

## 1. Identificación del sistema

| Campo | Valor |
|-------|--------|
| Nombre completo | Sistema Web Interno de Inventario y Diagnóstico TI con Trazabilidad para el CTIC de la Universidad Nacional Agraria de la Selva |
| Nombre corto | DIAGTI – CTIC UNAS |
| Institución | CTIC – Universidad Nacional Agraria de la Selva (UNAS) |
| Objetivo general | Centralizar el registro, actualización, validación, seguimiento y auditoría del inventario de sistemas informáticos, aplicativos, servicios tecnológicos e infraestructura tecnológica de la universidad |
| Problema que busca resolver | Reemplazar progresivamente archivos Excel aislados; reducir duplicidad, pérdida de versiones, falta de responsables, ausencia de evidencias técnicas y falta de trazabilidad |
| Estado general del desarrollo | Avanzado en estructura modular (frontend por perfiles + API Spring Boot + PostgreSQL + Docker). Compila y los tres contenedores principales están levantados. Cumplimiento funcional frente a requisitos oficiales: **parcial**. Riesgo principal: **doble modelo de persistencia** |

---

## 2. Documentación funcional oficial

Dentro de `documentacion/` se encuentran (archivos presentes en el workspace, aún sin seguimiento completo en git como untracked):

- `documentacion/Especificación de Requisitos Funcionales y No Funcionales (1) (5).docx`
- `documentacion/Matriz de Trazabilidad de Requisitos (2) (3).docx`

Contenido oficial registrado:

| Artefacto | Cantidad / alcance |
|-----------|-------------------|
| Requisitos funcionales | **35** — RF-01 a RF-35 |
| Requisitos no funcionales | **25** — RNF-01 a RNF-25 |
| Reglas de negocio | **14** — RN-01 a RN-14 |
| Casos de uso | **15** — CU-01 a CU-15 |
| MVP 1 | Versión inicial obligatoria (login LDAP, usuarios/roles, inventario, arquitectura, infraestructura, seguridad básica, evidencias, validación/observación/subsanación, riesgo básico, dashboard básico, auditoría) |
| MVP 2 | Versión ampliada (reportes PDF/Excel, dashboards avanzados, roadmap, presupuesto, integraciones, catálogos avanzados, alertas, obsolescencia, panel directivo, exportación institucional) |

Estos documentos definen **lo que el sistema debería cumplir**. Su existencia **no garantiza** que cada RF/RNF/RN/CU esté implementado en código.

Documentación auxiliar en la raíz (Markdown):

- `LEERMEPRIMERO.md`
- `MISION_FRONTEND_DIRECTIVO.md`
- `DASHBOARDS_DIRECTIVO_IMPLEMENTADOS.md`

---

## 3. Tecnologías identificadas

| Tecnología | Evidencia |
|------------|-----------|
| Java **17** | `backend/pom.xml` (`java.version`), `backend/Dockerfile` (eclipse-temurin:17-jdk) |
| Spring Boot **3.3.4** | `backend/pom.xml` (parent `spring-boot-starter-parent`) |
| Spring Data JPA | `backend/pom.xml` (`spring-boot-starter-data-jpa`) |
| Spring Security | `backend/pom.xml` (`spring-boot-starter-security`); configs en `backend/src/main/java/.../config/SecurityConfig.java` y `.../Login/security/SecurityConfigLogin.java` |
| Spring Validation / Web / Actuator | `backend/pom.xml` |
| PostgreSQL **17** | `docker-compose.yml` (`image: postgres:17`) |
| Docker / Docker Compose | `docker-compose.yml`, `backend/Dockerfile`, `.dockerignore` |
| Nginx | `nginx.conf`, servicio `frontend` con `nginx:alpine` |
| Frontend HTML / CSS / JS estático | `frontend/pages/**` (sin `package.json` de app SPA) |
| Maven / Maven Wrapper | `backend/pom.xml`, `backend/mvnw`, `backend/mvnw.cmd` |
| Flyway (declarado, deshabilitado) | `backend/pom.xml` + `backend/src/main/resources/application.properties` (`spring.flyway.enabled=false`) |
| Lombok / MapStruct | `backend/pom.xml` |

---

## 4. Estructura principal del proyecto

```
DIAGTI_CTIC_UNAS/
├── backend/                 # API Spring Boot (paquetes por perfil)
├── frontend/                # UI estática HTML/CSS/JS por roles
├── DataBase/                # init.sql + modules/*.sql (semilla / esquema oficial)
├── documentacion/           # ERS y matriz de trazabilidad (docx)
├── docker-compose.yml       # Orquestación postgres + backend + frontend
├── nginx.conf               # Proxy estático + /api /auth /auditor
├── .env                     # Variables Compose / Spring (secretos [OCULTO])
├── diagti_bd.sql            # Dump binario PostgreSQL (no SQL texto legible)
├── LEERMEPRIMERO.md
├── MISION_FRONTEND_DIRECTIVO.md
├── DASHBOARDS_DIRECTIVO_IMPLEMENTADOS.md
└── CONTEXTO_TECNICO_ACTUAL_DIAGTI.md   # este archivo
```

| Carpeta / archivo | Responsabilidad |
|-------------------|-----------------|
| `backend/` | API REST, JPA, seguridad, lógica por módulos (`Login`, `administrador`, `desarrollador`, `director`, `validador`, `auditor`, `infraestructura`, etc.) |
| `frontend/` | Interfaces por perfil; servidas por Nginx |
| `DataBase/` | Scripts SQL de inicialización oficiales montados en el contenedor PostgreSQL |
| `documentacion/` | Requisitos y trazabilidad oficiales |
| `docker-compose.yml` | Servicios, puertos, red, volumen |
| `nginx.conf` | Root estático, proxy a backend |
| `.env` | Credenciales y parámetros de despliegue |

---

## 5. Análisis técnico inicial realizado

Se realizó un análisis estático (solo lectura) y luego verificación de ejecución no destructiva, cubriendo:

- Backend (controladores, servicios, repositorios, entidades, seguridad).
- Frontend (páginas por perfil, consumo API, mocks, `localStorage`).
- Base de datos (`DataBase/init.sql`, módulos, estado real en PostgreSQL).
- Docker / Nginx / variables de entorno.
- Requisitos RF/RNF/RN/CU y alcance MVP.
- Roles, estados de flujo y validación.
- Dashboards, reportes y auditoría.

### Principales hallazgos iniciales

1. **Módulos por perfiles** en frontend y backend (admin, desarrollo, infraestructura, validación, auditor, director).
2. **Páginas con datos mock / fallback** (especialmente validación y varios JS de desarrollo).
3. **Uso de `localStorage`** (sesión login; registro técnico de infraestructura).
4. **Rutas frontend inconsistentes**: redirects a `directivo/` y `funcional/` inexistentes; carpeta real del directivo: `frontend/pages/director/`.
5. **Autenticación local** (DNI + password en texto plano en BD de prueba), no LDAP (RF-01 / RNF-01).
6. **Seguridad de API incompleta**: `/api/**` con `permitAll` en `SecurityConfig.java`.
7. **Doble modelo de persistencia** en código: entidades desarrollador (`sistemas_informaticos`, etc.) vs tablas oficiales (`sistemas`, `validaciones`, etc.) usadas por director/validador/auditor/admin.

---

## 6. Problemas de compilación encontrados

### 6.1 SistemaRepository sin import

**Error:** `SistemaRepository.java:[7,58] cannot find symbol: class Sistema`

**Causa:** la interfaz en `pe.edu.unas.ctic.diagti.sistemas` no importaba `pe.edu.unas.ctic.diagti.sistemas.model.Sistema`.

**Cambio inicial:** se añadió el import correspondiente.  
**Resultado:** `mvn -DskipTests compile` → **BUILD SUCCESS**.

**Evolución posterior:** el archivo `backend/src/main/java/pe/edu/unas/ctic/diagti/sistemas/SistemaRepository.java` fue **eliminado** y reemplazado por `SistemasSistemaRepository.java` (ver sección 6.2) para resolver el conflicto de bean `sistemaRepository`.

### 6.2 Repositorios Spring Data con nombres de bean duplicados

**Error de arranque:** `BeanDefinitionOverrideException` para beans como `sistemaRepository`, `infraestructuraRepository`, `seguridadRepository` (y el par equivalente de evidencias).

Conflictos detectados:

| Bean Spring | Pares en conflicto |
|-------------|-------------------|
| `infraestructuraRepository` | `director` ↔ `desarrollador` |
| `sistemaRepository` | `director` ↔ `sistemas` |
| `seguridadRepository` | `director` ↔ `desarrollador` |
| `evidenciaRepository` | `administrador` ↔ `desarrollador` |

**Archivos renombrados (nuevos, verificados en git como untracked / deletes):**

| Nuevo archivo | Reemplaza |
|---------------|-----------|
| `director/repository/DirectorInfraestructuraRepository.java` | `InfraestructuraRepository` (director) |
| `desarrollador/repository/DesarrolladorInfraestructuraRepository.java` | `InfraestructuraRepository` (desarrollador) |
| `director/repository/DirectorSistemaRepository.java` | `SistemaRepository` (director) |
| `sistemas/SistemasSistemaRepository.java` | `sistemas/SistemaRepository.java` |
| `director/repository/DirectorSeguridadRepository.java` | `SeguridadRepository` (director) |
| `desarrollador/repository/DesarrolladorSeguridadRepository.java` | `SeguridadRepository` (desarrollador) |
| `administrador/repository/AdministradorEvidenciaRepository.java` | `EvidenciaRepository` (admin) |
| `desarrollador/repository/DesarrolladorEvidenciaRepository.java` | `EvidenciaRepository` (desarrollador) |

**Servicios con imports / inyecciones actualizadas:**

- `desarrollador/service/impl/RegistrarSistemaServiceImpl.java`
- `desarrollador/service/impl/EditarSistemaServiceImpl.java`
- `desarrollador/service/impl/SubsanarObservacionesServiceImpl.java`
- `director/service/impl/DashboardServiceImpl.java`
- `director/service/impl/ReportesServiceImpl.java`
- `director/service/impl/RiesgosServiceImpl.java`
- `administrador/service/impl/SistemaAdminServiceImpl.java`
- `administrador/service/impl/EvidenciaServiceImpl.java`

**Aclaraciones:**

- No se habilitó `spring.main.allow-bean-definition-overriding`.
- No se utilizó `@Primary`.
- No se eliminaron repositorios sin reemplazo (se renombraron).
- Esta corrección **no** modificó tablas SQL por sí sola.

---

## 7. Entidades JPA con nombres duplicados

**Error:** `org.hibernate.DuplicateMappingException` — clases con el mismo nombre simple compartían el nombre de entidad JPA por defecto.

| Nombre de clase | Módulo 1 / @Table | Módulo 2 / @Table | name JPA asignado |
|-----------------|-------------------|-------------------|-------------------|
| ArquitecturaEntity | desarrollador / `arquitecturas_software` | director / `arquitectura` | `DesarrolladorArquitecturaEntity` / `DirectorArquitecturaEntity` |
| InfraestructuraEntity | desarrollador / `infraestructura_tecnologica` | director / `infraestructura` | `DesarrolladorInfraestructuraEntity` / `DirectorInfraestructuraEntity` |
| SeguridadEntity | desarrollador / `seguridad_sistemas` | director / `seguridad` | `DesarrolladorSeguridadEntity` / `DirectorSeguridadEntity` |
| EvidenciaEntity | desarrollador / `evidencias_tecnicas` | director / `evidencias` | `DesarrolladorEvidenciaEntity` / `DirectorEvidenciaEntity` |
| SistemaEntity | desarrollador / `sistemas_informaticos` | director / `sistemas` | `DesarrolladorSistemaEntity` / `DirectorSistemaEntity` |
| ValidacionEntity | desarrollador / `validaciones_tecnicas` | director / `validaciones` | `DesarrolladorValidacionEntity` / `DirectorValidacionEntity` |
| IntegracionEntity | desarrollador / `integraciones` | director / `integraciones` | `DesarrolladorIntegracionEntity` / `DirectorIntegracionEntity` |

**Aclaraciones:**

- No se renombraron clases Java ni archivos de entidad.
- No se modificaron los `@Table`.
- Se actualizaron consultas **JPQL** en repositorios que usaban el nombre simple anterior (`SistemaDesarrolloRepository`, `IntegracionRepository`, `DesarrolladorEvidenciaRepository`, `AdministradorEvidenciaRepository`, `DesarrolladorSeguridadRepository`, `DesarrolladorInfraestructuraRepository`).
- Compilación: **BUILD SUCCESS**.

---

## 8. Advertencias no bloqueantes

```
ValidacionMapper.java:[36,22] Unmapped target property: "sistema".
```

- No impide la compilación.
- **Todavía no fue corregida**.
- Debe revisarse después para confirmar si el mapeo MapStruct requiere asociar la entidad sistema.

---

## 9. Configuración de conexión a PostgreSQL

### Backend dentro de Docker

URL típica (red Compose):

`jdbc:postgresql://postgres:5432/diagti_db`

Evidencia: `.env` → `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/diagti_db`  
También hardcodeada en `backend/src/main/resources/application.properties` (mismo host `postgres`).

### Backend desde Windows con Maven (`mvn spring-boot:run`)

Debe usarse el puerto publicado al host:

`jdbc:postgresql://localhost:5433/diagti_db`

**Error observado** al ejecutar Maven sin sobrescribir la URL:

`java.net.UnknownHostException: postgres`

Para la prueba local segura se usaron variables de entorno temporales (sin modificar `application.properties`): URL `localhost:5433`, usuario/contraseña desde `.env` ([OCULTO]), y `SPRING_JPA_HIBERNATE_DDL_AUTO=none`.

---

## 10. Docker Compose

Servicios definidos en `docker-compose.yml`:

### PostgreSQL

| Campo | Valor |
|-------|--------|
| Contenedor | `diagti_postgres` |
| Imagen | `postgres:17` |
| Puerto | `5433:5432` |
| Estado verificado | **Up (healthy)** |
| Volumen | `diagti_ctic_unas_diagti_postgres_data` |
| Init | montaje `./DataBase` → `/docker-entrypoint-initdb.d` |

### Backend

| Campo | Valor |
|-------|--------|
| Contenedor | `diagti_backend` |
| Build | `./backend` + `Dockerfile` |
| Puerto | `8080:8080` |
| Estado verificado | **Up** |
| Arranque | Spring Boot inició (`Started DiagtiApiApplication` en logs) |

### Frontend

| Campo | Valor |
|-------|--------|
| Contenedor | `diagti_frontend` |
| Imagen | `nginx:alpine` |
| Puertos | `80:80`, `443:443` |
| Montajes | `./frontend` → html; `./nginx.conf` → conf |
| Estado verificado | **Up** |

Comandos de operación usados en la sesión:

```bash
docker compose up -d
docker compose up -d --build
docker compose ps
```

---

## 11. Conflicto del puerto 8080

Durante la verificación local, un proceso Java (PID **32940**) escuchaba en el puerto **8080** (`mvn spring-boot:run`).

Identificación típica:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen
Get-Process -Id 32940
Stop-Process -Id 32940 -Force
```

**Regla operativa:** no ejecutar simultáneamente:

- `mvn spring-boot:run` en el host, y
- contenedor `diagti_backend`,

porque ambos usan el puerto **8080**.

---

## 12. Estado actual de ejecución

Estado confirmado más reciente (`docker compose ps` + sondas HTTP):

| Contenedor | Estado | Puertos |
|------------|--------|---------|
| `diagti_postgres` | Up (healthy) | 5433→5432 |
| `diagti_backend` | Up | 8080→8080 |
| `diagti_frontend` | Up | 80, 443 |

Evidencia backend:

- Log / arranque: `Started DiagtiApiApplication`
- Prueba: `GET http://localhost:8080/auth/health` → **HTTP 200**
- Cuerpo resumido: `status: UP`, mensaje de autenticación operativa, `version: 1.0.0`

---

## 13. URLs de acceso

| URL | Propósito | Verificación |
|-----|-----------|--------------|
| http://localhost | Frontend vía Nginx | Respuesta observada **403** en raíz (pendiente revisar index / try_files) |
| http://localhost/pages/login/html/login.html | Login | **HTTP 200** verificado |
| http://localhost:8080/auth/health | Health backend directo | **HTTP 200** verificado |
| http://localhost/auth/health | Health vía proxy Nginx | **HTTP 200** verificado |

Pendiente de prueba funcional completa: login con usuario real, redirecciones por rol, flujos CRUD y validación extremo a extremo.

---

## 14. Cambios realizados por Hibernate

Sección crítica.

Con `.env` / Compose usando `SPRING_JPA_HIBERNATE_DDL_AUTO=update`, al arrancar el backend en Docker Hibernate aplicó `alter table` / creación de esquemas según entidades JPA.

### Tablas paralelas materializadas (verificadas en PostgreSQL)

Actualmente existen **20** tablas en `public`. Incluyen las paralelas del módulo desarrollador:

| Tabla paralela (desarrollador / Hibernate) | Tabla oficial relacionada |
|--------------------------------------------|---------------------------|
| `sistemas_informaticos` | `sistemas` |
| `validaciones_tecnicas` | `validaciones` |
| `arquitecturas_software` | `arquitectura` |
| `infraestructura_tecnologica` | `infraestructura` |
| `seguridad_sistemas` | `seguridad` |
| `evidencias_tecnicas` | `evidencias` |

También existe `permisos` (antes ausente en el volumen vacío inicial).

### Alteraciones sobre tablas existentes

En logs del backend Docker se observaron sentencias Hibernate del tipo `alter table if exists ...` sobre tablas como:

- `sistemas`, `arquitectura`, `auditoria`, `catalogos`, `evidencias`, `infraestructura`, `integraciones`, `usuarios`, `usuarios_roles`, `validaciones`, y las tablas paralelas.

Esto implica columnas, UNIQUE, FKs y/o cambios de tipo según el mapeo JPA (detalle exacto columna-a-columna requiere inventario DDL adicional).

### Riesgo

El sistema posee **dos familias de tablas** para conceptos similares:

1. Oficiales (`sistemas`, `validaciones`, …) — usadas por director, auditor, validador, administración.
2. Alternativas (`sistemas_informaticos`, `validaciones_tecnicas`, …) — usadas por el módulo desarrollador.

**Impacto:** un registro creado en Desarrollo puede **no** aparecer en Validación o en dashboards directivos.

---

## 15. Configuración recomendada de Hibernate

Para impedir nuevas modificaciones automáticas del esquema, se recomienda (sin aplicar en esta tarea):

```env
SPRING_JPA_HIBERNATE_DDL_AUTO=none
```

**Valor actual verificado en `.env`:** `SPRING_JPA_HIBERNATE_DDL_AUTO=update`  
**Valor en `application.properties`:** `spring.jpa.hibernate.ddl-auto=update`  
**Flyway:** `spring.flyway.enabled=false`

Antes de cambiar a `none`, conviene respaldar la BD e inventariar el esquema actual.

---

## 16. Estado de autenticación

- Endpoint `GET /auth/health` activo (**HTTP 200**).
- Login HTTP: `POST /auth/login` (código en `AuthController` / `AuthServiceImpl`).
- **LDAP/OpenLDAP** (RF-01, RNF-01): **no implementado / no verificado** en código.
- Autenticación actual: local por username (DNI) y comparación de password en claro frente a `password_hash` almacenado.
- Spring Security puede emitir password generada de desarrollo en algunos arranques (comportamiento Spring Boot); no documentar valores.
- API: control de roles incompleto (`/api/**` permitAll).
- Usuarios/roles en BD: deben re-verificarse tras las alteraciones Hibernate (conteos y seeds no asumidos aquí sin consulta de negocio).

---

## 17. Estado funcional aproximado por módulo

| Módulo | Estado actual | Evidencia | Pendiente principal |
|--------|---------------|-----------|---------------------|
| Autenticación | PARCIALMENTE IMPLEMENTADO | Login FE + `/auth/login` + health UP | LDAP; sesiones seguras; no loguear passwords |
| Usuarios y roles | PARCIALMENTE IMPLEMENTADO | Admin FE/API + tablas `usuarios`/`roles`/`permisos` | Enforcement real por rol en API |
| Inventario | PARCIALMENTE IMPLEMENTADO | Dual: `sistemas` vs `sistemas_informaticos` | Unificar fuente de verdad |
| Arquitectura | PARCIALMENTE IMPLEMENTADO | Entidades + tablas duales | Alinear SQL oficial vs entidad desarrollador |
| Infraestructura | PARCIALMENTE IMPLEMENTADO | FE localStorage; BE controllers incompletos / dual | Persistencia unificada |
| Seguridad técnica | PARCIALMENTE IMPLEMENTADO | Entidades duales | Controles RF-12 completos |
| Integraciones | PARCIALMENTE IMPLEMENTADO | Tabla + endpoints desarrollador | Misma tabla mapeada por dos entidades |
| Evidencias | PARCIALMENTE IMPLEMENTADO | Admin consulta + carga desarrollador | Unificar tablas evidencias* |
| Validación | PARCIALMENTE IMPLEMENTADO | API validador + FE con mocks | Desacople con tablas desarrollador |
| Observaciones / subsanación | PARCIALMENTE IMPLEMENTADO | Servicios desarrollador + tabla observaciones | Flujo E2E verificado |
| Riesgo | PARCIALMENTE IMPLEMENTADO | `RiesgoCalculator`, director riesgos | RN-04 y fórmulas oficiales |
| Obsolescencia | NO IMPLEMENTADO / PARCIAL | Docs citan pantallas; FE dedicado incompleto | Dashboard obsolescencia real |
| Dashboard | PARCIALMENTE IMPLEMENTADO | Director/dev/infra/val APIs y pantallas | Consistencia de datos |
| Reportes | PARCIALMENTE IMPLEMENTADO | Director/admin/auditor | PDF servidor / formato institucional |
| Auditoría | PARCIALMENTE IMPLEMENTADO | Tabla + pantallas | Valor anterior/nuevo; cobertura total |
| Notificaciones | NO IMPLEMENTADO | Sin evidencia | RF-34 |
| Catálogos | PARCIALMENTE IMPLEMENTADO | API + FE admin | Cobertura tipos RF |
| Roadmap migración | SOLO BASE DE DATOS / PARCIAL | Campo `prioridad_migracion` | UI/API roadmap |
| Escenarios presupuestales | NO IMPLEMENTADO | Sin evidencia | RF-35 |
| Perfil funcional | NO IMPLEMENTADO | Redirect a carpeta inexistente | FE + alcance |

---

## 18. Riesgos técnicos actuales

1. Doble modelo de tablas (oficial vs desarrollador).
2. Hibernate `ddl-auto=update` activo en `.env` / `application.properties`.
3. Base de datos ya alterada automáticamente (20 tablas públicas).
4. Autenticación LDAP pendiente.
5. Permisos de API incompletos (`permitAll` en `/api/**`).
6. Credenciales y secretos en `.env` / properties (valores sensibles: **[OCULTO]**).
7. Frontend con URLs absolutas `http://localhost:8080` en varios módulos.
8. Mocks y `localStorage` en flujos críticos.
9. Estados de validación inconsistentes (nombres/valores entre capas).
10. Documentación FE desactualizada (`directivo/` vs `director/`).
11. Ambientes dev/test/prod no claramente separados.
12. Flyway deshabilitado.
13. Pruebas automatizadas insuficientes (casi solo smoke de aplicación).

---

## 19. Archivos modificados durante la corrección

Según `git status` / `git diff` verificados (sin commit):

| Archivo | Tipo de cambio | Motivo | Estado |
|---------|----------------|--------|--------|
| `administrador/repository/EvidenciaRepository.java` | Eliminado | Renombre a AdministradorEvidenciaRepository | Working tree |
| `administrador/repository/AdministradorEvidenciaRepository.java` | Nuevo | Bean único + JPQL DirectorEvidenciaEntity | Untracked |
| `administrador/service/impl/EvidenciaServiceImpl.java` | Modificado | Imports/inyección nuevos repos | Modified |
| `administrador/service/impl/SistemaAdminServiceImpl.java` | Modificado | DirectorSistemaRepository + AdministradorEvidenciaRepository | Modified |
| `desarrollador/entity/*Entity.java` (7 archivos) | Modificado | `@Entity(name=Desarrollador…)` | Modified |
| `desarrollador/repository/EvidenciaRepository.java` | Eliminado | Renombre | Deleted |
| `desarrollador/repository/InfraestructuraRepository.java` | Eliminado | Renombre | Deleted |
| `desarrollador/repository/SeguridadRepository.java` | Eliminado | Renombre | Deleted |
| `desarrollador/repository/DesarrolladorEvidenciaRepository.java` | Nuevo | Bean único | Untracked |
| `desarrollador/repository/DesarrolladorInfraestructuraRepository.java` | Nuevo | Bean único | Untracked |
| `desarrollador/repository/DesarrolladorSeguridadRepository.java` | Nuevo | Bean único | Untracked |
| `desarrollador/repository/IntegracionRepository.java` | Modificado | JPQL nombre entidad | Modified |
| `desarrollador/repository/SistemaDesarrolloRepository.java` | Modificado | JPQL DesarrolladorSistemaEntity | Modified |
| `desarrollador/service/impl/EditarSistemaServiceImpl.java` | Modificado | Tipos repo renombrados | Modified |
| `desarrollador/service/impl/RegistrarSistemaServiceImpl.java` | Modificado | Tipos repo renombrados | Modified |
| `desarrollador/service/impl/SubsanarObservacionesServiceImpl.java` | Modificado | Tipos repo renombrados | Modified |
| `director/entity/*Entity.java` (7 archivos) | Modificado | `@Entity(name=Director…)` | Modified |
| `director/repository/InfraestructuraRepository.java` | Eliminado | Renombre | Deleted |
| `director/repository/SeguridadRepository.java` | Eliminado | Renombre | Deleted |
| `director/repository/SistemaRepository.java` | Eliminado | Renombre | Deleted |
| `director/repository/DirectorInfraestructuraRepository.java` | Nuevo | Bean único | Untracked |
| `director/repository/DirectorSeguridadRepository.java` | Nuevo | Bean único | Untracked |
| `director/repository/DirectorSistemaRepository.java` | Nuevo | Bean único | Untracked |
| `director/service/impl/DashboardServiceImpl.java` | Modificado | DirectorSistemaRepository | Modified |
| `director/service/impl/ReportesServiceImpl.java` | Modificado | Repos director renombrados | Modified |
| `director/service/impl/RiesgosServiceImpl.java` | Modificado | Repos director renombrados | Modified |
| `sistemas/SistemaRepository.java` | Eliminado | Renombre a SistemasSistemaRepository | Deleted |
| `sistemas/SistemasSistemaRepository.java` | Nuevo | Bean único | Untracked |
| `documentacion/*.docx` | Nuevo (untracked) | Documentación oficial añadida al workspace | Untracked |
| `CONTEXTO_TECNICO_ACTUAL_DIAGTI.md` | Nuevo | Este documento | Creado |

---

## 20. Archivos críticos que no deben modificarse sin análisis

- `backend/src/main/resources/application.properties`
- `.env`
- `docker-compose.yml`
- `nginx.conf`
- `DataBase/init.sql`
- `DataBase/modules/**`
- Entidades `SistemaEntity` (desarrollador y director) y demás entidades duales
- Repositorios/servicios de sistemas, validaciones, evidencias
- Volumen Docker `diagti_ctic_unas_diagti_postgres_data`
- Scripts Flyway en `backend/src/main/resources/db/migration/` (aunque Flyway esté off)

---

## 21. Comandos actuales de operación

### Levantar todo

```bash
docker compose up -d --build
```

### Ver estado

```bash
docker compose ps
```

### Ver logs

```bash
docker compose logs --tail=200 backend
docker compose logs --tail=100 postgres
docker compose logs --tail=100 frontend
```

### Probar backend

```bash
curl.exe -i http://localhost:8080/auth/health
```

### Detener sin borrar datos

```bash
docker compose stop
```

### Prohibido salvo autorización explícita

```bash
docker compose down -v
```

`down -v` elimina el volumen de PostgreSQL y **borra los datos** del contenedor.

---

## 22. Estado actual resumido

| Componente | Estado | Acceso |
|------------|--------|--------|
| PostgreSQL | Up / healthy | `localhost:5433` |
| Backend | Up | `localhost:8080` |
| Frontend (Nginx) | Up | `localhost` (puertos 80/443) |
| Login | Interfaz disponible (HTTP 200) | `http://localhost/pages/login/html/login.html` |
| Health backend | UP | `http://localhost:8080/auth/health` |
| Health vía Nginx | UP | `http://localhost/auth/health` |
| LDAP | No implementado / no verificado | — |
| Base de datos | Activa, con tablas oficiales **y** paralelas | PostgreSQL `diagti_db` |
| Requisitos | Documentados; cumplimiento parcial | `documentacion/` |
| Hibernate ddl-auto | `update` (activo en `.env`) | Riesgo de más ALTER |

---

## 23. Próximos pasos recomendados

Orden sugerido (**sin ejecutar** en esta tarea):

1. Confirmar y, con autorización, pasar `.env` / configuración a `ddl-auto=none`.
2. Hacer respaldo de la base de datos (dump lógico).
3. Inventariar tablas/columnas creadas o alteradas por Hibernate.
4. Comparar datos entre `sistemas` y `sistemas_informaticos` (y pares equivalentes).
5. Decidir la **fuente de verdad** de persistencia.
6. Verificar usuarios, roles y `usuarios_roles`.
7. Probar login completo y redirects por rol.
8. Probar flujo Desarrollo → Validación extremo a extremo.
9. Revisar seguridad por roles en API.
10. Alinear frontend, backend y base de datos (URLs, estados, mocks).
11. Implementar o configurar LDAP según RF-01 / RNF-01.
12. Actualizar documentación (rutas `director`/`directivo`, LEERME, misiones).

---

## 24. Cambios pendientes que requieren autorización

No ejecutar sin autorización explícita:

- Eliminar tablas paralelas.
- Migrar datos entre familias de tablas.
- Renombrar tablas.
- Cambiar `ddl-auto` en `.env` o `application.properties`.
- Habilitar Flyway.
- Crear usuarios de prueba / seeds.
- Modificar contraseñas.
- Reescribir autenticación (LDAP).
- Cambiar roles o matriz de permisos.
- Alterar el flujo oficial de estados.
- Eliminar mocks del frontend.
- Modificar URLs absolutas del frontend.
- `docker compose down -v` u otras acciones destructivas.

---

## 25. Conclusión

- El proyecto **compila** (`BUILD SUCCESS` tras correcciones de import, beans de repositorios y nombres JPA).
- Docker **construye** la imagen del backend y levanta los tres servicios.
- PostgreSQL, backend y frontend están **Up**; el backend responde **HTTP 200** en `/auth/health`.
- El sistema **aún requiere revisión funcional** frente a RF/RNF/RN/CU y MVP.
- El **principal riesgo técnico** es la coexistencia de modelos de persistencia (tablas oficiales + tablas paralelas Hibernate del módulo desarrollador), agravado por `ddl-auto=update`.
- El siguiente trabajo debe hacerse con **trazabilidad** explícita a la documentación oficial y **autorización** antes de tocar esquema, datos o seguridad.

---

*Fin del contexto técnico actual. Este archivo no incluye secretos; valores sensibles se representan como [OCULTO]. No se realizó commit.*

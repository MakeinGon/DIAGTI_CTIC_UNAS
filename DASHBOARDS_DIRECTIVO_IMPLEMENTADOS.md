# Módulo Directivo — dashboards especializados

## Dashboard de Riesgos
Archivos:
- frontend/pages/directivo/modules/html/dashboard-riesgos.html
- frontend/pages/directivo/modules/css/dashboard-riesgos.css
- frontend/pages/directivo/modules/js/dashboard-riesgos.js

Funciones implementadas:
- KPI de riesgos críticos, vulnerabilidades abiertas, flujos bloqueados y riesgos controlados.
- Semáforo rojo, amarillo y verde interactivo.
- Matriz probabilidad × impacto.
- Riesgos por categoría.
- Cuellos de botella de validación.
- Filtros, búsqueda, ordenamiento, paginación y detalle.
- Estados de carga, vacío y error.

## Dashboard de Obsolescencia
Archivos:
- frontend/pages/directivo/modules/html/dashboard-obsolescencia.html
- frontend/pages/directivo/modules/css/dashboard-obsolescencia.css
- frontend/pages/directivo/modules/js/dashboard-obsolescencia.js

Funciones implementadas:
- KPI de activos caducados, próximos a vencer, renovación técnica y previsión presupuestal.
- Equipos, sistemas y licencias.
- Gráfico de vigencia, clasificación por tipo, línea temporal, exposición por área y tipo de intervención.
- Filtros, búsqueda, ordenamiento, paginación y detalle de renovación.
- Estados de carga, vacío y error.

## Reportes Ejecutivos
Funciones implementadas:
- Centro de consulta de reportes consolidados.
- Filtros por periodo, área funcional, criticidad y riesgo.
- Exportación PDF mediante impresión optimizada.
- Exportación CSV compatible con Excel.
- Exportación limitada a registros visibles filtrados.

## Ejecución
Desde la carpeta DIAGTI_CTIC_UNAS:

python -m http.server 5500 --directory frontend/pages/directivo/modules

Abrir:
- http://localhost:5500/html/resumen-ejecutivo.html
- http://localhost:5500/html/dashboard-riesgos.html
- http://localhost:5500/html/dashboard-obsolescencia.html
- http://localhost:5500/html/reportes-ejecutivos.html

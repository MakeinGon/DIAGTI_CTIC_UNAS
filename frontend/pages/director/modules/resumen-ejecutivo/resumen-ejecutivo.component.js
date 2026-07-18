/* ============================================================
   resumen-ejecutivo.component.js
   Dashboard Ejecutivo - Conectado al backend
   ============================================================ */

/* ============================================================
   CERRAR SESIÓN
============================================================ */
function cerrarSesion() {
    document.getElementById('logout-confirm-overlay').classList.add('open');
}
function cancelarCerrarSesion() {
    document.getElementById('logout-confirm-overlay').classList.remove('open');
}
function confirmarCerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../../login/html/login.html";
}
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
});

/* ---------- resumen-ejecutivo.js ---------- */
"use strict";

/* ============================================================
   CONFIGURACIÓN
============================================================ */
const API_BASE_DASHBOARD = "http://localhost:8080/api/director/dashboard";
const API_BASE_REPORTES = "http://localhost:8080/api/director/reportes";

/* ============================================================
   LABELS Y CONSTANTES
============================================================ */
const VALIDATION_LABELS = Object.freeze({
    validado: "Validado",
    observado: "Observado",
    pendiente: "Pendiente",
    VALIDADO: "Validado",
    OBSERVADO: "Observado",
    PENDIENTE: "Pendiente"
});

const CRITICALITY_LABELS = Object.freeze({
    academico: "Académico",
    financiero: "Financiero",
    rrhh: "RRHH",
    administrativo: "Administrativo",
    misional: "Misional",
    estrategico: "Estratégico",
    critica: "Crítica",
    alta: "Alta",
    media: "Media",
    baja: "Baja",
    CRITICA: "Crítica",
    ALTA: "Alta",
    MEDIA: "Media",
    BAJA: "Baja"
});

const VALIDATION_COLORS = Object.freeze({
    validado: "#1abb9c",
    observado: "#e7a52d",
    pendiente: "#5f88a8",
    VALIDADO: "#1abb9c",
    OBSERVADO: "#e7a52d",
    PENDIENTE: "#5f88a8"
});

const CRITICALITY_COLORS = Object.freeze({
    academico: "#cf2d35",
    financiero: "#e49a18",
    rrhh: "#4f7fa4",
    administrativo: "#1abb9c",
    misional: "#8b5cf6",
    estrategico: "#f59e0b",
    critica: "#cf2d35",
    alta: "#e49a18",
    media: "#4f7fa4",
    baja: "#1abb9c",
    CRITICA: "#cf2d35",
    ALTA: "#e49a18",
    MEDIA: "#4f7fa4",
    BAJA: "#1abb9c"
});

const CRITICALITY_ORDER = Object.freeze(["critica", "alta", "media", "baja"]);
const CRITICALITY_RANK = Object.freeze({ 
    CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1, 
    critica: 4, alta: 3, media: 2, baja: 1,
    academico: 5, financiero: 4, rrhh: 3, administrativo: 2, misional: 6, estrategico: 5
});

/* ============================================================
   STATE
============================================================ */
let sistemasData = [];
let resumenValidacionData = [];
let criticidadesData = [];
let kpisData = {};

const dashboardState = {
    filters: {
        dateFrom: "2025-01-01",
        dateTo: "2026-12-31",
        area: "all",
        criticality: "all",
        validation: "all",
        search: ""
    },
    page: 1,
    pageSize: 10,
    validationSummarySelection: "validado"
};

const elements = {};

/* ============================================================
   FUNCIONES AUXILIARES
============================================================ */
function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function percent(value, total) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
}

function slug(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/* ============================================================
   CARGA DE DATOS DESDE EL BACKEND
============================================================ */
function cargarAreasFiltro() {
    fetch(`${API_BASE_REPORTES}/catalogos/areas`)
        .then(res => res.json())
        .then(data => {
            const select = elements.area;
            if (!select) return;
            const primeraOpcion = select.options[0];
            select.innerHTML = '';
            if (primeraOpcion) select.appendChild(primeraOpcion);
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = slug(item.valor);
                option.textContent = item.valor;
                select.appendChild(option);
            });
        })
        .catch(err => console.error("Error cargando áreas:", err));
}

function cargarCriticidadesFiltro() {
    fetch(`${API_BASE_REPORTES}/catalogos/criticidades`)
        .then(res => res.json())
        .then(data => {
            const select = elements.criticality;
            if (!select) return;
            const primeraOpcion = select.options[0];
            select.innerHTML = '';
            if (primeraOpcion) select.appendChild(primeraOpcion);
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = slug(item.valor);
                option.textContent = item.valor;
                select.appendChild(option);
            });
        })
        .catch(err => console.error("Error cargando criticidades:", err));
}

function cargarKPIs() {
    console.log("[DIAGTI] Cargando KPIs...");
    return fetch(`${API_BASE_DASHBOARD}/kpis`)
        .then(res => res.json())
        .then(data => {
            kpisData = data;
            console.log("[DIAGTI] KPIs recibidos:", data);
            return data;
        })
        .catch(err => {
            console.error("Error cargando KPIs:", err);
            return { totalSistemas: 0, validados: 0, observados: 0, pendientes: 0 };
        });
}

function cargarResumenValidacion() {
    console.log("[DIAGTI] Cargando resumen validación...");
    return fetch(`${API_BASE_DASHBOARD}/resumen-validacion`)
        .then(res => res.json())
        .then(data => {
            resumenValidacionData = data;
            console.log("[DIAGTI] Resumen validación recibido:", data);
            return data;
        })
        .catch(err => {
            console.error("Error cargando resumen validación:", err);
            return [];
        });
}

function cargarCriticidades() {
    console.log("[DIAGTI] Cargando criticidades...");
    return fetch(`${API_BASE_DASHBOARD}/criticidades`)
        .then(res => res.json())
        .then(data => {
            criticidadesData = data;
            console.log("[DIAGTI] Criticidades recibidas:", data);
            return data;
        })
        .catch(err => {
            console.error("Error cargando criticidades:", err);
            return [];
        });
}

function cargarSistemas(area, criticality, validation, search) {
    console.log("[DIAGTI] Cargando sistemas con filtros:", { area, criticality, validation, search });
    let url = `${API_BASE_DASHBOARD}/sistemas?`;
    const params = [];
    if (area && area !== 'all') params.push(`area=${area}`);
    if (criticality && criticality !== 'all') params.push(`criticidad=${criticality}`);
    if (validation && validation !== 'all') params.push(`validacion=${validation}`);
    if (search) params.push(`busqueda=${encodeURIComponent(search)}`);
    url += params.join('&');

    return fetch(url)
        .then(res => res.json())
        .then(data => {
            sistemasData = data;
            console.log("[DIAGTI] Sistemas recibidos:", data);
            return data;
        })
        .catch(err => {
            console.error("Error cargando sistemas:", err);
            return [];
        });
}

/* ============================================================
   FUNCIONES DE RENDERIZADO
============================================================ */
function renderKpis() {
    const total = kpisData.totalSistemas || 0;
    const validados = kpisData.validados || 0;
    const observados = kpisData.observados || 0;
    const pendientes = kpisData.pendientes || 0;

    console.log("[DIAGTI] Renderizando KPIs:", { total, validados, observados, pendientes });

    elements.kpiTotal.textContent = String(total);
    elements.kpiValidated.textContent = String(validados);
    elements.kpiObserved.textContent = String(observados);
    elements.kpiPending.textContent = String(pendientes);
    elements.kpiValidatedPercentage.textContent = `${percent(validados, total)}%`;
    elements.kpiObservedPercentage.textContent = `${percent(observados, total)}%`;
    elements.kpiPendingPercentage.textContent = `${percent(pendientes, total)}%`;
}

function renderValidationChart() {
    const counts = {
        validado: kpisData.validados || 0,
        observado: kpisData.observados || 0,
        pendiente: kpisData.pendientes || 0
    };

    const total = counts.validado + counts.observado + counts.pendiente;
    console.log("[DIAGTI] Renderizando gráfico de validación:", counts, "Total:", total);
    
    if (total === 0) {
        elements.validationTotal.textContent = "0 sistemas";
        elements.validationChart.innerHTML = `
            <div class="health-chart">
                <div style="text-align:center;padding:20px;color:#64757a;">
                    <p>No hay datos disponibles</p>
                </div>
            </div>
        `;
        return;
    }

    const validPercent = percent(counts.validado, total);
    const observedPercent = percent(counts.observado, total);
    const pendingPercent = percent(counts.pendiente, total);
    const validEnd = validPercent;
    const observedEnd = validPercent + observedPercent;
    const selected = dashboardState.validationSummarySelection;

    elements.validationTotal.textContent = `${total} sistemas`;

    const donutBackground = `conic-gradient(
        ${VALIDATION_COLORS.validado} 0 ${validEnd}%,
        ${VALIDATION_COLORS.observado} ${validEnd}% ${observedEnd}%,
        ${VALIDATION_COLORS.pendiente} ${observedEnd}% 100%
    )`;

    const selectedCount = counts[selected] || 0;
    const selectedPercent = percent(selectedCount, total);
    const selectedLabel = VALIDATION_LABELS[selected]?.toLowerCase() || selected;

    const legend = ["validado", "observado", "pendiente"].map((status) => `
        <button type="button" class="executive-chart-button" data-validation-summary="${status}" aria-pressed="${selected === status}">
            <span class="health-legend__dot" style="background:${VALIDATION_COLORS[status]}"></span>
            <span class="health-legend__label">${VALIDATION_LABELS[status] || status}</span>
            <strong>${counts[status] || 0}</strong>
            <span class="health-legend__meta">${percent(counts[status] || 0, total)}% del total</span>
        </button>
    `).join("");

    elements.validationChart.innerHTML = `
        <div class="health-chart">
            <div class="health-chart__donut" style="background:${donutBackground}">
                <div class="health-chart__center">
                    <strong>${selectedPercent}%</strong>
                    <span>${selectedLabel}</span>
                </div>
            </div>
        </div>
        <div class="health-legend">${legend}</div>
    `;
}

function renderCriticalityChart() {
    console.log("[DIAGTI] Renderizando gráfico de criticidad con datos:", criticidadesData);
    
    // Definir todas las categorías de criticidad que existen en el catálogo
    const TODAS_CRITICIDADES = [
        { key: 'academico', label: 'Académico', color: '#cf2d35' },
        { key: 'financiero', label: 'Financiero', color: '#e49a18' },
        { key: 'rrhh', label: 'RRHH', color: '#4f7fa4' },
        { key: 'administrativo', label: 'Administrativo', color: '#1abb9c' },
        { key: 'misional', label: 'Misional', color: '#8b5cf6' },
        { key: 'estrategico', label: 'Estratégico', color: '#f59e0b' }
    ];

    // Obtener conteos desde criticidadesData o sistemasData
    let counts = {};
    if (criticidadesData && criticidadesData.length > 0) {
        criticidadesData.forEach(item => {
            const key = item.nivel ? item.nivel.toLowerCase() : 'sin definir';
            counts[key] = item.cantidad || 0;
        });
    } else {
        sistemasData.forEach(s => {
            const key = s.criticidad ? s.criticidad.toLowerCase() : 'sin definir';
            counts[key] = (counts[key] || 0) + 1;
        });
    }

    // Asegurar que todas las categorías tengan al menos 0
    TODAS_CRITICIDADES.forEach(({ key }) => {
        if (!(key in counts)) {
            counts[key] = 0;
        }
    });

    const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
    const maxValue = Math.max(1, ...TODAS_CRITICIDADES.map(c => counts[c.key] || 0));

    // Construir el gráfico con TODAS las categorías
    elements.criticalityChart.innerHTML = TODAS_CRITICIDADES.map(({ key, label, color }) => {
        const count = counts[key] || 0;
        const width = (count / maxValue) * 100;
        const active = dashboardState.filters.criticality === key;
        const noun = count === 1 ? "sistema" : "sistemas";

        return `
            <button type="button" class="criticality-row ${active ? "is-active" : ""}" data-criticality="${key}" aria-pressed="${active}">
                <span class="criticality-row__label">${label}</span>
                <span class="criticality-row__track">
                    <span class="criticality-row__bar" style="width:${width}%;background:${color}"></span>
                </span>
                <span class="criticality-row__value">${count} ${noun}<small>${percent(count, total)}%</small></span>
            </button>
        `;
    }).join("");

    elements.clearCriticality.hidden = dashboardState.filters.criticality === "all";
}

function sortedSystems(systems) {
    return [...systems].sort((a, b) => {
        const aRank = CRITICALITY_RANK[a.criticidad?.toUpperCase()] || 0;
        const bRank = CRITICALITY_RANK[b.criticidad?.toUpperCase()] || 0;
        const criticalityDifference = bRank - aRank;
        if (criticalityDifference !== 0) return criticalityDifference;
        return (a.nombre || '').localeCompare(b.nombre || '', 'es');
    });
}

function renderTable() {
    console.log("[DIAGTI] Renderizando tabla con", sistemasData.length, "sistemas");
    
    const ordered = sortedSystems(sistemasData);
    const totalPages = Math.max(1, Math.ceil(ordered.length / dashboardState.pageSize));
    dashboardState.page = Math.min(dashboardState.page, totalPages);

    const start = (dashboardState.page - 1) * dashboardState.pageSize;
    const pageRows = ordered.slice(start, start + dashboardState.pageSize);

    if (!pageRows.length) {
        elements.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#64757a;">No existen sistemas para los filtros seleccionados.</td></tr>`;
    } else {
        elements.tableBody.innerHTML = pageRows.map((system) => {
            const criticidadUpper = (system.criticidad || 'MEDIA').toUpperCase();
            const validationUpper = (system.validacion || 'PENDIENTE').toUpperCase();
            const criticidadLabel = CRITICALITY_LABELS[criticidadUpper.toLowerCase()] || 
                                   CRITICALITY_LABELS[system.criticidad?.toLowerCase()] || 
                                   system.criticidad || 'Media';
            const validationLabel = VALIDATION_LABELS[validationUpper] || 
                                   VALIDATION_LABELS[system.validacion?.toLowerCase()] || 
                                   system.validacion || 'Pendiente';
            return `
                <tr>
                    <td><strong>${escapeHTML(system.codigo || 'N/A')}</strong></td>
                    <td class="executive-table__system">
                        <strong>${escapeHTML(system.nombre || 'Sin nombre')}</strong>
                        <span>${escapeHTML(system.tipo || 'No especificado')}</span>
                    </td>
                    <td>${escapeHTML(system.area || 'No especificada')}</td>
                    <td>${escapeHTML(system.alerta || 'Sin alerta')}</td>
                    <td><span class="executive-status-badge executive-status-badge--${criticidadUpper.toLowerCase()}">${criticidadLabel}</span></td>
                    <td><span class="executive-status-badge executive-status-badge--${validationUpper.toLowerCase()}">${validationLabel}</span></td>
                    <td><button type="button" class="executive-table__detail-button" data-system-code="${escapeHTML(system.codigo || '')}">Ver detalle</button></td>
                </tr>
            `;
        }).join("");
    }

    const shownFrom = ordered.length ? start + 1 : 0;
    const shownTo = Math.min(start + dashboardState.pageSize, ordered.length);
    elements.paginationSummary.textContent = `Mostrando ${shownFrom}–${shownTo} de ${ordered.length} resultados`;
    elements.pageIndicator.textContent = `Página ${dashboardState.page} de ${totalPages}`;
    elements.previous.disabled = dashboardState.page <= 1;
    elements.next.disabled = dashboardState.page >= totalPages;
}

function showSystemDetail(systemCode) {
    const system = sistemasData.find((item) => item.codigo === systemCode);
    if (!system) return;

    const criticidadLabel = CRITICALITY_LABELS[system.criticidad?.toLowerCase()] || system.criticidad || 'Media';
    const validationLabel = VALIDATION_LABELS[system.validacion?.toLowerCase()] || system.validacion || 'Pendiente';

    elements.dialogTitle.textContent = system.nombre || 'Sistema';
    elements.dialogContent.innerHTML = `
        <p><strong>Código:</strong> ${escapeHTML(system.codigo || 'N/A')}</p>
        <p><strong>Área:</strong> ${escapeHTML(system.area || 'No especificada')}</p>
        <p><strong>Plataforma:</strong> ${escapeHTML(system.tipo || 'No especificado')}</p>
        <p><strong>Exposición:</strong> ${escapeHTML(system.exposicion || 'No registrada')}</p>
        <p><strong>Estado ejecutivo:</strong> ${escapeHTML(validationLabel)}</p>
        <p><strong>Criticidad:</strong> ${escapeHTML(criticidadLabel)}</p>
        <p><strong>Detalle:</strong> ${escapeHTML(system.detalle || 'Sin información')}</p>
        <p><strong>Recomendación:</strong> ${escapeHTML(system.recomendacion || 'Revisar estado de validación y observaciones.')}</p>
    `;

    if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
    else elements.dialog.setAttribute("open", "");
}

/* ============================================================
   FUNCIONES DE ACTUALIZACIÓN Y FILTROS
============================================================ */
function validateDateRange() {
    const from = dashboardState.filters.dateFrom;
    const to = dashboardState.filters.dateTo;
    const valid = Boolean(from && to && from <= to);

    elements.dateFrom.setCustomValidity(valid ? "" : "La fecha inicial no puede ser posterior a la fecha final.");
    elements.dateTo.setCustomValidity(valid ? "" : "La fecha final no puede ser anterior a la fecha inicial.");
    return valid;
}

function renderDashboard() {
    console.log("[DIAGTI] Renderizando Dashboard completo");
    const empty = sistemasData.length === 0;

    elements.empty.hidden = !empty;
    elements.content.hidden = empty;

    renderKpis();
    renderValidationChart();
    renderCriticalityChart();

    if (!empty) {
        renderTable();
    }
}

function updateFiltersFromControls() {
    dashboardState.filters.dateFrom = elements.dateFrom.value;
    dashboardState.filters.dateTo = elements.dateTo.value;
    dashboardState.filters.area = elements.area.value;
    dashboardState.filters.criticality = elements.criticality.value;
    dashboardState.filters.validation = elements.validation.value;
    dashboardState.filters.search = elements.search.value;
    dashboardState.page = 1;
    recargarDatos();
}

async function recargarDatos() {
    const area = dashboardState.filters.area;
    const criticality = dashboardState.filters.criticality;
    const validation = dashboardState.filters.validation;
    const search = dashboardState.filters.search;

    try {
        await Promise.all([
            cargarKPIs().then(() => {}),
            cargarResumenValidacion().then(() => {}),
            cargarCriticidades().then(() => {}),
            cargarSistemas(area, criticality, validation, search).then(() => {})
        ]);
        renderDashboard();
    } catch (error) {
        console.error("Error recargando datos:", error);
        renderDashboard();
    }
}

function resetFilters() {
    elements.dateFrom.value = "2025-01-01";
    elements.dateTo.value = "2026-12-31";
    elements.area.value = "all";
    elements.criticality.value = "all";
    elements.validation.value = "all";
    elements.search.value = "";
    updateFiltersFromControls();
}

/* ============================================================
   EVENT LISTENERS
============================================================ */
function bindEvents() {
    [elements.dateFrom, elements.dateTo, elements.area, elements.criticality, elements.validation].forEach((control) => {
        if (control) control.addEventListener("change", updateFiltersFromControls);
    });

    let searchTimer;
    if (elements.search) {
        elements.search.addEventListener("input", () => {
            window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(updateFiltersFromControls, 180);
        });
    }

    if (elements.reset) elements.reset.addEventListener("click", resetFilters);
    if (elements.emptyReset) elements.emptyReset.addEventListener("click", resetFilters);

    if (elements.validationChart) {
        elements.validationChart.addEventListener("click", (event) => {
            const button = event.target.closest("[data-validation-summary]");
            if (!button) return;
            dashboardState.validationSummarySelection = button.dataset.validationSummary;
            renderValidationChart();
        });
    }

    if (elements.criticalityChart) {
        elements.criticalityChart.addEventListener("click", (event) => {
            const button = event.target.closest("[data-criticality]");
            if (!button) return;
            const selected = button.dataset.criticality;
            elements.criticality.value = dashboardState.filters.criticality === selected ? "all" : selected;
            updateFiltersFromControls();
        });
    }

    if (elements.clearCriticality) {
        elements.clearCriticality.addEventListener("click", () => {
            elements.criticality.value = "all";
            updateFiltersFromControls();
        });
    }

    if (elements.pageSize) {
        elements.pageSize.addEventListener("change", () => {
            dashboardState.pageSize = Number(elements.pageSize.value) || 10;
            dashboardState.page = 1;
            renderTable();
        });
    }

    if (elements.previous) {
        elements.previous.addEventListener("click", () => {
            if (dashboardState.page > 1) {
                dashboardState.page = Math.max(1, dashboardState.page - 1);
                renderTable();
            }
        });
    }

    if (elements.next) {
        elements.next.addEventListener("click", () => {
            dashboardState.page += 1;
            renderTable();
        });
    }

    if (elements.tableBody) {
        elements.tableBody.addEventListener("click", (event) => {
            const button = event.target.closest("[data-system-code]");
            if (button) showSystemDetail(button.dataset.systemCode);
        });
    }

    if (elements.dialogClose) {
        elements.dialogClose.addEventListener("click", () => {
            if (elements.dialog) elements.dialog.close();
        });
    }

    if (elements.dialog) {
        elements.dialog.addEventListener("click", (event) => {
            if (event.target === elements.dialog) elements.dialog.close();
        });
    }
}

/* ============================================================
   CACHE DE ELEMENTOS DOM
============================================================ */
function cacheElements() {
    elements.dateFrom = document.getElementById("filter-date-from");
    elements.dateTo = document.getElementById("filter-date-to");
    elements.area = document.getElementById("filter-area");
    elements.criticality = document.getElementById("filter-criticality");
    elements.validation = document.getElementById("filter-validation");
    elements.search = document.getElementById("filter-search");
    elements.reset = document.getElementById("reset-dashboard-filters");
    elements.emptyReset = document.getElementById("empty-reset-filters");
    elements.empty = document.getElementById("dashboard-empty");
    elements.content = document.getElementById("dashboard-content");

    elements.kpiTotal = document.getElementById("kpi-total-systems");
    elements.kpiValidated = document.getElementById("kpi-validated");
    elements.kpiObserved = document.getElementById("kpi-observed");
    elements.kpiPending = document.getElementById("kpi-pending");
    elements.kpiValidatedPercentage = document.getElementById("kpi-validated-percentage");
    elements.kpiObservedPercentage = document.getElementById("kpi-observed-percentage");
    elements.kpiPendingPercentage = document.getElementById("kpi-pending-percentage");

    elements.validationTotal = document.getElementById("validation-total");
    elements.validationChart = document.getElementById("validation-chart");
    elements.criticalityChart = document.getElementById("criticality-chart");
    elements.clearCriticality = document.getElementById("clear-criticality-selection");
    elements.tableBody = document.getElementById("priority-table-body");
    elements.pageSize = document.getElementById("priority-page-size");
    elements.paginationSummary = document.getElementById("priority-pagination-summary");
    elements.pageIndicator = document.getElementById("priority-page-indicator");
    elements.previous = document.getElementById("priority-previous");
    elements.next = document.getElementById("priority-next");
    elements.dialog = document.getElementById("system-detail-dialog");
    elements.dialogTitle = document.getElementById("dialog-system-title");
    elements.dialogContent = document.getElementById("dialog-system-content");
    elements.dialogClose = document.getElementById("dialog-close");
}

/* ============================================================
   INICIALIZACIÓN
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DIAGTI] Inicializando Dashboard Ejecutivo...");
    cacheElements();
    bindEvents();

    cargarAreasFiltro();
    cargarCriticidadesFiltro();

    try {
        await Promise.all([
            cargarKPIs().then(() => {}),
            cargarResumenValidacion().then(() => {}),
            cargarCriticidades().then(() => {}),
            cargarSistemas('all', 'all', 'all', '').then(() => {})
        ]);
        renderDashboard();
    } catch (error) {
        console.error("Error en la carga inicial:", error);
        renderDashboard();
    }
});
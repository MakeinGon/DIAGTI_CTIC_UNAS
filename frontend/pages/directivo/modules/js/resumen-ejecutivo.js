"use strict";

/* DIAGTI CTIC UNAS · Dashboard Ejecutivo V1.3
   Fuente de datos: módulo de Infraestructura de la rama de Carlos Rojas.
   Los estados Nuevo, Borrador, Enviado y Corregido se agrupan como Pendiente
   para la lectura ejecutiva del Usuario Directivo. */

const AREA_LABELS = Object.freeze({
    infraestructura: "Infraestructura TI"
});

const VALIDATION_LABELS = Object.freeze({
    observado: "Observado",
    validado: "Validado",
    pendiente: "Pendiente"
});

const CRITICALITY_LABELS = Object.freeze({
    critica: "Crítica",
    alta: "Alta",
    media: "Media",
    baja: "Baja"
});

const VALIDATION_COLORS = Object.freeze({
    validado: "#1abb9c",
    observado: "#e7a52d",
    pendiente: "#5f88a8"
});

// Resumen de validación de los 10 sistemas de Infraestructura TI.
const INSTITUTIONAL_VALIDATION_SUMMARY = Object.freeze({
    validado: 1,
    observado: 5,
    pendiente: 4
});

const CRITICALITY_COLORS = Object.freeze({
    critica: "#cf2d35",
    alta: "#e49a18",
    media: "#4f7fa4",
    baja: "#1abb9c"
});

const CRITICALITY_ORDER = Object.freeze(["critica", "alta", "media", "baja"]);
const CRITICALITY_RANK = Object.freeze({ critica: 4, alta: 3, media: 2, baja: 1 });

const SYSTEM_CATALOG = Object.freeze([
    {
        code: "SIS-MAT-01",
        name: "Sistema de Matrícula",
        area: "infraestructura",
        type: "VM Proxmox",
        exposure: "Intranet",
        sourceStatus: "Validado",
        validation: "validado",
        criticality: "media",
        activityDate: null,
        alert: "Seguimiento preventivo",
        detail: "Sistema validado en el módulo de Infraestructura.",
        recommendation: "Mantener el seguimiento técnico y la evidencia de operación."
    },
    {
        code: "SIS-DOC-02",
        name: "Documenta",
        area: "infraestructura",
        type: "Docker",
        exposure: "Internet",
        sourceStatus: "Observado",
        validation: "observado",
        criticality: "alta",
        activityDate: "2026-07-11",
        alert: "Falta evidencia SSL y política de backup",
        detail: "Falta adjuntar la evidencia del certificado SSL y explicar la política de backup.",
        recommendation: "Adjuntar el certificado SSL y documentar la política de respaldo."
    },
    {
        code: "SIS-VEN-03",
        name: "Registro de Ventas",
        area: "infraestructura",
        type: "Servidor físico",
        exposure: "Red local",
        sourceStatus: "Borrador",
        validation: "pendiente",
        criticality: "critica",
        activityDate: null,
        alert: "Registro técnico incompleto",
        detail: "El sistema permanece en estado Borrador.",
        recommendation: "Completar los datos técnicos y enviar el registro a validación."
    },
    {
        code: "SIS-BIB-04",
        name: "Biblioteca Virtual",
        area: "infraestructura",
        type: "VM Proxmox",
        exposure: "Internet",
        sourceStatus: "Corregido",
        validation: "pendiente",
        criticality: "media",
        activityDate: null,
        alert: "Corrección pendiente de validación",
        detail: "El registro fue corregido y espera una nueva validación.",
        recommendation: "Revisar la corrección presentada y cerrar la validación."
    },
    {
        code: "SIS-RRH-05",
        name: "Control de Personal",
        area: "infraestructura",
        type: "Docker",
        exposure: "Intranet",
        sourceStatus: "Enviado",
        validation: "pendiente",
        criticality: "baja",
        activityDate: null,
        alert: "Enviado para validación",
        detail: "El registro fue enviado y aún no cuenta con resultado de validación.",
        recommendation: "Realizar la revisión técnica del registro enviado."
    },
    {
        code: "SIS-MSA-06",
        name: "Mesa de Servicios TI",
        area: "infraestructura",
        type: "Sin registrar",
        exposure: "Sin registrar",
        sourceStatus: "Nuevo",
        validation: "pendiente",
        criticality: "media",
        activityDate: null,
        alert: "Información técnica pendiente",
        detail: "La plataforma y la exposición todavía figuran sin registrar.",
        recommendation: "Completar la plataforma, exposición y demás datos técnicos."
    },
    {
        code: "SIS-PAG-07",
        name: "Portal de Pagos",
        area: "infraestructura",
        type: "VM Proxmox",
        exposure: "Internet",
        sourceStatus: "Observado",
        validation: "observado",
        criticality: "alta",
        activityDate: "2026-07-12",
        alert: "Inconsistencia en la IP pública",
        detail: "La dirección IP pública registrada no coincide con el servidor desplegado.",
        recommendation: "Corregir la IP registrada y adjuntar evidencia de la configuración de red."
    },
    {
        code: "SIS-ADM-08",
        name: "Gestión Administrativa",
        area: "infraestructura",
        type: "Servidor físico",
        exposure: "Intranet",
        sourceStatus: "Observado",
        validation: "observado",
        criticality: "media",
        activityDate: "2026-07-12",
        alert: "Backups automáticos no evidenciados",
        detail: "No se evidenció el uso de copias de seguridad automáticas ni su frecuencia.",
        recommendation: "Documentar la automatización y frecuencia de los respaldos."
    },
    {
        code: "SIS-INV-09",
        name: "Sistema de Investigación",
        area: "infraestructura",
        type: "Docker",
        exposure: "Internet",
        sourceStatus: "Observado",
        validation: "observado",
        criticality: "alta",
        activityDate: "2026-07-13",
        alert: "Certificado SSL/TLS no vigente",
        detail: "El dominio funciona sin certificado SSL/TLS vigente.",
        recommendation: "Actualizar el certificado y adjuntar la evidencia correspondiente."
    },
    {
        code: "SIS-COM-10",
        name: "Comedor Universitario",
        area: "infraestructura",
        type: "VM Proxmox",
        exposure: "Intranet",
        sourceStatus: "Observado",
        validation: "observado",
        criticality: "media",
        activityDate: "2026-07-13",
        alert: "Proxy reverso y CI/CD sin documentar",
        detail: "Falta documentar el proxy reverso y el mecanismo CI/CD utilizado para producción.",
        recommendation: "Documentar el proxy reverso y el flujo CI/CD de producción."
    }
]);

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

function systemMatchesDateRange(system) {
    if (!system.activityDate) return true;
    return system.activityDate >= dashboardState.filters.dateFrom
        && system.activityDate <= dashboardState.filters.dateTo;
}

function matchesCommonFilters(system, includeCriticality = true) {
    const filters = dashboardState.filters;
    if (!systemMatchesDateRange(system)) return false;
    if (filters.area !== "all" && system.area !== filters.area) return false;
    if (filters.validation !== "all" && system.validation !== filters.validation) return false;
    if (includeCriticality && filters.criticality !== "all" && system.criticality !== filters.criticality) return false;

    if (filters.search) {
        const haystack = normalizeText(`${system.code} ${system.name} ${system.type} ${system.exposure}`);
        if (!haystack.includes(normalizeText(filters.search))) return false;
    }

    return true;
}

function getFilteredSystems() {
    return SYSTEM_CATALOG.filter((system) => matchesCommonFilters(system, true));
}

function getCriticalityBaseSystems() {
    return SYSTEM_CATALOG.filter((system) => matchesCommonFilters(system, false));
}

function getValidationCounts(systems) {
    return systems.reduce((counts, system) => {
        counts[system.validation] += 1;
        return counts;
    }, { validado: 0, observado: 0, pendiente: 0 });
}

function getCriticalityCounts(systems) {
    return systems.reduce((counts, system) => {
        counts[system.criticality] += 1;
        return counts;
    }, { critica: 0, alta: 0, media: 0, baja: 0 });
}

function renderKpis(systems) {
    const counts = getValidationCounts(systems);
    const total = systems.length;

    elements.kpiTotal.textContent = String(total);
    elements.kpiValidated.textContent = String(counts.validado);
    elements.kpiObserved.textContent = String(counts.observado);
    elements.kpiPending.textContent = String(counts.pendiente);
    elements.kpiValidatedPercentage.textContent = `${percent(counts.validado, total)}%`;
    elements.kpiObservedPercentage.textContent = `${percent(counts.observado, total)}%`;
    elements.kpiPendingPercentage.textContent = `${percent(counts.pendiente, total)}%`;
}

function renderValidationChart() {
    const counts = INSTITUTIONAL_VALIDATION_SUMMARY;
    const total = counts.validado + counts.observado + counts.pendiente;
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

    const selectedCount = counts[selected];
    const selectedPercent = percent(selectedCount, total);
    const selectedLabel = VALIDATION_LABELS[selected].toLowerCase();

    const legend = ["validado", "observado", "pendiente"].map((status) => `
        <button type="button" class="executive-chart-button" data-validation-summary="${status}" aria-pressed="${selected === status}">
            <span class="health-legend__dot" style="background:${VALIDATION_COLORS[status]}"></span>
            <span class="health-legend__label">${VALIDATION_LABELS[status]}</span>
            <strong>${counts[status]}</strong>
            <span class="health-legend__meta">${percent(counts[status], total)}% del total</span>
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
    const systems = getCriticalityBaseSystems();
    const counts = getCriticalityCounts(systems);
    const total = systems.length;
    const maxValue = Math.max(1, ...Object.values(counts));

    elements.criticalityChart.innerHTML = CRITICALITY_ORDER.map((criticality) => {
        const count = counts[criticality];
        const width = (count / maxValue) * 100;
        const active = dashboardState.filters.criticality === criticality;
        const noun = count === 1 ? "sistema" : "sistemas";

        return `
            <button type="button" class="criticality-row ${active ? "is-active" : ""}" data-criticality="${criticality}" aria-pressed="${active}">
                <span class="criticality-row__label">${CRITICALITY_LABELS[criticality]}</span>
                <span class="criticality-row__track">
                    <span class="criticality-row__bar" style="width:${width}%;background:${CRITICALITY_COLORS[criticality]}"></span>
                </span>
                <span class="criticality-row__value">${count} ${noun}<small>${percent(count, total)}%</small></span>
            </button>
        `;
    }).join("");

    elements.clearCriticality.hidden = dashboardState.filters.criticality === "all";
}

function sortedSystems(systems) {
    return [...systems].sort((a, b) => {
        const criticalityDifference = CRITICALITY_RANK[b.criticality] - CRITICALITY_RANK[a.criticality];
        if (criticalityDifference !== 0) return criticalityDifference;
        return a.name.localeCompare(b.name, "es");
    });
}

function renderTable(systems) {
    const ordered = sortedSystems(systems);
    const totalPages = Math.max(1, Math.ceil(ordered.length / dashboardState.pageSize));
    dashboardState.page = Math.min(dashboardState.page, totalPages);

    const start = (dashboardState.page - 1) * dashboardState.pageSize;
    const pageRows = ordered.slice(start, start + dashboardState.pageSize);

    if (!pageRows.length) {
        elements.tableBody.innerHTML = `<tr><td colspan="7">No existen sistemas para los filtros seleccionados.</td></tr>`;
    } else {
        elements.tableBody.innerHTML = pageRows.map((system) => `
            <tr>
                <td><strong>${escapeHTML(system.code)}</strong></td>
                <td class="executive-table__system"><strong>${escapeHTML(system.name)}</strong><span>${escapeHTML(system.type)}</span></td>
                <td>${escapeHTML(AREA_LABELS[system.area] || system.area)}</td>
                <td>${escapeHTML(system.alert)}</td>
                <td><span class="executive-status-badge executive-status-badge--${system.criticality}">${CRITICALITY_LABELS[system.criticality]}</span></td>
                <td><span class="executive-status-badge executive-status-badge--${system.validation}">${VALIDATION_LABELS[system.validation]}</span></td>
                <td><button type="button" class="executive-table__detail-button" data-system-code="${escapeHTML(system.code)}">Ver detalle</button></td>
            </tr>
        `).join("");
    }

    const shownFrom = ordered.length ? start + 1 : 0;
    const shownTo = Math.min(start + dashboardState.pageSize, ordered.length);
    elements.paginationSummary.textContent = `Mostrando ${shownFrom}–${shownTo} de ${ordered.length} resultados`;
    elements.pageIndicator.textContent = `Página ${dashboardState.page} de ${totalPages}`;
    elements.previous.disabled = dashboardState.page <= 1;
    elements.next.disabled = dashboardState.page >= totalPages;
}

function validateDateRange() {
    const from = dashboardState.filters.dateFrom;
    const to = dashboardState.filters.dateTo;
    const valid = Boolean(from && to && from <= to);

    elements.dateFrom.setCustomValidity(valid ? "" : "La fecha inicial no puede ser posterior a la fecha final.");
    elements.dateTo.setCustomValidity(valid ? "" : "La fecha final no puede ser anterior a la fecha inicial.");
    return valid;
}

function renderDashboard() {
    const systems = validateDateRange() ? getFilteredSystems() : [];
    const empty = systems.length === 0;

    elements.empty.hidden = !empty;
    elements.content.hidden = empty;

    if (empty) return;

    renderKpis(systems);
    renderValidationChart();
    renderCriticalityChart();
    renderTable(systems);
}

function updateFiltersFromControls() {
    dashboardState.filters.dateFrom = elements.dateFrom.value;
    dashboardState.filters.dateTo = elements.dateTo.value;
    dashboardState.filters.area = elements.area.value;
    dashboardState.filters.criticality = elements.criticality.value;
    dashboardState.filters.validation = elements.validation.value;
    dashboardState.filters.search = elements.search.value;
    dashboardState.page = 1;
    renderDashboard();
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

function showSystemDetail(systemCode) {
    const system = SYSTEM_CATALOG.find((item) => item.code === systemCode);
    if (!system) return;

    elements.dialogTitle.textContent = system.name;
    elements.dialogContent.innerHTML = `
        <p><strong>Código:</strong> ${escapeHTML(system.code)}</p>
        <p><strong>Área:</strong> ${escapeHTML(AREA_LABELS[system.area] || system.area)}</p>
        <p><strong>Plataforma:</strong> ${escapeHTML(system.type)}</p>
        <p><strong>Exposición:</strong> ${escapeHTML(system.exposure)}</p>
        <p><strong>Estado original:</strong> ${escapeHTML(system.sourceStatus)}</p>
        <p><strong>Estado ejecutivo:</strong> ${escapeHTML(VALIDATION_LABELS[system.validation])}</p>
        <p><strong>Criticidad:</strong> ${escapeHTML(CRITICALITY_LABELS[system.criticality])}</p>
        <p><strong>Detalle:</strong> ${escapeHTML(system.detail)}</p>
        <p><strong>Recomendación:</strong> ${escapeHTML(system.recommendation)}</p>
    `;

    if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
    else elements.dialog.setAttribute("open", "");
}

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

function bindEvents() {
    [elements.dateFrom, elements.dateTo, elements.area, elements.criticality, elements.validation].forEach((control) => {
        control.addEventListener("change", updateFiltersFromControls);
    });

    let searchTimer;
    elements.search.addEventListener("input", () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(updateFiltersFromControls, 180);
    });

    elements.reset.addEventListener("click", resetFilters);
    elements.emptyReset.addEventListener("click", resetFilters);

    elements.validationChart.addEventListener("click", (event) => {
        const button = event.target.closest("[data-validation-summary]");
        if (!button) return;
        dashboardState.validationSummarySelection = button.dataset.validationSummary;
        renderValidationChart();
    });

    elements.criticalityChart.addEventListener("click", (event) => {
        const button = event.target.closest("[data-criticality]");
        if (!button) return;
        const selected = button.dataset.criticality;
        elements.criticality.value = dashboardState.filters.criticality === selected ? "all" : selected;
        updateFiltersFromControls();
    });

    elements.clearCriticality.addEventListener("click", () => {
        elements.criticality.value = "all";
        updateFiltersFromControls();
    });

    elements.pageSize.addEventListener("change", () => {
        dashboardState.pageSize = Number(elements.pageSize.value) || 10;
        dashboardState.page = 1;
        renderTable(getFilteredSystems());
    });

    elements.previous.addEventListener("click", () => {
        dashboardState.page = Math.max(1, dashboardState.page - 1);
        renderTable(getFilteredSystems());
    });

    elements.next.addEventListener("click", () => {
        dashboardState.page += 1;
        renderTable(getFilteredSystems());
    });

    elements.tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-system-code]");
        if (button) showSystemDetail(button.dataset.systemCode);
    });

    elements.dialogClose.addEventListener("click", () => elements.dialog.close());
    elements.dialog.addEventListener("click", (event) => {
        if (event.target === elements.dialog) elements.dialog.close();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindEvents();
    renderDashboard();
});

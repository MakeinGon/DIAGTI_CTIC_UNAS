/* ============================================================
   reportes-ejecutivos.component.js
   Fusión de: js/sidebar.js + js/reportes-ejecutivos.js
   ============================================================ */

/* ============================================================
   CERRAR SESIÓN — mismo comportamiento que el panel Administrador
   (el sidebar ahora es HTML estático por página, igual que admin;
   ya no hace falta generarlo ni inyectarlo por JS)
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

/* ---------- reportes-ejecutivos.js ---------- */
"use strict";



/* DIAGTI CTIC UNAS · Reportes Ejecutivos V1.4
   Exporta únicamente el reporte solicitado y respeta los filtros visibles. */

(() => {
    const form = document.getElementById("reports-filter-form");
    const emptyState = document.getElementById("reports-empty-state");
    const reportTypeFilter = document.getElementById("filter-report-type");
    const areaFilter = document.getElementById("filter-report-area");
    const criticalityFilter = document.getElementById("filter-report-criticality");
    const riskFilter = document.getElementById("filter-report-risk");
    const dateFromFilter = document.getElementById("filter-report-date-from");
    const dateToFilter = document.getElementById("filter-report-date-to");
    const reportSections = Array.from(document.querySelectorAll("[data-report-section]"));

    if (!form || !emptyState || !reportTypeFilter || !areaFilter || !criticalityFilter
        || !riskFilter || !dateFromFilter || !dateToFilter || reportSections.length === 0) {
        console.error("[DIAGTI] Faltan elementos requeridos en Reportes Ejecutivos.");
        return;
    }

    const FILTERS = [
        { datasetKey: "area", control: areaFilter },
        { datasetKey: "criticality", control: criticalityFilter },
        { datasetKey: "risk", control: riskFilter }
    ];

    const getRows = (section) => Array.from(section.querySelectorAll("tbody tr"));

    const activeFilters = () => FILTERS
        .map(({ datasetKey, control }) => ({ datasetKey, value: control.value }))
        .filter(({ value }) => value !== "");

    const supportsFilters = (rows, filters) => filters.every(({ datasetKey }) =>
        rows.some((row) => Object.prototype.hasOwnProperty.call(row.dataset, datasetKey))
    );

    const matchesDateRange = (row) => {
        const rowDate = row.dataset.date;
        if (!rowDate) return true; // No se inventa una fecha inexistente.

        const from = dateFromFilter.value || "2025-01-01";
        const to = dateToFilter.value || "2026-12-31";
        return rowDate >= from && rowDate <= to;
    };

    const matchesFilters = (row, filters) =>
        matchesDateRange(row)
        && filters.every(({ datasetKey, value }) => row.dataset[datasetKey] === value);

    const showAllRows = (rows) => rows.forEach((row) => { row.hidden = false; });

    const applyFilters = () => {
        if (dateFromFilter.value && dateToFilter.value && dateFromFilter.value > dateToFilter.value) {
            dateToFilter.value = dateFromFilter.value;
        }

        const selectedType = reportTypeFilter.value;
        const filters = activeFilters();
        let visibleSections = 0;

        reportSections.forEach((section) => {
            const rows = getRows(section);
            const typeMatches = selectedType === "" || section.dataset.reportSection === selectedType;

            if (!typeMatches || !supportsFilters(rows, filters)) {
                showAllRows(rows);
                section.hidden = true;
                return;
            }

            let visibleRows = 0;
            rows.forEach((row) => {
                const visible = matchesFilters(row, filters);
                row.hidden = !visible;
                if (visible) visibleRows += 1;
            });

            section.hidden = visibleRows === 0;
            if (visibleRows > 0) visibleSections += 1;
        });

        emptyState.hidden = visibleSections > 0;
    };

    const cleanText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const slug = (value) => cleanText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const today = () => new Date().toISOString().slice(0, 10);

    const visibleTableClone = (section) => {
        const source = section.querySelector("table");
        if (!source) return null;
        const clone = source.cloneNode(true);
        clone.querySelectorAll("tbody tr").forEach((row, index) => {
            const original = source.querySelectorAll("tbody tr")[index];
            if (original?.hidden) row.remove();
        });
        return clone;
    };

    const reportFilterSummary = () => {
        const values = [];
        if (areaFilter.value) values.push(`Área: ${areaFilter.options[areaFilter.selectedIndex].text}`);
        if (criticalityFilter.value) values.push(`Criticidad: ${criticalityFilter.options[criticalityFilter.selectedIndex].text}`);
        if (riskFilter.value) values.push(`Nivel de riesgo: ${riskFilter.options[riskFilter.selectedIndex].text}`);
        values.push(`Rango: ${dateFromFilter.value || "Sin inicio"} a ${dateToFilter.value || "Sin fin"}`);
        return values.join(" · ");
    };

    const exportPdf = (section) => {
        const table = visibleTableClone(section);
        if (!table || table.querySelectorAll("tbody tr").length === 0) {
            window.alert("No existen registros visibles para exportar.");
            return;
        }

        const title = cleanText(section.querySelector("h2")?.textContent || "Reporte ejecutivo");
        const description = cleanText(section.querySelector(".section-description")?.textContent || "");
        const popup = window.open("", "_blank", "width=1100,height=760");
        if (!popup) {
            window.alert("El navegador bloqueó la ventana de exportación. Habilite las ventanas emergentes para este sitio.");
            return;
        }

        try { popup.opener = null; } catch (_) { /* Navegador sin soporte */ }
        popup.document.open();
        popup.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title>
        <style>
            @page { size: A4 landscape; margin: 14mm; }
            body { font-family: Arial, sans-serif; color: #172033; margin: 0; }
            h1 { color: #0f639f; margin: 0 0 8px; font-size: 24px; }
            p { margin: 4px 0; color: #4d5b6c; font-size: 12px; }
            .meta { margin: 14px 0 18px; padding: 10px 12px; background: #f3f7fa; border: 1px solid #d8e2ea; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #d8e2ea; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #e8f3f9; color: #07598e; }
            .badge { font-weight: 700; }
        </style></head><body>
        <h1>${title}</h1><p>${description}</p>
        <div class="meta"><strong>Generado:</strong> ${new Date().toLocaleString("es-PE")}<br>
        <strong>Filtros:</strong> ${reportFilterSummary()}</div>
        ${table.outerHTML}
        <script>window.addEventListener('load',()=>{window.focus();window.print();});<\/script>
        </body></html>`);
        popup.document.close();
    };

    const csvCell = (value) => `"${cleanText(value).replaceAll('"', '""')}"`;

    const exportCsv = (section) => {
        const table = section.querySelector("table");
        if (!table) return;

        const rows = Array.from(table.querySelectorAll("tr"))
            .filter((row) => !row.hidden)
            .map((row) => Array.from(row.querySelectorAll("th,td"))
                .map((cell) => csvCell(cell.textContent))
                .join(";"));

        if (rows.length <= 1) {
            window.alert("No existen registros visibles para exportar.");
            return;
        }

        const title = section.querySelector("h2")?.textContent?.trim() || "reporte-ejecutivo";
        const blob = new Blob([`\uFEFF${rows.join("\r\n")}`], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${slug(title) || "reporte-ejecutivo"}-${today()}.csv`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        applyFilters();
    });

    form.addEventListener("reset", () => {
        window.requestAnimationFrame(applyFilters);
    });

    [dateFromFilter, dateToFilter].forEach((control) => {
        control.addEventListener("change", applyFilters);
    });

    document.addEventListener("click", (event) => {
        const pdfButton = event.target.closest('[data-action="export-pdf"][data-report-id]');
        if (pdfButton) {
            const section = document.getElementById(pdfButton.dataset.reportId);
            if (section) exportPdf(section);
            return;
        }

        const csvButton = event.target.closest('[data-action="export-excel"][data-report-id]');
        if (csvButton) {
            const section = document.getElementById(csvButton.dataset.reportId);
            if (section) exportCsv(section);
        }
    });

    /* ============================================================
       CONEXIÓN CON EL BACKEND
       Se generan las filas <tr> de las 3 tablas con los MISMOS
       atributos data-area / data-criticality / data-risk / data-date
       que ya usan applyFilters(), exportPdf() y exportCsv() de arriba,
       para no tener que tocar nada de esa lógica.
       ============================================================ */
    const API_BASE = "http://localhost:8080/api/director/reportes";

    const capitalizar = (valor) => {
        const texto = cleanText(valor).toLowerCase();
        return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
    };

    // Criticidad -> nivel de riesgo (alto/medio/bajo), usado en las 3 tablas
    const RIESGO_POR_CRITICIDAD = { CRITICA: "alto", ALTA: "alto", MEDIA: "medio", BAJA: "bajo" };

    // Badge de criticidad: la tabla de Inventario usa la variante masculina
    // ("Alto", "Medio") y la de Riesgos la variante femenina ("Alta", "Media"),
    // igual que en el diseño original — se respeta tal cual.
    const CRITICIDAD_BADGE_INVENTARIO = {
        CRITICA: { texto: "Crítica", clase: "badge-danger" },
        ALTA: { texto: "Alto", clase: "badge-danger" },
        MEDIA: { texto: "Medio", clase: "badge-warning" },
        BAJA: { texto: "Baja", clase: "badge-success" }
    };
    const CRITICIDAD_BADGE_RIESGOS = {
        CRITICA: { texto: "Crítica", clase: "badge-danger" },
        ALTA: { texto: "Alta", clase: "badge-danger" },
        MEDIA: { texto: "Media", clase: "badge-warning" },
        BAJA: { texto: "Baja", clase: "badge-success" }
    };

    const ESTADO_VALIDACION_BADGE = {
        VALIDADO: { texto: "Validado", clase: "badge-success" },
        OBSERVADO: { texto: "Observado", clase: "badge-warning" },
        PENDIENTE: { texto: "Pendiente", clase: "badge-neutral" }
    };

    const ESTADO_RIESGO_BADGE = {
        PENDIENTE: { texto: "Observado", clase: "badge-warning" },
        SUBSANADA: { texto: "Subsanado", clase: "badge-success" },
        SUBSANADO: { texto: "Subsanado", clase: "badge-success" }
    };

    const badgeHtml = (mapa, valorCrudo, fallbackClase = "badge-neutral") => {
        const clave = cleanText(valorCrudo).toUpperCase();
        const item = mapa[clave] || { texto: capitalizar(valorCrudo) || "Sin dato", clase: fallbackClase };
        return `<span class="badge ${item.clase}">${item.texto}</span>`;
    };

    const crearFila = (celdasHtml, dataset) => {
        const tr = document.createElement("tr");
        Object.entries(dataset).forEach(([clave, valor]) => {
            if (valor !== null && valor !== undefined && valor !== "") tr.dataset[clave] = valor;
        });
        tr.innerHTML = celdasHtml.join("");
        return tr;
    };

    const pintarInventario = (items) => {
        const tbody = document.querySelector("#table-report-inventory tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        items.forEach((item) => {
            const criticidadClave = cleanText(item.criticidad).toUpperCase();
            const fila = crearFila([
                `<td><strong>${cleanText(item.codigo)}</strong></td>`,
                `<td><strong>${cleanText(item.nombre)}</strong></td>`,
                `<td>${cleanText(item.tipo) || "No especificado"}</td>`,
                `<td>${badgeHtml(CRITICIDAD_BADGE_INVENTARIO, item.criticidad)}</td>`,
                `<td>${badgeHtml(ESTADO_VALIDACION_BADGE, item.estadoValidacion)}</td>`,
                `<td>${cleanText(item.estadoOperativo) || "No reportado"}</td>`
            ], {
                area: slug(item.area),
                criticality: criticidadClave.toLowerCase(),
                risk: RIESGO_POR_CRITICIDAD[criticidadClave] || ""
            });
            tbody.appendChild(fila);
        });
    };

    const pintarRiesgos = (items) => {
        const tbody = document.querySelector("#table-report-risks tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        items.forEach((item) => {
            const criticidadClave = cleanText(item.criticidad).toUpperCase();
            const fila = crearFila([
                `<td><strong>${cleanText(item.codigoSistema)}</strong></td>`,
                `<td>${cleanText(item.riesgo)}</td>`,
                `<td>${cleanText(item.categoria) || "No reportada"}</td>`,
                `<td>${badgeHtml(ESTADO_RIESGO_BADGE, item.estado)}</td>`,
                `<td>${badgeHtml(CRITICIDAD_BADGE_RIESGOS, item.criticidad)}</td>`
            ], {
                area: slug(item.area),
                criticality: criticidadClave.toLowerCase(),
                risk: RIESGO_POR_CRITICIDAD[criticidadClave] || "",
                date: item.fechaIso || ""
            });
            tbody.appendChild(fila);
        });
    };

    const pintarValidacion = (items) => {
        const tbody = document.querySelector("#table-report-validation tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        items.forEach((item) => {
            const criticidadClave = cleanText(item.criticidad).toUpperCase();
            const fila = crearFila([
                `<td><strong>${cleanText(item.codigo)}</strong></td>`,
                `<td><strong>${cleanText(item.nombre)}</strong></td>`,
                `<td>${badgeHtml(ESTADO_VALIDACION_BADGE, item.estadoValidacion)}</td>`,
                `<td>${cleanText(item.fechaValidacion) || "No reportada"}</td>`,
                `<td>${cleanText(item.area)}</td>`
            ], {
                area: slug(item.area),
                criticality: criticidadClave.toLowerCase(),
                risk: RIESGO_POR_CRITICIDAD[criticidadClave] || "",
                date: item.fechaValidacionIso || ""
            });
            tbody.appendChild(fila);
        });
    };

    const mostrarErrorCarga = () => {
        // Igual que en Roles/Catálogos/Usuarios: si el backend falla, las
        // tablas quedan vacías (el estado "sin resultados" ya existente se
        // encarga de avisar), sin bloquear la pantalla con un alert().
        console.error("[DIAGTI] No se pudieron cargar los reportes desde el backend.");
        [
            "#table-report-inventory tbody",
            "#table-report-risks tbody",
            "#table-report-validation tbody"
        ].forEach((selector) => {
            const tbody = document.querySelector(selector);
            if (tbody) tbody.innerHTML = "";
        });
    };

    const cargarReportes = () => Promise.all([
        fetch(`${API_BASE}/inventario`).then((r) => (r.ok ? r.json() : Promise.reject(r))),
        fetch(`${API_BASE}/riesgos`).then((r) => (r.ok ? r.json() : Promise.reject(r))),
        fetch(`${API_BASE}/validacion`).then((r) => (r.ok ? r.json() : Promise.reject(r)))
    ])
        .then(([inventario, riesgos, validacion]) => {
            pintarInventario(inventario || []);
            pintarRiesgos(riesgos || []);
            pintarValidacion(validacion || []);
        })
        .catch(mostrarErrorCarga)
        .finally(applyFilters);

    cargarReportes();
})();

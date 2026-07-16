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

    applyFilters();
})();

/* ============================================================
   reportes-ejecutivos.component.js
   Fusión de: js/sidebar.js + js/reportes-ejecutivos.js
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

/* ---------- reportes-ejecutivos.js ---------- */
"use strict";

/* DIAGTI CTIC UNAS · Reportes Ejecutivos V1.5
   Con carga dinámica de catálogos desde el backend. */

(() => {
    const form = document.getElementById("reports-filter-form");
    const emptyState = document.getElementById("reports-empty-state");
    const reportTypeFilter = document.getElementById("filter-report-type");
    const areaFilter = document.getElementById("filter-report-area");
    const criticalityFilter = document.getElementById("filter-report-criticality");
    const riskFilter = document.getElementById("filter-report-risk");
    const validationStatusFilter = document.getElementById("filter-report-validation-status");
    const dateFromFilter = document.getElementById("filter-report-date-from");
    const dateToFilter = document.getElementById("filter-report-date-to");
    const reportSections = Array.from(document.querySelectorAll("[data-report-section]"));

    if (!form || !emptyState || !reportTypeFilter || !areaFilter || !criticalityFilter
        || !riskFilter || !dateFromFilter || !dateToFilter || reportSections.length === 0) {
        console.error("[DIAGTI] Faltan elementos requeridos en Reportes Ejecutivos.");
        return;
    }

    /* ============================================================
       CONFIGURACIÓN DE API
    ============================================================ */
    const API_BASE = (typeof DIAGTI_DIRECTOR_API !== "undefined")
        ? DIAGTI_DIRECTOR_API.reportes
        : "/api/director/reportes";

    /* ============================================================
       FUNCIONES AUXILIARES
    ============================================================ */
    const cleanText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const slug = (value) => cleanText(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const capitalizar = (valor) => {
        const texto = cleanText(valor).toLowerCase();
        return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
    };
    const today = () => new Date().toISOString().slice(0, 10);

    /* ============================================================
       CARGA DE CATÁLOGOS PARA FILTROS
    ============================================================ */
    function cargarCatalogosFiltros() {
        // Áreas
        fetch(`${API_BASE}/catalogos/areas`)
            .then(res => res.json())
            .then(data => {
                const select = areaFilter;
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

        // Criticidades
        fetch(`${API_BASE}/catalogos/criticidades`)
            .then(res => res.json())
            .then(data => {
                const select = criticalityFilter;
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

        // Niveles de riesgo
        fetch(`${API_BASE}/catalogos/riesgos`)
            .then(res => res.json())
            .then(data => {
                const select = riskFilter;
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
            .catch(err => console.error("Error cargando niveles de riesgo:", err));
    }

    /* ============================================================
       CARGA DE ESTADOS DE VALIDACIÓN PARA FILTROS (NUEVO)
    ============================================================ */
    function cargarEstadosValidacionFiltro() {
        const select = validationStatusFilter;
        if (!select) return;

        fetch(`${API_BASE}/catalogos/estados-validacion`)
            .then(res => res.json())
            .then(data => {
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
            .catch(err => console.error("Error cargando estados de validación:", err));
    }

    /* ============================================================
       MAPAS Y BADGES
    ============================================================ */
    const RIESGO_POR_CRITICIDAD = { CRITICA: "alto", ALTA: "alto", MEDIA: "medio", BAJA: "bajo" };

    const CRITICIDAD_BADGE_INVENTARIO = {
        CRITICA: { texto: "Crítica", clase: "badge-danger" },
        ALTA: { texto: "Alto", clase: "badge-danger" },
        MEDIA: { texto: "Medio", clase: "badge-warning" },
        BAJA: { texto: "Baja", clase: "badge-success" }
    };

    const NIVEL_RIESGO_BADGE = {
        BAJO: { texto: "Bajo", clase: "badge-success" },
        MEDIO: { texto: "Medio", clase: "badge-warning" },
        ALTO: { texto: "Alto", clase: "badge-danger" },
        CRITICO: { texto: "Crítico", clase: "badge-danger" }
    };

    const ESTADO_VALIDACION_BADGE = {
        VALIDADO: { texto: "Validado", clase: "badge-success" },
        OBSERVADO: { texto: "Observado", clase: "badge-warning" },
        PENDIENTE: { texto: "Pendiente", clase: "badge-neutral" },
        BORRADOR: { texto: "Borrador", clase: "badge-neutral" },
        ENVIADO: { texto: "Enviado", clase: "badge-info" },
        RECHAZADO: { texto: "Rechazado", clase: "badge-danger" },
        SUBSANADO: { texto: "Subsanado", clase: "badge-info" },
        CERRADO: { texto: "Cerrado", clase: "badge-neutral" },
        // Versión en minúsculas por si acaso
        validado: { texto: "Validado", clase: "badge-success" },
        observado: { texto: "Observado", clase: "badge-warning" },
        pendiente: { texto: "Pendiente", clase: "badge-neutral" },
        borrador: { texto: "Borrador", clase: "badge-neutral" },
        enviado: { texto: "Enviado", clase: "badge-info" },
        rechazado: { texto: "Rechazado", clase: "badge-danger" },
        subsanado: { texto: "Subsanado", clase: "badge-info" },
        cerrado: { texto: "Cerrado", clase: "badge-neutral" }
    };

    const ESTADO_RIESGO_BADGE = {
        ABIERTO: { texto: "Abierto", clase: "badge-warning" },
        EN_MITIGACION: { texto: "En mitigación", clase: "badge-info" },
        CONTROLADO: { texto: "Controlado", clase: "badge-success" },
        PENDIENTE: { texto: "Pendiente", clase: "badge-warning" },
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

    /* ============================================================
       PINTADO DE TABLAS
    ============================================================ */
    const pintarInventario = (items, catalogos) => {
        const tbody = document.querySelector("#table-report-inventory tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        const areaMap = {};
        if (catalogos && catalogos.areas) {
            catalogos.areas.forEach(a => areaMap[a.id] = a.valor);
        }

        items.forEach((item) => {
            const nombreArea = item.idAreaUsuario ? areaMap[item.idAreaUsuario] : item.area;
            const criticidadClave = cleanText(item.criticidad).toUpperCase();

            const fila = crearFila([
                `<td><strong>${cleanText(item.codigo)}</strong></td>`,
                `<td><strong>${cleanText(item.nombre)}</strong></td>`,
                `<td>${cleanText(item.tipo) || "No especificado"}</td>`,
                `<td>${badgeHtml(CRITICIDAD_BADGE_INVENTARIO, item.criticidad)}</td>`,
                `<td>${badgeHtml(ESTADO_VALIDACION_BADGE, item.estadoValidacion)}</td>`,
                `<td>${cleanText(item.estadoOperativo) || "No reportado"}</td>`
            ], {
                area: slug(nombreArea || item.area || ""),
                criticality: criticidadClave.toLowerCase(),
                risk: RIESGO_POR_CRITICIDAD[criticidadClave] || "",
                validation: slug(item.estadoValidacion)
            });
            tbody.appendChild(fila);
        });
    };

    const pintarRiesgos = (items) => {
        const tbody = document.querySelector("#table-report-risks tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        items.forEach((item) => {
            const nivelClave = cleanText(item.riesgoNivel || "MEDIO").toUpperCase();
            const fila = crearFila([
                `<td><strong>${cleanText(item.codigoSistema)}</strong></td>`,
                `<td>${cleanText(item.riesgo)}</td>`,
                `<td>${cleanText(item.categoria) || "No reportada"}</td>`,
                `<td>${badgeHtml(NIVEL_RIESGO_BADGE, item.riesgoNivel)}</td>`,
                `<td>${badgeHtml(ESTADO_RIESGO_BADGE, item.estado)}</td>`,
                `<td>${cleanText(item.area)}</td>`
            ], {
                area: slug(item.area || ""),
                risk: nivelClave.toLowerCase(),
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
            const fila = crearFila([
                `<td><strong>${cleanText(item.codigo)}</strong></td>`,
                `<td><strong>${cleanText(item.nombre)}</strong></td>`,
                `<td>${badgeHtml(ESTADO_VALIDACION_BADGE, item.estadoValidacion)}</td>`,
                `<td>${cleanText(item.fechaValidacion) || "No reportada"}</td>`,
                `<td>${cleanText(item.area)}</td>`
            ], {
                area: slug(item.area || ""),
                date: item.fechaValidacionIso || "",
                validation: slug(item.estadoValidacion)
            });
            tbody.appendChild(fila);
        });
    };

    const mostrarErrorCarga = () => {
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

    /* ============================================================
       CARGA DE REPORTES
    ============================================================ */
    const cargarReportes = () => {
        // Cargar catálogos para los filtros
        cargarCatalogosFiltros();
        cargarEstadosValidacionFiltro();  // ← NUEVO

        const urlInventario = `${API_BASE}/inventario?area=${areaFilter.value || ''}&criticidad=${criticalityFilter.value || ''}`;
        const urlRiesgos = `${API_BASE}/riesgos?area=${areaFilter.value || ''}&criticidad=${criticalityFilter.value || ''}`;
        const urlValidacion = `${API_BASE}/validacion?area=${areaFilter.value || ''}&estado=${validationStatusFilter.value || ''}`;

        Promise.all([
            fetch(urlInventario).then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch(urlRiesgos).then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch(urlValidacion).then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch(`${API_BASE}/catalogos/areas`).then((r) => (r.ok ? r.json() : Promise.reject(r)))
        ])
        .then(([inventario, riesgos, validacion, areas]) => {
            const catalogos = { areas };
            pintarInventario(inventario || [], catalogos);
            pintarRiesgos(riesgos || []);
            pintarValidacion(validacion || []);
            applyFilters();
        })
        .catch((error) => {
            console.error("Error cargando reportes:", error);
            mostrarErrorCarga();
            applyFilters();
        });
    };

    /* ============================================================
       FILTROS
    ============================================================ */
    const FILTERS = [
        { datasetKey: "area", control: areaFilter },
        { datasetKey: "criticality", control: criticalityFilter },
        { datasetKey: "risk", control: riskFilter },
        { datasetKey: "validation", control: validationStatusFilter }
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
        if (!rowDate) return true;
        const from = dateFromFilter.value || "2025-01-01";
        const to = dateToFilter.value || "2026-12-31";
        return rowDate >= from && rowDate <= to;
    };

    const matchesFilters = (row, filters) =>
        matchesDateRange(row) &&
        filters.every(({ datasetKey, value }) => row.dataset[datasetKey] === value);

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

    /* ============================================================
       EXPORTACIÓN
    ============================================================ */
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
        if (areaFilter.value) values.push(`Área: ${areaFilter.options[areaFilter.selectedIndex]?.text || areaFilter.value}`);
        if (criticalityFilter.value) values.push(`Criticidad: ${criticalityFilter.options[criticalityFilter.selectedIndex]?.text || criticalityFilter.value}`);
        if (riskFilter.value) values.push(`Nivel de riesgo: ${riskFilter.options[riskFilter.selectedIndex]?.text || riskFilter.value}`);
        if (validationStatusFilter.value) values.push(`Estado de validación: ${validationStatusFilter.options[validationStatusFilter.selectedIndex]?.text || validationStatusFilter.value}`);
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

    const exportCsv = (section) => {
        const table = section.querySelector("table");
        if (!table) return;

        const rows = Array.from(table.querySelectorAll("tr"))
            .filter((row) => !row.hidden)
            .map((row) => Array.from(row.querySelectorAll("th,td"))
                .map((cell) => `"${cleanText(cell.textContent).replaceAll('"', '""')}"`)
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

    /* ============================================================
       EVENT LISTENERS
    ============================================================ */
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        // Recargar desde backend con filtros actuales y luego aplicar filtros cliente.
        Promise.all([
            fetch(`${API_BASE}/inventario?area=${encodeURIComponent(areaFilter.value || '')}&criticidad=${encodeURIComponent(criticalityFilter.value || '')}`)
                .then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch(`${API_BASE}/riesgos?area=${encodeURIComponent(areaFilter.value || '')}&criticidad=${encodeURIComponent(criticalityFilter.value || '')}`)
                .then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch(`${API_BASE}/validacion?area=${encodeURIComponent(areaFilter.value || '')}&estado=${encodeURIComponent(validationStatusFilter.value || '')}`)
                .then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch(`${API_BASE}/catalogos/areas`).then((r) => (r.ok ? r.json() : Promise.reject(r)))
        ])
            .then(([inventario, riesgos, validacion, areas]) => {
                pintarInventario(inventario || [], { areas });
                pintarRiesgos(riesgos || []);
                pintarValidacion(validacion || []);
                applyFilters();
            })
            .catch((error) => {
                console.error("Error recargando reportes:", error);
                applyFilters();
            });
    });

    form.addEventListener("reset", () => {
        window.requestAnimationFrame(applyFilters);
    });

    [dateFromFilter, dateToFilter, validationStatusFilter].forEach((control) => {
        if (control) control.addEventListener("change", applyFilters);
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
       INICIALIZACIÓN
    ============================================================ */
    if (typeof diagtiDirectorAplicarPerfil === "function") {
        diagtiDirectorAplicarPerfil();
    }
    cargarReportes();

})();
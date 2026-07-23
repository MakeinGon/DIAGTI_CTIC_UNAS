/* ============================================================
   dashboard-riesgos.component.js (CORREGIDO - ÁREAS DESDE CATÁLOGO)
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

/* ---------- dashboard-riesgos.js ---------- */
"use strict";

const API_BASE = (typeof DIAGTI_DIRECTOR_API !== "undefined")
    ? DIAGTI_DIRECTOR_API.riesgos
    : "/api/director/riesgos";
const API_REPORTES = (typeof DIAGTI_DIRECTOR_API !== "undefined")
    ? DIAGTI_DIRECTOR_API.reportes
    : "/api/director/reportes";

// Almacenar catálogos para los filtros
let catalogos = {
    areas: []
};

const RISK_LABELS = Object.freeze({
    level: { 
        critico: "Crítico", 
        advertencia: "Medio", 
        controlado: "Bajo" 
    },
    status: { 
        abierto: "Abierto", 
        mitigacion: "En mitigación", 
        controlado: "Controlado",
        pendiente: "Pendiente",
        subsanado: "Subsanado",
        cerrado: "Cerrado"
    },
    probability: { 1: "Baja", 2: "Media", 3: "Alta" },
    impact: { 1: "Bajo", 2: "Medio", 3: "Alto" }
});

const RISK_COLORS = Object.freeze({ 
    critico: "#cf3333", 
    advertencia: "#e7a52d", 
    controlado: "#1abb9c" 
});

const state = {
    data: [], 
    filters: { 
        dateFrom: "2025-01-01", 
        dateTo: "2026-12-31", 
        area: "all", 
        category: "all", 
        level: "all", 
        status: "all", 
        search: "" 
    },
    flag: null, 
    sort: { key: "level", direction: "asc" }, 
    page: 1, 
    pageSize: 10, 
    loading: false
};
const el = {};
let searchTimer;

function normalize(value) { 
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); 
}

function escapeHTML(value) { 
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); 
}

function safeArray(value) { 
    return Array.isArray(value) ? value.filter(item => item && typeof item === "object") : []; 
}

function unique(values) { 
    return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "es")); 
}

function formatDate(value) { 
    const d = new Date(`${value}T00:00:00`); 
    return Number.isNaN(d.getTime()) ? "No disponible" : new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(d); 
}

function showState(name, message = "") {
    el.loading.hidden = name !== "loading";
    el.error.hidden = name !== "error";
    el.empty.hidden = name !== "empty";
    el.content.hidden = name !== "content";
    if (name === "error") el.errorMessage.textContent = message || "Error no identificado.";
}

async function cargarCatalogos() {
    try {
        // Cargar áreas desde el catálogo
        const response = await fetch(`${API_REPORTES}/catalogos/areas`);
        if (response.ok) {
            catalogos.areas = await response.json();
            console.log("[DIAGTI] Áreas del catálogo:", catalogos.areas.map(a => a.valor));
            poblarFiltroAreas();
        }
    } catch (err) {
        console.error("Error cargando catálogos:", err);
    }
}

function poblarFiltroAreas() {
    const select = el.filterArea;
    if (!select) return;
    const primeraOpcion = select.options[0];
    select.innerHTML = '';
    if (primeraOpcion) select.appendChild(primeraOpcion);
    catalogos.areas.forEach(item => {
        const option = document.createElement('option');
        option.value = normalize(item.valor);
        option.textContent = item.valor;
        select.appendChild(option);
    });
}

async function requestBackend() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(API_BASE, {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
            signal: controller.signal
        });
        if (!response.ok) throw new Error(`El servicio respondió con estado ${response.status}.`);
        return safeArray(await response.json());
    } finally { 
        clearTimeout(timeout); 
    }
}

async function loadData() {
    if (state.loading) return;
    state.loading = true; 
    showState("loading");
    try {
        // Cargar catálogos primero
        await cargarCatalogos();
        
        const raw = await requestBackend();
        state.data = safeArray(raw).map((risk, index) => ({
            id: String(risk.id ?? risk.codigo ?? `R-${index + 1}`), 
            code: String(risk.codigo ?? risk.id ?? `R-${index + 1}`),
            title: String(risk.titulo ?? risk.name ?? "Riesgo sin nombre"), 
            period: String(risk.period ?? "2026-I"),
            area: String(risk.area ?? "Área no definida"), 
            category: String(risk.categoria ?? "Sin categoría"),
            level: ["critico", "advertencia", "controlado"].includes(risk.nivel) ? risk.nivel : "advertencia",
            probability: Math.min(3, Math.max(1, Number(risk.probability) || 1)), 
            impact: Math.min(3, Math.max(1, Number(risk.impact) || 1)),
            status: ["abierto", "mitigacion", "controlado"].includes(risk.estado) ? risk.estado : "abierto",
            vulnerability: Boolean(risk.vulnerabilidad), 
            bottleneck: Boolean(risk.cuelloBotella), 
            stage: String(risk.etapa ?? "Sin etapa"),
            responsible: String(risk.responsable ?? "Sin responsable"), 
            detectedAt: String(risk.detectado ?? ""), 
            recommendation: String(risk.recomendacion ?? "Sin recomendación registrada."),
            nivelTexto: String(risk.nivelTexto ?? "No definido")
        }));
        
        console.log("[DIAGTI] Datos cargados:", state.data.length, "riesgos");
        console.log("[DIAGTI] Categorías disponibles:", unique(state.data.map(r => r.category)));
        
        // Poblar filtro de categorías desde los datos
        poblarFiltroCategorias();
        
        render();
    } catch (error) { 
        console.error("[DIAGTI] Riesgos:", error); 
        showState("error", error.name === "AbortError" ? "La consulta excedió el tiempo máximo." : error.message); 
    } finally { 
        state.loading = false; 
    }
}

function poblarFiltroCategorias() {
    const select = el.filterCategory;
    if (!select) return;
    const primeraOpcion = select.options[0];
    select.innerHTML = '';
    if (primeraOpcion) select.appendChild(primeraOpcion);
    const categorias = unique(state.data.map(r => r.category));
    categorias.forEach(v => {
        const o = document.createElement("option");
        o.value = normalize(v);
        o.textContent = v;
        select.appendChild(o);
    });
}

function filteredRisks(ignore = {}) {
    const q = normalize(state.filters.search);
    
    return state.data.filter(r => {
        if (!ignore.date && r.detectedAt && (r.detectedAt < state.filters.dateFrom || r.detectedAt > state.filters.dateTo)) {
            return false;
        }
        if (!ignore.area && state.filters.area !== "all" && normalize(r.area) !== state.filters.area) {
            return false;
        }
        if (!ignore.category && state.filters.category !== "all" && normalize(r.category) !== state.filters.category) {
            return false;
        }
        if (!ignore.level && state.filters.level !== "all" && r.level !== state.filters.level) {
            return false;
        }
        if (!ignore.status && state.filters.status !== "all" && r.status !== state.filters.status) {
            return false;
        }
        if (state.flag === "vulnerability" && !r.vulnerability) {
            return false;
        }
        if (q && !normalize(`${r.code} ${r.title} ${r.area} ${r.category}`).includes(q)) {
            return false;
        }
        return true;
    });
}

function render() {
    const risks = filteredRisks();
    renderActiveFilters();
    el.resultSummary.textContent = `${risks.length} riesgos encontrados`;
    if (!risks.length) { 
        showState("empty"); 
        return; 
    }
    showState("content");
    renderTable(risks);
}

function renderActiveFilters() {
    const chips = [];
    if (state.filters.area !== "all") chips.push(["area", `Área: ${state.filters.area}`]);
    if (state.filters.category !== "all") chips.push(["category", `Categoría: ${state.filters.category}`]);
    if (state.filters.level !== "all") chips.push(["level", `Nivel: ${RISK_LABELS.level[state.filters.level]}`]);
    if (state.filters.status !== "all") chips.push(["status", `Estado: ${RISK_LABELS.status[state.filters.status]}`]);
    if (state.filters.search) chips.push(["search", `Búsqueda: ${state.filters.search}`]);
    el.activeFilters.innerHTML = chips.map(([key, label]) => 
        `<span class="analytics-filter-chip">${escapeHTML(label)}<button type="button" data-remove-risk-filter="${key}" aria-label="Quitar ${escapeHTML(label)}">×</button></span>`
    ).join("");
}

function sortRisks(risks) {
    const order = { level: { critico: 0, advertencia: 1, controlado: 2 } };
    const dir = state.sort.direction === "asc" ? 1 : -1;
    return [...risks].sort((a, b) => { 
        let av = state.sort.key === "area" ? a.area : state.sort.key === "category" ? a.category : state.sort.key === "level" ? order.level[a.level] : a[state.sort.key]; 
        let bv = state.sort.key === "area" ? b.area : state.sort.key === "category" ? b.category : state.sort.key === "level" ? order.level[b.level] : b[state.sort.key]; 
        if (av < bv) return -dir; 
        if (av > bv) return dir; 
        return b.probability * b.impact - a.probability * a.impact; 
    });
}

function badge(text, tone) { 
    return `<span class="analytics-badge analytics-badge--${tone}">${escapeHTML(text)}</span>`; 
}

function renderTable(risks) {
    const rows = sortRisks(risks); 
    const pages = Math.max(1, Math.ceil(rows.length / state.pageSize)); 
    state.page = Math.min(state.page, pages); 
    const start = (state.page - 1) * state.pageSize; 
    const pageRows = rows.slice(start, start + state.pageSize);
    
    el.tableBody.innerHTML = pageRows.map(r => `
        <tr>
            <td><strong>${escapeHTML(r.code)}</strong></td>
            <td>${escapeHTML(r.title)}</td>
            <td>${escapeHTML(r.area)}</td>
            <td>${escapeHTML(r.category)}</td>
            <td>${badge(r.nivelTexto || "No definido", r.level === "critico" ? "danger" : r.level === "advertencia" ? "warning" : "success")}</td>
            <td>${badge(RISK_LABELS.status[r.status], r.status === "controlado" ? "success" : r.status === "mitigacion" ? "info" : "warning")}</td>
            <td><button class="analytics-detail-button" data-risk-detail="${escapeHTML(r.id)}">Ver detalle</button></td>
        </tr>
    `).join("");
    
    el.pageSummary.textContent = rows.length ? `Mostrando ${start + 1}–${Math.min(start + state.pageSize, rows.length)} de ${rows.length}` : "Sin resultados"; 
    el.pageLabel.textContent = `Página ${state.page} de ${pages}`; 
    el.prevPage.disabled = state.page <= 1; 
    el.nextPage.disabled = state.page >= pages;
}

function openDetail(id) {
    const r = state.data.find(item => item.id === id); 
    if (!r) return;
    el.dialogTitle.textContent = `${r.code} · ${r.title}`;
    el.dialogContent.innerHTML = `
        <div class="analytics-dialog__grid">
            <div class="analytics-dialog__item"><span>Área</span><strong>${escapeHTML(r.area)}</strong></div>
            <div class="analytics-dialog__item"><span>Categoría</span><strong>${escapeHTML(r.category)}</strong></div>
            <div class="analytics-dialog__item"><span>Nivel de riesgo</span><strong>${escapeHTML(r.nivelTexto || "No definido")}</strong></div>
            <div class="analytics-dialog__item"><span>Etapa</span><strong>${escapeHTML(r.stage)}</strong></div>
            <div class="analytics-dialog__item"><span>Detectado</span><strong>${formatDate(r.detectedAt)}</strong></div>
            <div class="analytics-dialog__item"><span>Estado</span><strong>${RISK_LABELS.status[r.status]}</strong></div>
            <div class="analytics-dialog__item"><span>Responsable</span><strong>${escapeHTML(r.responsible)}</strong></div>
            <div class="analytics-dialog__item"><span>Probabilidad</span><strong>${RISK_LABELS.probability[r.probability]}</strong></div>
            <div class="analytics-dialog__item"><span>Impacto</span><strong>${RISK_LABELS.impact[r.impact]}</strong></div>
        </div>
        <div class="analytics-dialog__recommendation"><strong>Acción preventiva:</strong> ${escapeHTML(r.recommendation)}</div>
    `;
    typeof el.detailDialog.showModal === "function" ? el.detailDialog.showModal() : el.detailDialog.setAttribute("open", "");
}

function resetFilters() {
    state.filters = { dateFrom: "2025-01-01", dateTo: "2026-12-31", area: "all", category: "all", level: "all", status: "all", search: "" }; 
    state.flag = null; 
    state.page = 1;
    el.filterDateFrom.value = state.filters.dateFrom; 
    el.filterDateTo.value = state.filters.dateTo; 
    el.filterArea.value = "all"; 
    el.filterCategory.value = "all"; 
    el.filterLevel.value = "all"; 
    el.filterStatus.value = "all"; 
    el.filterSearch.value = ""; 
    render();
}

function bind() {
    const bindings = [
        [el.filterArea, "area"],
        [el.filterCategory, "category"],
        [el.filterLevel, "level"],
        [el.filterStatus, "status"]
    ];
    bindings.forEach(([control, key]) => 
        control.addEventListener("change", e => {
            state.filters[key] = e.target.value; 
            state.page = 1; 
            render();
        })
    );
    
    [el.filterDateFrom, el.filterDateTo].forEach(control => 
        control.addEventListener("change", () => {
            if (el.filterDateFrom.value && el.filterDateTo.value && el.filterDateFrom.value > el.filterDateTo.value) {
                el.filterDateTo.value = el.filterDateFrom.value;
            }
            state.filters.dateFrom = el.filterDateFrom.value || "2025-01-01";
            state.filters.dateTo = el.filterDateTo.value || "2026-12-31";
            state.page = 1;
            render();
        })
    );
    
    el.filterSearch.addEventListener("input", e => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.filters.search = e.target.value.trim();
            state.page = 1;
            render();
        }, 180);
    });
    
    el.reset.addEventListener("click", resetFilters); 
    el.emptyReset.addEventListener("click", resetFilters); 
    el.retry.addEventListener("click", loadData);
    
    document.addEventListener("click", event => {
        const detail = event.target.closest("[data-risk-detail]"); 
        if (detail) { openDetail(detail.dataset.riskDetail); return; }
        const remove = event.target.closest("[data-remove-risk-filter]"); 
        if (remove) {
            const key = remove.dataset.removeRiskFilter;
            if (key === "flag") state.flag = null;
            else {
                state.filters[key] = key === "search" ? "" : "all";
                const map = {
                    area: el.filterArea,
                    category: el.filterCategory,
                    level: el.filterLevel,
                    status: el.filterStatus,
                    search: el.filterSearch
                };
                if (map[key]) map[key].value = state.filters[key];
            }
            state.page = 1;
            render();
        }
    });
    
    document.querySelectorAll("[data-risk-sort]").forEach(button => 
        button.addEventListener("click", () => {
            const key = button.dataset.riskSort;
            state.sort.direction = state.sort.key === key && state.sort.direction === "asc" ? "desc" : "asc";
            state.sort.key = key;
            render();
        })
    );
    
    el.pageSize.addEventListener("change", e => {
        state.pageSize = Number(e.target.value) || 10;
        state.page = 1;
        render();
    }); 
    el.prevPage.addEventListener("click", () => {
        if (state.page > 1) { state.page--; render(); }
    }); 
    el.nextPage.addEventListener("click", () => {
        state.page++;
        render();
    });
}

function cache() {
    const ids = {
        resultSummary: "risk-result-summary",
        filterDateFrom: "risk-filter-date-from",
        filterDateTo: "risk-filter-date-to",
        filterArea: "risk-filter-area",
        filterCategory: "risk-filter-category",
        filterLevel: "risk-filter-level",
        filterStatus: "risk-filter-status",
        filterSearch: "risk-filter-search",
        reset: "risk-reset-filters",
        activeFilters: "risk-active-filters",
        loading: "risk-loading",
        error: "risk-error",
        errorMessage: "risk-error-message",
        retry: "risk-retry",
        empty: "risk-empty",
        emptyReset: "risk-empty-reset",
        content: "risk-content",
        pageSize: "risk-page-size",
        tableBody: "risk-table-body",
        pageSummary: "risk-page-summary",
        pageLabel: "risk-page-label",
        prevPage: "risk-prev-page",
        nextPage: "risk-next-page",
        detailDialog: "risk-detail-dialog",
        dialogTitle: "risk-dialog-title",
        dialogContent: "risk-dialog-content"
    }; 
    Object.entries(ids).forEach(([key, id]) => el[key] = document.getElementById(id));
}

document.addEventListener("DOMContentLoaded", () => {
    cache();
    if (!el.content || !el.tableBody) {
        console.error("[DIAGTI] Faltan elementos del Riesgos.");
        return;
    }
    if (typeof diagtiDirectorAplicarPerfil === "function") {
        diagtiDirectorAplicarPerfil();
    }
    bind();
    loadData();
});
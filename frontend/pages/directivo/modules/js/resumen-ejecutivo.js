"use strict";

/* ============================================================
   DIAGTI CTIC UNAS
   Módulo Directivo · Dashboard Ejecutivo

   FUENTE DE DATOS
   - "demo": utiliza los datos demostrativos de este archivo.
   - "backend": consulta DASHBOARD_CONFIG.endpoint mediante fetch().

   El HTML no contiene valores institucionales. KPI, gráficos, alertas
   y tabla se calculan desde una única fuente de datos.
============================================================ */

const DASHBOARD_CONFIG = Object.freeze({
    source: "demo",
    endpoint: "/api/directivo/resumen-ejecutivo",
    requestTimeoutMs: 10000,
    demoDelayMs: 350
});

const PERIOD_ORDER = ["2025-I", "2025-II", "2026-I"];

const PERIOD_LABELS = Object.freeze({
    "2025-I": "2025 · Primer semestre",
    "2025-II": "2025 · Segundo semestre",
    "2026-I": "2026 · Primer semestre"
});

const AREA_LABELS = Object.freeze({
    academica: "Gestión Académica",
    administrativa: "Gestión Administrativa",
    investigacion: "Investigación",
    infraestructura: "Infraestructura TI"
});


function prettifyKey(value) {
    return String(value ?? "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\w/g, (letter) => letter.toUpperCase());
}

function getAreaLabel(areaKey) {
    return AREA_LABELS[areaKey] || prettifyKey(areaKey) || "Área no definida";
}

const HEALTH_LABELS = Object.freeze({
    saludable: "Saludable",
    atencion: "En atención",
    critico: "Crítico"
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

const PRIORITY_LABELS = Object.freeze({
    inmediata: "Inmediata",
    "corto-plazo": "Corto plazo",
    "mediano-plazo": "Mediano plazo",
    monitoreo: "Monitoreo"
});

const PROJECT_STATUS_LABELS = Object.freeze({
    completed: "Completado",
    "on-track": "En plazo",
    risk: "En riesgo",
    delayed: "Retrasado"
});

const CHART_COLORS = Object.freeze({
    health: {
        saludable: "#1abb9c",
        atencion: "#e7a52d",
        critico: "#c53030"
    },
    validation: {
        validado: "#1abb9c",
        observado: "#e7a52d",
        pendiente: "#5d84a2"
    },
    trend: {
        health: "#0f75bc",
        compliance: "#1abb9c"
    },
    project: {
        completed: "#16845b",
        "on-track": "#1abb9c",
        risk: "#e7a52d",
        delayed: "#c53030"
    }
});

/* ============================================================
   DATOS DEMOSTRATIVOS
   No representan información institucional real.
============================================================ */

const DEMO_SYSTEM_CATALOG = [
    {
        code: "SIS-001",
        name: "Sistema Académico Institucional",
        area: "academica",
        type: "Aplicativo web",
        firstPeriod: "2025-I",
        owner: "Área de Desarrollo",
        health: "critico",
        validation: "observado",
        criticality: "critica",
        priority: "inmediata",
        legacy: true,
        noSupport: true,
        obsolete: true,
        risk: "Crítico",
        supportEnd: "2025-12-31",
        recommendation: "Priorizar la migración de componentes sin soporte y cerrar las observaciones técnicas."
    },
    {
        code: "SIS-002",
        name: "Plataforma de Matrícula",
        area: "academica",
        type: "Aplicativo web",
        firstPeriod: "2025-I",
        owner: "Área de Desarrollo",
        health: "atencion",
        validation: "observado",
        criticality: "alta",
        priority: "corto-plazo",
        legacy: true,
        noSupport: false,
        obsolete: true,
        risk: "Alto",
        supportEnd: "2026-11-30",
        recommendation: "Completar evidencias de seguridad y validar la arquitectura objetivo."
    },
    {
        code: "SIS-003",
        name: "Portal del Estudiante",
        area: "academica",
        type: "Portal web",
        firstPeriod: "2025-I",
        owner: "Área de Desarrollo",
        health: "saludable",
        validation: "validado",
        criticality: "alta",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Medio",
        supportEnd: "2028-06-30",
        recommendation: "Mantener seguimiento de disponibilidad y actualización de dependencias."
    },
    {
        code: "SIS-004",
        name: "Gestión de Notas",
        area: "academica",
        type: "Aplicativo web",
        firstPeriod: "2025-I",
        owner: "Área de Desarrollo",
        health: "atencion",
        validation: "pendiente",
        criticality: "media",
        priority: "mediano-plazo",
        legacy: false,
        noSupport: false,
        obsolete: true,
        risk: "Medio",
        supportEnd: "2027-03-31",
        recommendation: "Completar el diagnóstico y revisar la versión del framework."
    },
    {
        code: "SIS-005",
        name: "Biblioteca Virtual",
        area: "academica",
        type: "Servicio institucional",
        firstPeriod: "2025-II",
        owner: "Biblioteca / CTIC",
        health: "saludable",
        validation: "validado",
        criticality: "media",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Bajo",
        supportEnd: "2029-01-31",
        recommendation: "Mantener respaldos y revisión periódica de integraciones."
    },
    {
        code: "SIS-006",
        name: "Aula Virtual",
        area: "academica",
        type: "Plataforma educativa",
        firstPeriod: "2026-I",
        owner: "CTIC",
        health: "saludable",
        validation: "pendiente",
        criticality: "alta",
        priority: "corto-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Medio",
        supportEnd: "2028-12-31",
        recommendation: "Completar la validación de capacidad y continuidad operativa."
    },
    {
        code: "SIS-007",
        name: "Sistema de Tesorería",
        area: "administrativa",
        type: "Aplicativo cliente-servidor",
        firstPeriod: "2025-I",
        owner: "Administración / CTIC",
        health: "critico",
        validation: "observado",
        criticality: "critica",
        priority: "inmediata",
        legacy: true,
        noSupport: true,
        obsolete: true,
        risk: "Crítico",
        supportEnd: "2024-12-31",
        recommendation: "Definir reemplazo, asegurar respaldos y reducir dependencias no documentadas."
    },
    {
        code: "SIS-008",
        name: "Gestión Documentaria",
        area: "administrativa",
        type: "Aplicativo web",
        firstPeriod: "2025-I",
        owner: "Secretaría General / CTIC",
        health: "atencion",
        validation: "observado",
        criticality: "alta",
        priority: "corto-plazo",
        legacy: true,
        noSupport: false,
        obsolete: true,
        risk: "Alto",
        supportEnd: "2026-09-30",
        recommendation: "Completar requerimientos y preparar una migración progresiva."
    },
    {
        code: "SIS-009",
        name: "Control Patrimonial",
        area: "administrativa",
        type: "Aplicativo web",
        firstPeriod: "2025-I",
        owner: "Patrimonio / CTIC",
        health: "saludable",
        validation: "validado",
        criticality: "media",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Bajo",
        supportEnd: "2028-08-31",
        recommendation: "Mantener controles de acceso y actualización de inventario."
    },
    {
        code: "SIS-010",
        name: "Sistema de Recursos Humanos",
        area: "administrativa",
        type: "Aplicativo web",
        firstPeriod: "2025-II",
        owner: "Recursos Humanos / CTIC",
        health: "atencion",
        validation: "pendiente",
        criticality: "alta",
        priority: "corto-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Alto",
        supportEnd: "2027-07-31",
        recommendation: "Completar evidencias de seguridad y responsables de operación."
    },
    {
        code: "SIS-011",
        name: "Portal de Transparencia",
        area: "administrativa",
        type: "Portal web",
        firstPeriod: "2025-II",
        owner: "Imagen Institucional / CTIC",
        health: "saludable",
        validation: "validado",
        criticality: "media",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Bajo",
        supportEnd: "2028-10-31",
        recommendation: "Mantener la actualización de contenidos y controles de publicación."
    },
    {
        code: "SIS-012",
        name: "Mesa de Partes Digital",
        area: "administrativa",
        type: "Servicio institucional",
        firstPeriod: "2026-I",
        owner: "Secretaría General / CTIC",
        health: "saludable",
        validation: "pendiente",
        criticality: "media",
        priority: "mediano-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Medio",
        supportEnd: "2029-02-28",
        recommendation: "Completar el levantamiento de integraciones y validación funcional."
    },
    {
        code: "SIS-013",
        name: "Repositorio de Investigación",
        area: "investigacion",
        type: "Repositorio institucional",
        firstPeriod: "2025-I",
        owner: "Dirección de Investigación / CTIC",
        health: "saludable",
        validation: "validado",
        criticality: "media",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Bajo",
        supportEnd: "2028-05-31",
        recommendation: "Mantener revisión de interoperabilidad y metadatos."
    },
    {
        code: "SIS-014",
        name: "Gestión de Proyectos de Investigación",
        area: "investigacion",
        type: "Aplicativo web",
        firstPeriod: "2025-I",
        owner: "Dirección de Investigación",
        health: "atencion",
        validation: "observado",
        criticality: "alta",
        priority: "corto-plazo",
        legacy: false,
        noSupport: false,
        obsolete: true,
        risk: "Alto",
        supportEnd: "2026-12-31",
        recommendation: "Corregir observaciones y actualizar componentes con fin de soporte próximo."
    },
    {
        code: "SIS-015",
        name: "Registro de Publicaciones",
        area: "investigacion",
        type: "Aplicativo web",
        firstPeriod: "2025-II",
        owner: "Dirección de Investigación",
        health: "saludable",
        validation: "validado",
        criticality: "baja",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Bajo",
        supportEnd: "2029-06-30",
        recommendation: "Mantener controles de calidad de datos."
    },
    {
        code: "SIS-016",
        name: "Laboratorios de Investigación",
        area: "investigacion",
        type: "Servicio interno",
        firstPeriod: "2026-I",
        owner: "Investigación / Infraestructura",
        health: "atencion",
        validation: "pendiente",
        criticality: "media",
        priority: "mediano-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Medio",
        supportEnd: "2028-04-30",
        recommendation: "Completar el inventario de recursos e integraciones."
    },
    {
        code: "SIS-017",
        name: "Plataforma de Virtualización",
        area: "infraestructura",
        type: "Infraestructura virtual",
        firstPeriod: "2025-I",
        owner: "Área de Infraestructura",
        health: "atencion",
        validation: "validado",
        criticality: "critica",
        priority: "corto-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Alto",
        supportEnd: "2027-12-31",
        recommendation: "Continuar renovación de nodos y pruebas de recuperación."
    },
    {
        code: "SIS-018",
        name: "Servicio de Directorio Institucional",
        area: "infraestructura",
        type: "Servicio de identidad",
        firstPeriod: "2025-I",
        owner: "Área de Infraestructura",
        health: "saludable",
        validation: "validado",
        criticality: "critica",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Medio",
        supportEnd: "2028-12-31",
        recommendation: "Mantener redundancia, monitoreo y pruebas de restauración."
    },
    {
        code: "SIS-019",
        name: "Monitoreo de Servicios TI",
        area: "infraestructura",
        type: "Plataforma de monitoreo",
        firstPeriod: "2025-II",
        owner: "Área de Infraestructura",
        health: "saludable",
        validation: "validado",
        criticality: "alta",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Bajo",
        supportEnd: "2029-03-31",
        recommendation: "Ampliar cobertura y mantener actualización de agentes."
    },
    {
        code: "SIS-020",
        name: "Gestión de Respaldos",
        area: "infraestructura",
        type: "Servicio de continuidad",
        firstPeriod: "2025-II",
        owner: "Área de Infraestructura",
        health: "critico",
        validation: "observado",
        criticality: "critica",
        priority: "inmediata",
        legacy: false,
        noSupport: true,
        obsolete: true,
        risk: "Crítico",
        supportEnd: "2025-10-31",
        recommendation: "Renovar la solución y ejecutar una prueba documentada de restauración."
    },
    {
        code: "SIS-021",
        name: "Gestión de Certificados Digitales",
        area: "infraestructura",
        type: "Servicio de seguridad",
        firstPeriod: "2026-I",
        owner: "Infraestructura / Seguridad",
        health: "saludable",
        validation: "pendiente",
        criticality: "alta",
        priority: "corto-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Medio",
        supportEnd: "2027-09-30",
        recommendation: "Completar la validación y automatizar alertas de vencimiento."
    },
    {
        code: "SIS-022",
        name: "Portal Institucional",
        area: "administrativa",
        type: "Portal web",
        firstPeriod: "2025-I",
        owner: "Imagen Institucional / CTIC",
        health: "saludable",
        validation: "validado",
        criticality: "alta",
        priority: "monitoreo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Medio",
        supportEnd: "2028-02-29",
        recommendation: "Mantener controles de publicación, disponibilidad y seguridad."
    },
    {
        code: "SIS-023",
        name: "Admisión Universitaria",
        area: "academica",
        type: "Aplicativo web",
        firstPeriod: "2025-II",
        owner: "Admisión / CTIC",
        health: "atencion",
        validation: "validado",
        criticality: "critica",
        priority: "corto-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Alto",
        supportEnd: "2027-06-30",
        recommendation: "Reforzar pruebas de carga y continuidad antes de cada convocatoria."
    },
    {
        code: "SIS-024",
        name: "Seguimiento de Egresados",
        area: "academica",
        type: "Aplicativo web",
        firstPeriod: "2026-I",
        owner: "Bienestar Universitario / CTIC",
        health: "saludable",
        validation: "pendiente",
        criticality: "baja",
        priority: "mediano-plazo",
        legacy: false,
        noSupport: false,
        obsolete: false,
        risk: "Bajo",
        supportEnd: "2029-05-31",
        recommendation: "Completar el diagnóstico funcional y técnico."
    }
];

const DEMO_PROJECTS = [
    {
        id: "PRY-001",
        name: "Modernización del Sistema Académico",
        area: "academica",
        responsible: "Área de Desarrollo",
        phase: "Migración piloto",
        startDate: "2025-08-01",
        endDate: "2026-12-15",
        milestone: "Validación funcional del módulo de matrícula",
        description: "Actualización progresiva de los componentes críticos del ecosistema académico.",
        actual: { "2025-I": 18, "2025-II": 44, "2026-I": 68 },
        planned: { "2025-I": 22, "2025-II": 48, "2026-I": 72 }
    },
    {
        id: "PRY-002",
        name: "Migración de Tesorería",
        area: "administrativa",
        responsible: "Desarrollo / Administración",
        phase: "Preparación de datos",
        startDate: "2025-07-15",
        endDate: "2027-03-31",
        milestone: "Cierre de pruebas de conciliación",
        description: "Migración del sistema legacy y estandarización de integraciones financieras.",
        actual: { "2025-I": 12, "2025-II": 31, "2026-I": 49 },
        planned: { "2025-I": 18, "2025-II": 42, "2026-I": 65 }
    },
    {
        id: "PRY-003",
        name: "Plataforma de Investigación",
        area: "investigacion",
        responsible: "Área de Desarrollo",
        phase: "Diseño de arquitectura",
        startDate: "2025-10-01",
        endDate: "2027-05-30",
        milestone: "Aprobación de arquitectura objetivo",
        description: "Actualización e integración de los servicios de investigación institucional.",
        actual: { "2025-I": 8, "2025-II": 24, "2026-I": 43 },
        planned: { "2025-I": 10, "2025-II": 28, "2026-I": 47 }
    },
    {
        id: "PRY-004",
        name: "Renovación de Infraestructura Virtual",
        area: "infraestructura",
        responsible: "Área de Infraestructura",
        phase: "Migración progresiva",
        startDate: "2025-05-01",
        endDate: "2026-11-30",
        milestone: "Traslado del siguiente grupo de servicios",
        description: "Renovación de nodos y traslado progresivo de cargas institucionales.",
        actual: { "2025-I": 28, "2025-II": 55, "2026-I": 78 },
        planned: { "2025-I": 30, "2025-II": 58, "2026-I": 76 }
    },
    {
        id: "PRY-005",
        name: "Estandarización de Respaldos",
        area: "infraestructura",
        responsible: "Infraestructura / Seguridad",
        phase: "Implementación",
        startDate: "2025-09-01",
        endDate: "2026-10-31",
        milestone: "Prueba documentada de restauración",
        description: "Normalización de políticas, frecuencias y evidencias de recuperación.",
        actual: { "2025-I": 15, "2025-II": 39, "2026-I": 58 },
        planned: { "2025-I": 20, "2025-II": 44, "2026-I": 63 }
    },
    {
        id: "PRY-006",
        name: "Reingeniería de Gestión Documentaria",
        area: "administrativa",
        responsible: "Desarrollo / Secretaría General",
        phase: "Levantamiento funcional",
        startDate: "2025-11-01",
        endDate: "2027-08-31",
        milestone: "Cierre de requerimientos priorizados",
        description: "Rediseño de flujos documentarios y reducción de procesos manuales.",
        actual: { "2025-I": 5, "2025-II": 17, "2026-I": 34 },
        planned: { "2025-I": 8, "2025-II": 25, "2026-I": 50 }
    }
];

/* ============================================================
   ESTADO Y REFERENCIAS DEL DOM
============================================================ */

const dashboardState = {
    data: null,
    filters: {
        period: "2026-I",
        area: "all",
        criticality: "all",
        validation: "all",
        search: ""
    },
    healthFocus: null,
    delayedProjectsOnly: false,
    selectedProjectId: null,
    trendSeries: {
        health: true,
        compliance: true
    },
    sort: {
        key: "priority",
        direction: "asc"
    },
    pagination: {
        page: 1,
        pageSize: 10
    },
    loading: false,
    quickFilter: null
};

const elements = {};
let searchTimer = null;

/* ============================================================
   UTILIDADES
============================================================ */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, Number(value) || 0));
}

function percent(value, total) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
}

function average(values) {
    if (!values.length) {
        return 0;
    }

    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatDateTime(value) {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "No definida";
    }

    return new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium"
    }).format(date);
}

function getPreviousPeriod(period) {
    const index = PERIOD_ORDER.indexOf(period);
    return index > 0 ? PERIOD_ORDER[index - 1] : null;
}

function isPeriodAvailable(firstPeriod, selectedPeriod) {
    return PERIOD_ORDER.indexOf(firstPeriod) <= PERIOD_ORDER.indexOf(selectedPeriod);
}

function getProjectStatus(actual, planned) {
    if (actual >= 100) {
        return "completed";
    }

    const difference = planned - actual;

    if (difference >= 12) {
        return "delayed";
    }

    if (difference >= 5) {
        return "risk";
    }

    return "on-track";
}

function getTrendClass(value) {
    if (value > 0) {
        return "is-positive";
    }

    if (value < 0) {
        return "is-negative";
    }

    return "";
}

function getTrendText(value, suffix = "") {
    if (value === null) {
        return "Sin comparación disponible";
    }

    if (value === 0) {
        return "Sin variación frente al periodo anterior";
    }

    const sign = value > 0 ? "+" : "";
    return `${sign}${value}${suffix} frente al periodo anterior`;
}

function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function setTrend(element, value, suffix = "") {
    if (!element) {
        return;
    }

    element.classList.remove("is-positive", "is-negative");
    const trendClass = getTrendClass(value ?? 0);

    if (trendClass) {
        element.classList.add(trendClass);
    }

    setText(element, getTrendText(value, suffix));
}

function delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

/* ============================================================
   CONSTRUCCIÓN DE SNAPSHOTS DEMOSTRATIVOS
============================================================ */

function buildDemoSnapshot(system, period, index) {
    const snapshot = { ...system };

    if (period === "2026-I") {
        return snapshot;
    }

    if (period === "2025-II") {
        if (snapshot.validation === "validado" && index % 4 === 0) {
            snapshot.validation = "observado";
        } else if (snapshot.validation === "observado" && index % 3 === 0) {
            snapshot.validation = "pendiente";
        }

        if (snapshot.health === "saludable" && index % 5 === 0) {
            snapshot.health = "atencion";
        }

        return snapshot;
    }

    if (snapshot.validation === "validado") {
        snapshot.validation = index % 2 === 0 ? "observado" : "pendiente";
    } else if (snapshot.validation === "observado") {
        snapshot.validation = "pendiente";
    }

    if (snapshot.health === "saludable" && index % 3 !== 0) {
        snapshot.health = "atencion";
    } else if (snapshot.health === "atencion" && index % 4 === 0) {
        snapshot.health = "critico";
    }

    return snapshot;
}

function createDemoPayload() {
    return {
        source: "demo",
        updatedAt: new Date().toISOString(),
        systems: DEMO_SYSTEM_CATALOG.map((system, index) => ({
            ...system,
            snapshots: Object.fromEntries(
                PERIOD_ORDER
                    .filter((period) => isPeriodAvailable(system.firstPeriod, period))
                    .map((period) => [period, buildDemoSnapshot(system, period, index)])
            )
        })),
        projects: DEMO_PROJECTS
    };
}

/* ============================================================
   CARGA DE DATOS
============================================================ */

async function requestBackendData() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
        () => controller.abort(),
        DASHBOARD_CONFIG.requestTimeoutMs
    );

    try {
        const response = await fetch(DASHBOARD_CONFIG.endpoint, {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            credentials: "same-origin",
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`El servicio respondió con estado ${response.status}.`);
        }

        const payload = await response.json();
        return validatePayload(payload);
    } finally {
        window.clearTimeout(timeoutId);
    }
}

function validatePayload(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("La respuesta del servicio no tiene el formato esperado.");
    }

    return {
        ...payload,
        systems: Array.isArray(payload.systems) ? payload.systems : [],
        projects: Array.isArray(payload.projects) ? payload.projects : []
    };
}

async function loadDashboardData() {
    if (dashboardState.loading) {
        return;
    }

    dashboardState.loading = true;
    showDashboardState("loading");

    try {
        let payload;

        if (DASHBOARD_CONFIG.source === "backend") {
            payload = await requestBackendData();
        } else {
            await delay(DASHBOARD_CONFIG.demoDelayMs);
            payload = createDemoPayload();
        }

        dashboardState.data = validatePayload(payload);
        dashboardState.pagination.page = 1;
        renderDashboard();
    } catch (error) {
        console.error("[DIAGTI] Error al cargar Dashboard Ejecutivo:", error);
        showDashboardState("error", error.message);
    } finally {
        dashboardState.loading = false;
    }
}

function showDashboardState(state, message = "") {
    const isLoading = state === "loading";
    const isError = state === "error";
    const isEmpty = state === "empty";
    const isContent = state === "content";

    elements.dashboardLoading.hidden = !isLoading;
    elements.dashboardError.hidden = !isError;
    elements.dashboardEmpty.hidden = !isEmpty;
    elements.dashboardContent.hidden = !isContent;

    if (isError && message) {
        setText(elements.dashboardErrorMessage, message);
    }
}

/* ============================================================
   NORMALIZACIÓN Y FILTRADO
============================================================ */

function getSystemsForPeriod(period) {
    if (!dashboardState.data) {
        return [];
    }

    return dashboardState.data.systems
        .map((system) => {
            const snapshot = system.snapshots?.[period];
            return snapshot ? { ...snapshot, snapshots: undefined } : null;
        })
        .filter(Boolean);
}

function applyGlobalSystemFilters(systems, period = dashboardState.filters.period) {
    const { area, criticality, validation, search } = dashboardState.filters;
    const normalizedSearch = normalizeText(search);

    return systems.filter((system) => {
        if (area !== "all" && system.area !== area) {
            return false;
        }

        if (criticality !== "all" && system.criticality !== criticality) {
            return false;
        }

        if (validation !== "all" && system.validation !== validation) {
            return false;
        }

        if (normalizedSearch) {
            const haystack = normalizeText(
                `${system.code} ${system.name} ${getAreaLabel(system.area)} ${system.type}`
            );

            if (!haystack.includes(normalizedSearch)) {
                return false;
            }
        }

        const quickFilter = dashboardState.quickFilter;

        if (quickFilter === "legacy" && !system.legacy) {
            return false;
        }

        if (quickFilter === "noSupport" && !system.noSupport) {
            return false;
        }

        if (quickFilter === "obsolete" && !system.obsolete) {
            return false;
        }

        if (quickFilter === "observed" && system.validation !== "observado") {
            return false;
        }

        return Boolean(period);
    });
}

function getFilteredSystems(period = dashboardState.filters.period) {
    return applyGlobalSystemFilters(getSystemsForPeriod(period), period);
}

function getTableSystems() {
    const systems = getFilteredSystems();

    if (!dashboardState.healthFocus) {
        return systems;
    }

    return systems.filter((system) => system.health === dashboardState.healthFocus);
}

function getFilteredProjects(period = dashboardState.filters.period) {
    if (!dashboardState.data) {
        return [];
    }

    return dashboardState.data.projects
        .filter((project) => (
            dashboardState.filters.area === "all"
            || project.area === dashboardState.filters.area
        ))
        .map((project) => {
            const actual = clamp(project.actual?.[period]);
            const planned = clamp(project.planned?.[period]);

            return {
                ...project,
                actualProgress: actual,
                plannedProgress: planned,
                status: getProjectStatus(actual, planned)
            };
        });
}

/* ============================================================
   MÉTRICAS
============================================================ */

function calculateSystemMetrics(systems) {
    const total = systems.length;
    const healthCounts = {
        saludable: systems.filter((system) => system.health === "saludable").length,
        atencion: systems.filter((system) => system.health === "atencion").length,
        critico: systems.filter((system) => system.health === "critico").length
    };
    const validationCounts = {
        observado: systems.filter((system) => system.validation === "observado").length,
        validado: systems.filter((system) => system.validation === "validado").length,
        pendiente: systems.filter((system) => system.validation === "pendiente").length
    };

    return {
        total,
        healthCounts,
        validationCounts,
        healthPercentage: percent(healthCounts.saludable, total),
        compliancePercentage: percent(validationCounts.validado, total),
        critical: healthCounts.critico,
        legacy: systems.filter((system) => system.legacy).length,
        noSupport: systems.filter((system) => system.noSupport).length,
        obsolete: systems.filter((system) => system.obsolete).length,
        observed: validationCounts.observado
    };
}

function calculateProjectMetrics(projects) {
    return {
        total: projects.length,
        averageProgress: average(projects.map((project) => project.actualProgress)),
        delayed: projects.filter((project) => project.status === "delayed").length,
        risk: projects.filter((project) => project.status === "risk").length
    };
}

function getCurrentMetrics(period = dashboardState.filters.period) {
    const systems = getFilteredSystems(period);
    const projects = getFilteredProjects(period);

    return {
        systems,
        projects,
        system: calculateSystemMetrics(systems),
        project: calculateProjectMetrics(projects)
    };
}

/* ============================================================
   RENDER GENERAL
============================================================ */

function renderDashboard() {
    const current = getCurrentMetrics();

    if (current.system.total === 0) {
        renderActiveFilters();
        setText(elements.dashboardResultSummary, "No se encontraron sistemas con los filtros aplicados.");
        showDashboardState("empty");
        return;
    }

    showDashboardState("content");
    renderFilterSummary(current.system.total);
    renderActiveFilters();
    renderKpis(current);
    renderValidationDonut();
    renderAreaChart();
    renderValidationByAreaChart();
    renderProjectChart(current.projects);
    renderTrendChart();
    renderSecondaryKpis(current);
    renderAlerts(current);
    renderProjectDetail(current.projects);
    renderPriorityTable();
}

function renderFilterSummary(total) {
    const periodLabel = PERIOD_LABELS[dashboardState.filters.period];
    const areaLabel = dashboardState.filters.area === "all"
        ? "Todas las áreas"
        : getAreaLabel(dashboardState.filters.area);

    setText(
        elements.dashboardResultSummary,
        `${total} sistemas encontrados · ${areaLabel} · ${periodLabel}`
    );
}

function renderActiveFilters() {
    const chips = [];
    const { filters, healthFocus, quickFilter } = dashboardState;

    if (filters.area !== "all") {
        chips.push({ key: "area", label: `Área: ${getAreaLabel(filters.area)}` });
    }

    if (filters.criticality !== "all") {
        chips.push({
            key: "criticality",
            label: `Criticidad: ${CRITICALITY_LABELS[filters.criticality]}`
        });
    }

    if (filters.validation !== "all") {
        chips.push({
            key: "validation",
            label: `Estado: ${VALIDATION_LABELS[filters.validation]}`
        });
    }

    if (filters.search) {
        chips.push({ key: "search", label: `Búsqueda: ${filters.search}` });
    }

    if (healthFocus) {
        chips.push({ key: "health", label: `Salud: ${HEALTH_LABELS[healthFocus]}` });
    }

    if (quickFilter && quickFilter !== "delayed") {
        const labels = {
            legacy: "Sistemas legacy",
            noSupport: "Sin soporte",
            obsolete: "Tecnologías obsoletas",
            observed: "Observados"
        };
        chips.push({ key: "quick", label: `Atajo: ${labels[quickFilter]}` });
    }

    elements.activeFilterList.innerHTML = chips.map((chip) => `
        <span class="executive-filter-chip">
            ${escapeHTML(chip.label)}
            <button
                type="button"
                data-remove-filter="${escapeHTML(chip.key)}"
                aria-label="Quitar ${escapeHTML(chip.label)}"
            >×</button>
        </span>
    `).join("");
}

/* ============================================================
   KPI
============================================================ */

function renderKpis(current) {
    const previousPeriod = getPreviousPeriod(dashboardState.filters.period);
    const previous = previousPeriod ? getCurrentMetrics(previousPeriod) : null;

    setText(elements.kpiTotalSystems, current.system.total);
    setText(
        elements.kpiTotalDetail,
        `${current.system.validationCounts.validado} validados · ${current.system.validationCounts.observado} observados`
    );
    setTrend(
        elements.kpiTotalTrend,
        previous ? current.system.total - previous.system.total : null,
        " sistemas"
    );

    setText(elements.kpiHealth, `${current.system.healthPercentage}%`);
    setText(
        elements.kpiHealthDetail,
        `${current.system.healthCounts.saludable} saludables · ${current.system.critical} críticos`
    );
    setTrend(
        elements.kpiHealthTrend,
        previous
            ? current.system.healthPercentage - previous.system.healthPercentage
            : null,
        " pp"
    );

    setText(elements.kpiProjectProgress, `${current.project.averageProgress}%`);
    setText(
        elements.kpiProjectDetail,
        `${current.project.total} proyectos · ${current.project.delayed} retrasados`
    );
    setTrend(
        elements.kpiProjectTrend,
        previous
            ? current.project.averageProgress - previous.project.averageProgress
            : null,
        " pp"
    );

    setText(elements.kpiCompliance, `${current.system.compliancePercentage}%`);
    setText(
        elements.kpiComplianceDetail,
        `${current.system.validationCounts.validado} validados · ${current.system.validationCounts.pendiente} pendientes`
    );
    setTrend(
        elements.kpiComplianceTrend,
        previous
            ? current.system.compliancePercentage - previous.system.compliancePercentage
            : null,
        " pp"
    );
}

/* ============================================================
   GRÁFICO DE SALUD
============================================================ */

function getSystemsWithoutValidationFilter(period = dashboardState.filters.period) {
    const currentValidation = dashboardState.filters.validation;
    dashboardState.filters.validation = "all";

    try {
        return getFilteredSystems(period);
    } finally {
        dashboardState.filters.validation = currentValidation;
    }
}

function renderValidationDonut() {
    const systems = getSystemsWithoutValidationFilter();
    const metrics = calculateSystemMetrics(systems);
    const total = metrics.total;
    const radius = 76;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const states = ["validado", "observado", "pendiente"];
    const circles = states.map((state) => {
        const value = metrics.validationCounts[state];
        const length = total > 0 ? (value / total) * circumference : 0;
        const selected = dashboardState.filters.validation === state;
        const muted = dashboardState.filters.validation !== "all" && !selected;
        const circle = `
            <circle
                class="health-chart__segment${selected ? " is-selected" : ""}${muted ? " is-muted" : ""}"
                cx="110"
                cy="110"
                r="${radius}"
                stroke="${CHART_COLORS.validation[state]}"
                stroke-dasharray="${length} ${circumference - length}"
                stroke-dashoffset="-${offset}"
                transform="rotate(-90 110 110)"
                tabindex="0"
                role="button"
                data-validation-state="${state}"
                aria-pressed="${selected}"
                aria-label="${VALIDATION_LABELS[state]}: ${value} sistemas, ${percent(value, total)} por ciento"
            >
                <title>${VALIDATION_LABELS[state]}: ${value} sistemas (${percent(value, total)}%)</title>
            </circle>
        `;

        offset += length;
        return circle;
    }).join("");

    elements.healthChart.innerHTML = `
        <svg viewBox="0 0 220 220" role="img" aria-labelledby="validation-chart-title validation-chart-desc">
            <title id="validation-chart-title">Estado de validación de los sistemas</title>
            <desc id="validation-chart-desc">Distribución de sistemas validados, observados y pendientes.</desc>
            <circle class="health-chart__track" cx="110" cy="110" r="${radius}"></circle>
            ${circles}
            <text class="health-chart__value" x="110" y="105">${metrics.compliancePercentage}%</text>
            <text class="health-chart__caption" x="110" y="126">validados</text>
        </svg>
    `;

    elements.healthLegend.innerHTML = states.map((state) => {
        const value = metrics.validationCounts[state];
        const isPressed = dashboardState.filters.validation === state;

        return `
            <button
                type="button"
                class="executive-chart-button"
                data-validation-state="${state}"
                aria-pressed="${isPressed}"
            >
                <span class="health-legend__line">
                    <span class="health-legend__label">
                        <i
                            class="health-legend__dot"
                            style="background:${CHART_COLORS.validation[state]}"
                            aria-hidden="true"
                        ></i>
                        ${VALIDATION_LABELS[state]}
                    </span>
                    <strong class="health-legend__value">${value}</strong>
                </span>
                <small class="health-legend__meta">${percent(value, total)}% del total</small>
            </button>
        `;
    }).join("");

    setText(elements.healthTotal, `${total} ${total === 1 ? "sistema" : "sistemas"}`);
}

/* ============================================================
   GRÁFICO POR ÁREA
============================================================ */

function renderAreaChart() {
    const systems = getSystemsWithoutValidationFilter();
    const states = ["validado", "observado", "pendiente"];
    const areaKeys = Array.from(new Set(systems.map((system) => system.area).filter(Boolean)));

    const areas = areaKeys.map((areaKey) => {
        const areaSystems = systems.filter((system) => system.area === areaKey);

        return {
            key: areaKey,
            total: areaSystems.length,
            counts: {
                validado: areaSystems.filter((system) => system.validation === "validado").length,
                observado: areaSystems.filter((system) => system.validation === "observado").length,
                pendiente: areaSystems.filter((system) => system.validation === "pendiente").length
            }
        };
    }).filter((area) => area.total > 0);

    if (!areas.length) {
        elements.areaChart.innerHTML = `
            <div class="executive-inline-empty">No hay datos por área para los filtros aplicados.</div>
        `;
        return;
    }

    elements.areaChart.innerHTML = `
        ${areas.map((area) => `
            <button
                type="button"
                class="area-chart__row"
                data-area-key="${area.key}"
                aria-pressed="${dashboardState.filters.area === area.key}"
                aria-label="Filtrar por ${getAreaLabel(area.key)}, ${area.total} sistemas"
            >
                <span class="area-chart__name">${getAreaLabel(area.key)}</span>
                <span class="area-chart__bar" aria-hidden="true">
                    ${states.map((state) => `
                        <span
                            style="width:${percent(area.counts[state], area.total)}%;background:${CHART_COLORS.validation[state]}"
                            title="${VALIDATION_LABELS[state]}: ${area.counts[state]} (${percent(area.counts[state], area.total)}%)"
                        ></span>
                    `).join("")}
                </span>
                <strong class="area-chart__count">${area.total}</strong>
            </button>
        `).join("")}
        <div class="area-chart__legend" aria-label="Leyenda">
            <span><i style="background:${CHART_COLORS.validation.validado}"></i>Validado</span>
            <span><i style="background:${CHART_COLORS.validation.observado}"></i>Observado</span>
            <span><i style="background:${CHART_COLORS.validation.pendiente}"></i>Pendiente</span>
        </div>
    `;
}

/* ============================================================
   GRÁFICO DE CUMPLIMIENTO
============================================================ */

function renderValidationByAreaChart() {
    const systems = getSystemsWithoutValidationFilter();
    const states = ["validado", "observado", "pendiente"];
    const areaKeys = Array.from(new Set(systems.map((system) => system.area).filter(Boolean)));
    const areas = areaKeys.map((areaKey) => {
        const areaSystems = systems.filter((system) => system.area === areaKey);

        return {
            key: areaKey,
            total: areaSystems.length,
            counts: {
                validado: areaSystems.filter((system) => system.validation === "validado").length,
                observado: areaSystems.filter((system) => system.validation === "observado").length,
                pendiente: areaSystems.filter((system) => system.validation === "pendiente").length
            }
        };
    }).filter((area) => area.total > 0);

    if (!areas.length) {
        elements.complianceChart.innerHTML = `
            <div class="executive-inline-empty">No hay estados de validación por área para los filtros aplicados.</div>
        `;
        return;
    }

    elements.complianceChart.innerHTML = `
        <div class="validation-area-chart">
            ${areas.map((area) => `
                <div class="validation-area-chart__row">
                    <button
                        type="button"
                        class="validation-area-chart__area"
                        data-validation-area="${area.key}"
                        aria-pressed="${dashboardState.filters.area === area.key}"
                    >
                        ${getAreaLabel(area.key)}
                    </button>

                    <div class="validation-area-chart__bar" aria-label="${getAreaLabel(area.key)}: ${area.total} sistemas">
                        ${states.map((state) => {
                            const value = area.counts[state];
                            const width = percent(value, area.total);
                            const selected = dashboardState.filters.validation === state;
                            const muted = dashboardState.filters.validation !== "all" && !selected;

                            return `
                                <button
                                    type="button"
                                    class="validation-area-chart__segment${selected ? " is-selected" : ""}${muted ? " is-muted" : ""}"
                                    style="width:${width}%;background:${CHART_COLORS.validation[state]}"
                                    data-validation-state="${state}"
                                    aria-pressed="${selected}"
                                    aria-label="${getAreaLabel(area.key)}, ${VALIDATION_LABELS[state]}: ${value} sistemas, ${width} por ciento"
                                    title="${getAreaLabel(area.key)} · ${VALIDATION_LABELS[state]}: ${value} (${width}%)"
                                >
                                    ${width >= 18 ? value : ""}
                                </button>
                            `;
                        }).join("")}
                    </div>

                    <strong class="validation-area-chart__total">${area.total}</strong>
                </div>
            `).join("")}

            <div class="validation-area-chart__legend" aria-label="Leyenda de estados de validación">
                ${states.map((state) => `
                    <button
                        type="button"
                        data-validation-state="${state}"
                        aria-pressed="${dashboardState.filters.validation === state}"
                    >
                        <i style="background:${CHART_COLORS.validation[state]}" aria-hidden="true"></i>
                        ${VALIDATION_LABELS[state]}
                    </button>
                `).join("")}
            </div>
        </div>
    `;
}

/* ============================================================
   GRÁFICO DE PROYECTOS
============================================================ */

function renderProjectChart(projects) {
    if (!projects.length) {
        elements.projectChart.innerHTML = `
            <div class="executive-inline-empty">
                No existen proyectos para el área o criterio seleccionado.
            </div>
        `;
        return;
    }

    const sortedProjects = [...projects].sort((a, b) => {
        const order = { delayed: 0, risk: 1, "on-track": 2, completed: 3 };
        if (order[a.status] !== order[b.status]) {
            return order[a.status] - order[b.status];
        }
        return b.plannedProgress - a.plannedProgress;
    });

    elements.projectChart.innerHTML = `
        ${sortedProjects.map((project) => {
            const delta = project.actualProgress - project.plannedProgress;
            const deltaText = `${delta >= 0 ? "+" : ""}${delta} pp vs plan.`;

            return `
                <button
                    type="button"
                    class="project-chart__row"
                    data-project-id="${project.id}"
                    aria-pressed="${dashboardState.selectedProjectId === project.id}"
                    aria-label="Ver detalle de ${escapeHTML(project.name)}, avance real ${project.actualProgress} por ciento, avance planificado ${project.plannedProgress} por ciento"
                >
                    <span class="project-chart__name" title="${escapeHTML(project.name)}">
                        ${escapeHTML(project.name)}
                    </span>
                    <span class="project-chart__bars" aria-hidden="true">
                        <span class="project-chart__bar-track" style="--planned:${project.plannedProgress}%;--actual:${project.actualProgress}%;--project-color:${CHART_COLORS.project[project.status]}">
                            <span class="project-chart__planned"></span>
                            <span class="project-chart__actual"></span>
                        </span>
                        <span class="project-chart__labels">
                            <small>Plan.: ${project.plannedProgress}%</small>
                            <small>Real: ${project.actualProgress}%</small>
                        </span>
                    </span>
                    <span class="project-chart__value-group">
                        <strong class="project-chart__value">${project.actualProgress}%</strong>
                        <small class="project-chart__planned-value">Plan. ${project.plannedProgress}%</small>
                        <small class="project-chart__delta">${deltaText}</small>
                    </span>
                </button>
            `;
        }).join("")}
        <div class="project-chart__legend" aria-label="Leyenda del avance">
            <span><i style="background:#dfe5ea"></i>Gris = avance planificado</span>
            <span><i style="background:${CHART_COLORS.project["on-track"]}"></i>Color = avance real</span>
        </div>
    `;
}

function renderProjectDetail(projects) {
    const selected = projects.find(
        (project) => project.id === dashboardState.selectedProjectId
    );

    if (!selected) {
        elements.projectDetail.innerHTML = `
            <div class="project-detail__empty">
                Seleccione un proyecto del gráfico de avance.
            </div>
        `;
        return;
    }

    elements.projectDetail.innerHTML = `
        <div class="project-detail__content">
            <span class="project-detail__status project-detail__status--${selected.status}">
                ${PROJECT_STATUS_LABELS[selected.status]}
            </span>
            <h3>${escapeHTML(selected.name)}</h3>
            <p>${escapeHTML(selected.description)}</p>

            <div class="project-detail__grid">
                <div class="project-detail__item">
                    <span>Avance real</span>
                    <strong>${selected.actualProgress}%</strong>
                </div>
                <div class="project-detail__item">
                    <span>Avance planificado</span>
                    <strong>${selected.plannedProgress}%</strong>
                </div>
                <div class="project-detail__item">
                    <span>Desviación vs plan</span>
                    <strong>${selected.actualProgress - selected.plannedProgress >= 0 ? "+" : ""}${selected.actualProgress - selected.plannedProgress} pp</strong>
                </div>
                <div class="project-detail__item">
                    <span>Fase actual</span>
                    <strong>${escapeHTML(selected.phase)}</strong>
                </div>
                <div class="project-detail__item">
                    <span>Responsable</span>
                    <strong>${escapeHTML(selected.responsible)}</strong>
                </div>
                <div class="project-detail__item">
                    <span>Fecha estimada</span>
                    <strong>${formatDate(selected.endDate)}</strong>
                </div>
                <div class="project-detail__item">
                    <span>Próximo hito</span>
                    <strong>${escapeHTML(selected.milestone)}</strong>
                </div>
            </div>
        </div>
    `;
}

/* ============================================================
   GRÁFICO DE TENDENCIA
============================================================ */

function calculateTrendData() {
    return PERIOD_ORDER.map((period) => {
        const systems = getFilteredSystems(period);
        const metrics = calculateSystemMetrics(systems);

        return {
            period,
            label: PERIOD_LABELS[period].replace(" · ", " "),
            health: metrics.healthPercentage,
            compliance: metrics.compliancePercentage
        };
    });
}

function createLinePath(points) {
    if (!points.length) {
        return "";
    }

    return points.map((point, index) => (
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )).join(" ");
}

function createAreaPath(points, baseline) {
    if (!points.length) {
        return "";
    }

    const line = createLinePath(points);
    return `${line} L ${points.at(-1).x} ${baseline} L ${points[0].x} ${baseline} Z`;
}

function renderTrendChart() {
    const data = calculateTrendData();
    const width = 920;
    const height = 280;
    const margin = { top: 22, right: 30, bottom: 48, left: 48 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const xStep = data.length > 1 ? plotWidth / (data.length - 1) : 0;
    const y = (value) => margin.top + plotHeight - (clamp(value) / 100) * plotHeight;
    const x = (index) => margin.left + index * xStep;
    const healthPoints = data.map((item, index) => ({ x: x(index), y: y(item.health), ...item }));
    const compliancePoints = data.map((item, index) => ({ x: x(index), y: y(item.compliance), ...item }));
    const gridValues = [0, 25, 50, 75, 100];

    const seriesMarkup = [];

    if (dashboardState.trendSeries.health) {
        seriesMarkup.push(`
            <path
                class="trend-chart__area"
                d="${createAreaPath(healthPoints, margin.top + plotHeight)}"
                fill="${CHART_COLORS.trend.health}"
            ></path>
            <path
                class="trend-chart__line"
                d="${createLinePath(healthPoints)}"
                stroke="${CHART_COLORS.trend.health}"
            ></path>
            ${healthPoints.map((point) => `
                <circle
                    class="trend-chart__point"
                    cx="${point.x}"
                    cy="${point.y}"
                    r="6"
                    fill="${CHART_COLORS.trend.health}"
                    tabindex="0"
                    aria-label="${point.label}, salud tecnológica ${point.health} por ciento"
                >
                    <title>${point.label}: salud tecnológica ${point.health}%</title>
                </circle>
            `).join("")}
        `);
    }

    if (dashboardState.trendSeries.compliance) {
        seriesMarkup.push(`
            <path
                class="trend-chart__area"
                d="${createAreaPath(compliancePoints, margin.top + plotHeight)}"
                fill="${CHART_COLORS.trend.compliance}"
            ></path>
            <path
                class="trend-chart__line"
                d="${createLinePath(compliancePoints)}"
                stroke="${CHART_COLORS.trend.compliance}"
            ></path>
            ${compliancePoints.map((point) => `
                <circle
                    class="trend-chart__point"
                    cx="${point.x}"
                    cy="${point.y}"
                    r="6"
                    fill="${CHART_COLORS.trend.compliance}"
                    tabindex="0"
                    aria-label="${point.label}, cumplimiento ${point.compliance} por ciento"
                >
                    <title>${point.label}: cumplimiento ${point.compliance}%</title>
                </circle>
            `).join("")}
        `);
    }

    elements.trendChart.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="trend-title trend-desc">
            <title id="trend-title">Tendencia de salud tecnológica y cumplimiento</title>
            <desc id="trend-desc">Evolución porcentual durante los tres semestres disponibles.</desc>

            ${gridValues.map((value) => `
                <line
                    class="trend-chart__grid"
                    x1="${margin.left}"
                    y1="${y(value)}"
                    x2="${width - margin.right}"
                    y2="${y(value)}"
                ></line>
                <text
                    class="trend-chart__axis-label"
                    x="${margin.left - 12}"
                    y="${y(value) + 4}"
                    text-anchor="end"
                >${value}%</text>
            `).join("")}

            ${data.map((item, index) => `
                <text
                    class="trend-chart__axis-label"
                    x="${x(index)}"
                    y="${height - 16}"
                    text-anchor="middle"
                >${item.period}</text>
            `).join("")}

            ${seriesMarkup.join("")}
        </svg>
    `;
}

/* ============================================================
   INDICADORES SECUNDARIOS Y ALERTAS
============================================================ */

function renderSecondaryKpis(current) {
    setText(elements.secondaryCritical, current.system.critical);
    setText(elements.secondaryLegacy, current.system.legacy);
    setText(elements.secondaryNoSupport, current.system.noSupport);
    setText(elements.secondaryObsolete, current.system.obsolete);
    setText(elements.secondaryObserved, current.system.observed);
    setText(elements.secondaryDelayed, current.project.delayed);

    document.querySelectorAll("[data-quick-filter]").forEach((card) => {
        const filter = card.dataset.quickFilter;
        const active = (filter === "critical" && dashboardState.healthFocus === "critico")
            || (filter === "observed" && dashboardState.quickFilter === "observed")
            || (["legacy", "noSupport", "obsolete"].includes(filter) && dashboardState.quickFilter === filter);

        card.classList.toggle("is-active", active);
        card.setAttribute("aria-pressed", active ? "true" : "false");
    });
}

function buildAlerts(current) {
    const alerts = [];

    if (current.system.critical > 0) {
        alerts.push({
            tone: "danger",
            title: `${current.system.critical} sistemas en estado tecnológico crítico`,
            detail: "Requieren revisión prioritaria de continuidad, seguridad o soporte.",
            action: "health",
            value: "critico"
        });
    }

    if (current.system.noSupport > 0) {
        alerts.push({
            tone: "danger",
            title: `${current.system.noSupport} sistemas sin soporte vigente`,
            detail: "Deben evaluarse para renovación técnica o migración.",
            action: "noSupport"
        });
    }

    if (current.system.observed > 0) {
        alerts.push({
            tone: "warning",
            title: `${current.system.observed} registros observados`,
            detail: "Tienen correcciones pendientes antes de completar la validación.",
            action: "validation",
            value: "observado"
        });
    }

    if (current.system.obsolete > 0) {
        alerts.push({
            tone: "warning",
            title: `${current.system.obsolete} sistemas con tecnología obsoleta`,
            detail: "Requieren análisis de actualización y previsión de recursos.",
            action: "obsolete"
        });
    }

    if (current.project.delayed > 0) {
        alerts.push({
            tone: "danger",
            title: `${current.project.delayed} proyectos retrasados`,
            detail: "El avance real se encuentra por debajo del plan establecido.",
            action: "delayedProjects"
        });
    }

    return alerts.slice(0, 5);
}

function renderAlerts(current) {
    const alerts = buildAlerts(current);
    setText(elements.alertTotal, `${alerts.length} ${alerts.length === 1 ? "alerta" : "alertas"}`);

    if (!alerts.length) {
        elements.executiveAlertList.innerHTML = `
            <div class="executive-inline-empty">
                No se identifican alertas en el alcance seleccionado.
            </div>
        `;
        return;
    }

    elements.executiveAlertList.innerHTML = alerts.map((alert) => `
        <article class="executive-alert executive-alert--${alert.tone}">
            <span class="executive-alert__indicator" aria-hidden="true"></span>
            <div class="executive-alert__content">
                <strong>${escapeHTML(alert.title)}</strong>
                <span>${escapeHTML(alert.detail)}</span>
            </div>
            <button
                type="button"
                class="executive-alert__action"
                data-alert-action="${alert.action}"
                data-alert-value="${alert.value || ""}"
            >
                Revisar
            </button>
        </article>
    `).join("");
}

/* ============================================================
   TABLA, ORDENAMIENTO Y PAGINACIÓN
============================================================ */

function getPrimaryAlert(system) {
    if (system.health === "critico") {
        return "Estado tecnológico crítico";
    }

    if (system.noSupport) {
        return "Sin soporte vigente";
    }

    if (system.obsolete) {
        return "Tecnología obsoleta";
    }

    if (system.validation === "observado") {
        return "Registro observado";
    }

    if (system.validation === "pendiente") {
        return "Validación pendiente";
    }

    return "Seguimiento preventivo";
}

function getSortValue(system, key) {
    const orders = {
        criticality: { critica: 0, alta: 1, media: 2, baja: 3 },
        validation: { observado: 0, pendiente: 1, validado: 2 },
        priority: { inmediata: 0, "corto-plazo": 1, "mediano-plazo": 2, monitoreo: 3 }
    };

    if (orders[key]) {
        return orders[key][system[key]] ?? 99;
    }

    if (key === "area") {
        return getAreaLabel(system.area);
    }

    return normalizeText(system[key]);
}

function sortSystems(systems) {
    const { key, direction } = dashboardState.sort;
    const multiplier = direction === "asc" ? 1 : -1;

    return [...systems].sort((a, b) => {
        const aValue = getSortValue(a, key);
        const bValue = getSortValue(b, key);

        if (aValue < bValue) {
            return -1 * multiplier;
        }

        if (aValue > bValue) {
            return 1 * multiplier;
        }

        return a.code.localeCompare(b.code, "es") * multiplier;
    });
}

function renderPriorityTable() {
    const allRows = sortSystems(getTableSystems());
    const pageSize = dashboardState.pagination.pageSize;
    const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
    dashboardState.pagination.page = Math.min(dashboardState.pagination.page, totalPages);

    const start = (dashboardState.pagination.page - 1) * pageSize;
    const end = Math.min(start + pageSize, allRows.length);
    const pageRows = allRows.slice(start, end);

    if (!pageRows.length) {
        elements.priorityTableBody.innerHTML = `
            <tr class="executive-table-empty">
                <td colspan="8">No existen prioridades para la selección actual.</td>
            </tr>
        `;
    } else {
        elements.priorityTableBody.innerHTML = pageRows.map((system) => `
            <tr>
                <td><strong>${escapeHTML(system.code)}</strong></td>
                <td class="executive-table__system">
                    <strong>${escapeHTML(system.name)}</strong>
                    <span>${escapeHTML(system.type)}</span>
                </td>
                <td>${escapeHTML(getAreaLabel(system.area))}</td>
                <td>${escapeHTML(getPrimaryAlert(system))}</td>
                <td>
                    <span class="executive-status-badge executive-status-badge--${system.criticality}">
                        ${escapeHTML(CRITICALITY_LABELS[system.criticality])}
                    </span>
                </td>
                <td>
                    <span class="executive-status-badge executive-status-badge--${system.validation}">
                        ${escapeHTML(VALIDATION_LABELS[system.validation])}
                    </span>
                </td>
                <td>
                    <span class="executive-priority-badge executive-priority-badge--${system.priority}">
                        ${escapeHTML(PRIORITY_LABELS[system.priority])}
                    </span>
                </td>
                <td>
                    <button
                        type="button"
                        class="executive-table__detail-button"
                        data-system-code="${escapeHTML(system.code)}"
                    >
                        Ver detalle
                    </button>
                </td>
            </tr>
        `).join("");
    }

    const contextParts = [];

    if (dashboardState.healthFocus) {
        contextParts.push(`Salud: ${HEALTH_LABELS[dashboardState.healthFocus]}`);
    }

    contextParts.push(`Orden: ${getSortLabel(dashboardState.sort.key)}`);
    setText(elements.tableFilterContext, contextParts.join(" · "));

    setText(
        elements.paginationSummary,
        allRows.length
            ? `Mostrando ${start + 1}–${end} de ${allRows.length} resultados`
            : "Sin resultados"
    );
    setText(
        elements.paginationPage,
        `Página ${dashboardState.pagination.page} de ${totalPages}`
    );

    elements.previousPage.disabled = dashboardState.pagination.page <= 1;
    elements.nextPage.disabled = dashboardState.pagination.page >= totalPages;
    updateSortHeaders();
}

function getSortLabel(key) {
    return {
        code: "Código",
        name: "Sistema",
        area: "Área",
        criticality: "Criticidad",
        validation: "Estado",
        priority: "Prioridad"
    }[key] || "Prioridad";
}

function updateSortHeaders() {
    document.querySelectorAll("[data-sort-key]").forEach((button) => {
        const active = button.dataset.sortKey === dashboardState.sort.key;
        button.dataset.sortDirection = active ? dashboardState.sort.direction : "";

        const th = button.closest("th");
        if (th) {
            th.setAttribute(
                "aria-sort",
                active
                    ? (dashboardState.sort.direction === "asc" ? "ascending" : "descending")
                    : "none"
            );
        }
    });
}

function openSystemDetail(code) {
    const system = getSystemsForPeriod(dashboardState.filters.period)
        .find((item) => item.code === code);

    if (!system) {
        return;
    }

    setText(elements.dialogSystemTitle, `${system.code} · ${system.name}`);
    elements.dialogSystemContent.innerHTML = `
        <div class="executive-dialog__summary">
            <div class="executive-dialog__item">
                <span>Área funcional</span>
                <strong>${escapeHTML(getAreaLabel(system.area))}</strong>
            </div>
            <div class="executive-dialog__item">
                <span>Responsable</span>
                <strong>${escapeHTML(system.owner)}</strong>
            </div>
            <div class="executive-dialog__item">
                <span>Criticidad</span>
                <strong>${escapeHTML(CRITICALITY_LABELS[system.criticality])}</strong>
            </div>
            <div class="executive-dialog__item">
                <span>Estado de validación</span>
                <strong>${escapeHTML(VALIDATION_LABELS[system.validation])}</strong>
            </div>
            <div class="executive-dialog__item">
                <span>Nivel de riesgo</span>
                <strong>${escapeHTML(system.risk)}</strong>
            </div>
            <div class="executive-dialog__item">
                <span>Fin de soporte</span>
                <strong>${formatDate(system.supportEnd)}</strong>
            </div>
            <div class="executive-dialog__item">
                <span>Prioridad</span>
                <strong>${escapeHTML(PRIORITY_LABELS[system.priority])}</strong>
            </div>
        </div>
        <div class="executive-dialog__recommendation">
            <strong>Recomendación ejecutiva:</strong>
            ${escapeHTML(system.recommendation)}
        </div>
    `;

    if (typeof elements.systemDetailDialog.showModal === "function") {
        elements.systemDetailDialog.showModal();
    } else {
        elements.systemDetailDialog.setAttribute("open", "");
    }
}

/* ============================================================
   EVENTOS Y ACCIONES
============================================================ */

function resetFilters() {
    dashboardState.filters = {
        period: "2026-I",
        area: "all",
        criticality: "all",
        validation: "all",
        search: ""
    };
    dashboardState.healthFocus = null;
    dashboardState.quickFilter = null;
    dashboardState.delayedProjectsOnly = false;
    dashboardState.selectedProjectId = null;
    dashboardState.pagination.page = 1;

    elements.filterPeriod.value = dashboardState.filters.period;
    elements.filterArea.value = dashboardState.filters.area;
    elements.filterCriticality.value = dashboardState.filters.criticality;
    elements.filterValidation.value = dashboardState.filters.validation;
    elements.filterSearch.value = "";

    renderDashboard();
}

function removeFilter(key) {
    if (key === "health") {
        dashboardState.healthFocus = null;
    } else if (key === "search") {
        dashboardState.filters.search = "";
        elements.filterSearch.value = "";
    } else if (["area", "criticality", "validation"].includes(key)) {
        dashboardState.filters[key] = "all";
        const element = {
            area: elements.filterArea,
            criticality: elements.filterCriticality,
            validation: elements.filterValidation
        }[key];
        element.value = "all";
    } else if (key === "quick") {
        dashboardState.quickFilter = null;
    }

    dashboardState.pagination.page = 1;
    renderDashboard();
}

function handleHealthSelection(value) {
    dashboardState.healthFocus = dashboardState.healthFocus === value ? null : value;
    dashboardState.pagination.page = 1;
    renderDashboard();
}

function handleValidationSelection(value) {
    dashboardState.filters.validation = dashboardState.filters.validation === value
        ? "all"
        : value;
    elements.filterValidation.value = dashboardState.filters.validation;
    dashboardState.pagination.page = 1;
    renderDashboard();
}

function handleQuickIndicatorSelection(filter) {
    if (filter === "critical") {
        dashboardState.quickFilter = null;
        handleHealthSelection("critico");
        elements.priorityTableBody.closest(".executive-table-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    if (filter === "delayed") {
        const delayedProject = getFilteredProjects().find((project) => project.status === "delayed");
        dashboardState.selectedProjectId = delayedProject ? delayedProject.id : null;
        renderDashboard();
        document.querySelector(".executive-projects-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    dashboardState.healthFocus = null;
    dashboardState.quickFilter = dashboardState.quickFilter === filter ? null : filter;
    dashboardState.pagination.page = 1;
    renderDashboard();
    elements.priorityTableBody.closest(".executive-table-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleAlertAction(action, value) {
    if (action === "health") {
        handleHealthSelection(value);
        elements.priorityTableBody.closest(".executive-table-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        return;
    }

    if (action === "validation") {
        handleValidationSelection(value);
        return;
    }

    if (action === "delayedProjects") {
        const delayedProject = getFilteredProjects().find((project) => project.status === "delayed");
        dashboardState.selectedProjectId = delayedProject ? delayedProject.id : null;
        renderDashboard();
        elements.projectChart.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    const systems = getFilteredSystems().filter((system) => (
        action === "noSupport" ? system.noSupport : system.obsolete
    ));

    if (systems[0]) {
        openSystemDetail(systems[0].code);
    }
}

function bindEvents() {
    elements.filterPeriod.addEventListener("change", (event) => {
        dashboardState.filters.period = event.target.value;
        dashboardState.selectedProjectId = null;
        dashboardState.pagination.page = 1;
        renderDashboard();
    });

    elements.filterArea.addEventListener("change", (event) => {
        dashboardState.filters.area = event.target.value;
        dashboardState.selectedProjectId = null;
        dashboardState.pagination.page = 1;
        renderDashboard();
    });

    elements.filterCriticality.addEventListener("change", (event) => {
        dashboardState.filters.criticality = event.target.value;
        dashboardState.pagination.page = 1;
        renderDashboard();
    });

    elements.filterValidation.addEventListener("change", (event) => {
        dashboardState.filters.validation = event.target.value;
        dashboardState.pagination.page = 1;
        renderDashboard();
    });

    elements.filterSearch.addEventListener("input", (event) => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(() => {
            dashboardState.filters.search = event.target.value.trim();
            dashboardState.pagination.page = 1;
            renderDashboard();
        }, 220);
    });

    elements.resetDashboardFilters.addEventListener("click", resetFilters);
    elements.emptyResetFilters.addEventListener("click", resetFilters);
    elements.retryDashboard.addEventListener("click", loadDashboardData);

    elements.activeFilterList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-remove-filter]");
        if (button) {
            removeFilter(button.dataset.removeFilter);
        }
    });

    [elements.healthChart, elements.healthLegend].forEach((container) => {
        container.addEventListener("click", (event) => {
            const target = event.target.closest("[data-validation-state]");
            if (target) {
                handleValidationSelection(target.dataset.validationState);
            }
        });

        container.addEventListener("keydown", (event) => {
            if (!["Enter", " "].includes(event.key)) {
                return;
            }

            const target = event.target.closest("[data-validation-state]");
            if (target) {
                event.preventDefault();
                handleValidationSelection(target.dataset.validationState);
            }
        });
    });

    elements.areaChart.addEventListener("click", (event) => {
        const row = event.target.closest("[data-area-key]");
        if (!row) {
            return;
        }

        const area = row.dataset.areaKey;
        dashboardState.filters.area = dashboardState.filters.area === area ? "all" : area;
        elements.filterArea.value = dashboardState.filters.area;
        dashboardState.selectedProjectId = null;
        dashboardState.pagination.page = 1;
        renderDashboard();
    });

    elements.complianceChart.addEventListener("click", (event) => {
        const validationTarget = event.target.closest("[data-validation-state]");
        if (validationTarget) {
            handleValidationSelection(validationTarget.dataset.validationState);
            return;
        }

        const areaTarget = event.target.closest("[data-validation-area]");
        if (areaTarget) {
            const area = areaTarget.dataset.validationArea;
            dashboardState.filters.area = dashboardState.filters.area === area ? "all" : area;
            elements.filterArea.value = dashboardState.filters.area;
            dashboardState.selectedProjectId = null;
            dashboardState.pagination.page = 1;
            renderDashboard();
        }
    });

    elements.projectChart.addEventListener("click", (event) => {
        const row = event.target.closest("[data-project-id]");
        if (!row) {
            return;
        }

        dashboardState.selectedProjectId = dashboardState.selectedProjectId === row.dataset.projectId
            ? null
            : row.dataset.projectId;
        renderDashboard();
    });

    elements.trendHealthToggle.addEventListener("change", (event) => {
        dashboardState.trendSeries.health = event.target.checked;
        renderTrendChart();
    });

    elements.trendComplianceToggle.addEventListener("change", (event) => {
        dashboardState.trendSeries.compliance = event.target.checked;
        renderTrendChart();
    });

    elements.executiveAlertList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-alert-action]");
        if (button) {
            handleAlertAction(button.dataset.alertAction, button.dataset.alertValue);
        }
    });

    document.querySelector(".executive-table thead").addEventListener("click", (event) => {
        const button = event.target.closest("[data-sort-key]");
        if (!button) {
            return;
        }

        const key = button.dataset.sortKey;
        dashboardState.sort.direction = dashboardState.sort.key === key
            ? (dashboardState.sort.direction === "asc" ? "desc" : "asc")
            : "asc";
        dashboardState.sort.key = key;
        dashboardState.pagination.page = 1;
        renderPriorityTable();
    });

    elements.priorityTableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-system-code]");
        if (button) {
            openSystemDetail(button.dataset.systemCode);
        }
    });

    elements.tablePageSize.addEventListener("change", (event) => {
        dashboardState.pagination.pageSize = Number(event.target.value) || 10;
        dashboardState.pagination.page = 1;
        renderPriorityTable();
    });

    elements.previousPage.addEventListener("click", () => {
        dashboardState.pagination.page = Math.max(1, dashboardState.pagination.page - 1);
        renderPriorityTable();
    });

    elements.nextPage.addEventListener("click", () => {
        dashboardState.pagination.page += 1;
        renderPriorityTable();
    });

    elements.systemDetailDialog.addEventListener("click", (event) => {
        if (event.target === elements.systemDetailDialog) {
            elements.systemDetailDialog.close();
        }
    });
}

/* ============================================================
   INICIALIZACIÓN
============================================================ */

function cacheElements() {
    const ids = [
        "dashboard-result-summary",
        "filter-period",
        "filter-area",
        "filter-criticality",
        "filter-validation",
        "filter-search",
        "reset-dashboard-filters",
        "active-filter-list",
        "dashboard-loading",
        "dashboard-error",
        "dashboard-error-message",
        "retry-dashboard",
        "dashboard-empty",
        "empty-reset-filters",
        "dashboard-content",
        "kpi-total-systems",
        "kpi-total-detail",
        "kpi-total-trend",
        "kpi-health",
        "kpi-health-detail",
        "kpi-health-trend",
        "kpi-project-progress",
        "kpi-project-detail",
        "kpi-project-trend",
        "kpi-compliance",
        "kpi-compliance-detail",
        "kpi-compliance-trend",
        "health-total",
        "health-chart",
        "health-legend",
        "area-chart",
        "compliance-chart",
        "project-chart",
        "project-detail",
        "trend-health-toggle",
        "trend-compliance-toggle",
        "trend-chart",
        "secondary-critical",
        "secondary-legacy",
        "secondary-no-support",
        "secondary-obsolete",
        "secondary-observed",
        "secondary-delayed",
        "alert-total",
        "executive-alert-list",
        "table-page-size",
        "table-filter-context",
        "priority-table-body",
        "pagination-summary",
        "pagination-page",
        "previous-page",
        "next-page",
        "system-detail-dialog",
        "dialog-system-title",
        "dialog-system-content"
    ];

    ids.forEach((id) => {
        const key = id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        elements[key] = document.getElementById(id);
    });
}

function initializeDashboard() {
    cacheElements();

    const required = [
        elements.dashboardContent,
        elements.filterPeriod,
        elements.healthChart,
        elements.priorityTableBody
    ];

    if (required.some((element) => !element)) {
        console.error("[DIAGTI] Faltan elementos obligatorios del Dashboard Ejecutivo.");
        return;
    }

    bindEvents();
    loadDashboardData();
}

document.addEventListener("DOMContentLoaded", initializeDashboard);

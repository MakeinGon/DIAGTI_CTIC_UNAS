"use strict";

const RISK_CONFIG = Object.freeze({
    source: "demo",
    endpoint: "/api/directivo/dashboard-riesgos",
    timeoutMs: 10000,
    demoDelayMs: 250
});

const RISK_LABELS = Object.freeze({
    level: { critico: "Crítico", advertencia: "Advertencia", controlado: "Controlado" },
    status: { abierto: "Abierto", mitigacion: "En mitigación", controlado: "Controlado" },
    probability: { 1: "Baja", 2: "Media", 3: "Alta" },
    impact: { 1: "Bajo", 2: "Medio", 3: "Alto" }
});

const RISK_COLORS = Object.freeze({ critico: "#cf3333", advertencia: "#e7a52d", controlado: "#1abb9c" });

const RISK_DEMO = [
    { id:"R-001", code:"R-001", title:"Interrupción del Sistema Académico", period:"2026-I", area:"Gestión Académica", category:"Disponibilidad", level:"critico", probability:3, impact:3, status:"abierto", vulnerability:true, bottleneck:false, stage:"Validación técnica", responsible:"Área de Desarrollo", detectedAt:"2026-05-14", recommendation:"Implementar alta disponibilidad y prueba de recuperación." },
    { id:"R-002", code:"R-002", title:"Framework sin soporte en Tesorería", period:"2026-I", area:"Gestión Administrativa", category:"Seguridad", level:"critico", probability:3, impact:3, status:"mitigacion", vulnerability:true, bottleneck:false, stage:"Subsanación", responsible:"Desarrollo / Tesorería", detectedAt:"2026-04-18", recommendation:"Priorizar actualización tecnológica y pruebas de regresión." },
    { id:"R-003", code:"R-003", title:"Evidencias incompletas de continuidad", period:"2026-I", area:"Infraestructura TI", category:"Continuidad", level:"advertencia", probability:2, impact:3, status:"abierto", vulnerability:false, bottleneck:true, stage:"Validación de evidencias", responsible:"Infraestructura", detectedAt:"2026-06-02", recommendation:"Completar evidencias y aprobar plan de continuidad." },
    { id:"R-004", code:"R-004", title:"Cuenta privilegiada sin revisión reciente", period:"2026-I", area:"Gestión Administrativa", category:"Seguridad", level:"critico", probability:2, impact:3, status:"abierto", vulnerability:true, bottleneck:false, stage:"Revisión de seguridad", responsible:"Seguridad TI", detectedAt:"2026-06-11", recommendation:"Auditar privilegios y aplicar recertificación de accesos." },
    { id:"R-005", code:"R-005", title:"Demora en validación funcional", period:"2026-I", area:"Gestión Académica", category:"Validación", level:"advertencia", probability:3, impact:2, status:"mitigacion", vulnerability:false, bottleneck:true, stage:"Validación funcional", responsible:"Área Funcional", detectedAt:"2026-05-29", recommendation:"Definir responsables y plazo máximo de respuesta." },
    { id:"R-006", code:"R-006", title:"Capacidad de almacenamiento cercana al límite", period:"2026-I", area:"Infraestructura TI", category:"Infraestructura", level:"advertencia", probability:2, impact:2, status:"mitigacion", vulnerability:false, bottleneck:false, stage:"Evaluación técnica", responsible:"Infraestructura", detectedAt:"2026-06-19", recommendation:"Ampliar capacidad y configurar alertas preventivas." },
    { id:"R-007", code:"R-007", title:"Dependencia de integración no documentada", period:"2026-I", area:"Investigación", category:"Integraciones", level:"advertencia", probability:2, impact:2, status:"abierto", vulnerability:false, bottleneck:true, stage:"Levantamiento", responsible:"Desarrollo", detectedAt:"2026-04-27", recommendation:"Documentar contratos e implementar monitoreo de integración." },
    { id:"R-008", code:"R-008", title:"Respaldo verificado correctamente", period:"2026-I", area:"Gestión Académica", category:"Continuidad", level:"controlado", probability:1, impact:2, status:"controlado", vulnerability:false, bottleneck:false, stage:"Cierre", responsible:"Infraestructura", detectedAt:"2026-03-12", recommendation:"Mantener pruebas trimestrales de restauración." },
    { id:"R-009", code:"R-009", title:"Política de contraseñas aplicada", period:"2026-I", area:"Gestión Administrativa", category:"Seguridad", level:"controlado", probability:1, impact:1, status:"controlado", vulnerability:false, bottleneck:false, stage:"Cierre", responsible:"Seguridad TI", detectedAt:"2026-02-08", recommendation:"Mantener revisión semestral de la política." },
    { id:"R-010", code:"R-010", title:"Monitoreo de disponibilidad operativo", period:"2026-I", area:"Infraestructura TI", category:"Disponibilidad", level:"controlado", probability:1, impact:2, status:"controlado", vulnerability:false, bottleneck:false, stage:"Cierre", responsible:"Infraestructura", detectedAt:"2026-01-21", recommendation:"Mantener umbrales y escalamiento configurados." },
    { id:"R-011", code:"R-011", title:"Observaciones pendientes en Aula Virtual", period:"2026-I", area:"Gestión Académica", category:"Validación", level:"advertencia", probability:2, impact:2, status:"abierto", vulnerability:false, bottleneck:true, stage:"Subsanación", responsible:"Desarrollo", detectedAt:"2026-06-24", recommendation:"Completar correcciones antes del cierre del diagnóstico." },
    { id:"R-012", code:"R-012", title:"Certificado próximo a vencer", period:"2026-I", area:"Investigación", category:"Seguridad", level:"advertencia", probability:2, impact:2, status:"mitigacion", vulnerability:true, bottleneck:false, stage:"Renovación", responsible:"Infraestructura", detectedAt:"2026-06-28", recommendation:"Renovar certificado y verificar despliegue en todos los nodos." },
    { id:"R-013", code:"R-013", title:"Punto único de falla en base de datos", period:"2025-II", area:"Gestión Académica", category:"Disponibilidad", level:"critico", probability:3, impact:3, status:"mitigacion", vulnerability:false, bottleneck:false, stage:"Diseño de solución", responsible:"Base de Datos", detectedAt:"2025-10-16", recommendation:"Diseñar réplica y plan de conmutación." },
    { id:"R-014", code:"R-014", title:"Registro de auditoría incompleto", period:"2025-II", area:"Gestión Administrativa", category:"Cumplimiento", level:"advertencia", probability:2, impact:2, status:"abierto", vulnerability:true, bottleneck:false, stage:"Revisión", responsible:"Auditoría TI", detectedAt:"2025-11-09", recommendation:"Completar eventos auditables y política de retención." }
];

const state = {
    data: [], filters: { period:"2026-I", area:"all", category:"all", level:"all", status:"all", search:"" },
    matrix: null, flag: null, sort: { key:"level", direction:"asc" }, page:1, pageSize:10, loading:false
};
const el = {};
let searchTimer;

function normalize(value) { return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(); }
function escapeHTML(value) { return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function safeArray(value) { return Array.isArray(value) ? value.filter(item => item && typeof item === "object") : []; }
function unique(values) { return [...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),"es")); }
function formatDate(value) { const d=new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime()) ? "No disponible" : new Intl.DateTimeFormat("es-PE",{dateStyle:"medium"}).format(d); }
function delay(ms) { return new Promise(resolve=>setTimeout(resolve,ms)); }

function validatePayload(payload) {
    if (!payload || typeof payload !== "object") throw new Error("La respuesta del servicio no es válida.");
    return safeArray(payload.risks ?? payload.data ?? payload);
}

async function requestBackend() {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),RISK_CONFIG.timeoutMs);
    try {
        const response=await fetch(RISK_CONFIG.endpoint,{headers:{Accept:"application/json"},credentials:"same-origin",signal:controller.signal});
        if (!response.ok) throw new Error(`El servicio respondió con estado ${response.status}.`);
        return validatePayload(await response.json());
    } finally { clearTimeout(timeout); }
}

function showState(name,message="") {
    el.loading.hidden=name!=="loading";
    el.error.hidden=name!=="error";
    el.empty.hidden=name!=="empty";
    el.content.hidden=name!=="content";
    if (name==="error") el.errorMessage.textContent=message || "Error no identificado.";
}

async function loadData() {
    if (state.loading) return;
    state.loading=true; showState("loading");
    try {
        const raw=RISK_CONFIG.source==="backend" ? await requestBackend() : (await delay(RISK_CONFIG.demoDelayMs), RISK_DEMO);
        state.data=safeArray(raw).map((risk,index)=>({
            id:String(risk.id ?? risk.code ?? `R-${index+1}`), code:String(risk.code ?? risk.id ?? `R-${index+1}`),
            title:String(risk.title ?? risk.name ?? "Riesgo sin nombre"), period:String(risk.period ?? "2026-I"),
            area:String(risk.area ?? "Área no definida"), category:String(risk.category ?? "Sin categoría"),
            level:["critico","advertencia","controlado"].includes(risk.level) ? risk.level : "advertencia",
            probability:Math.min(3,Math.max(1,Number(risk.probability)||1)), impact:Math.min(3,Math.max(1,Number(risk.impact)||1)),
            status:["abierto","mitigacion","controlado"].includes(risk.status) ? risk.status : "abierto",
            vulnerability:Boolean(risk.vulnerability), bottleneck:Boolean(risk.bottleneck), stage:String(risk.stage ?? "Sin etapa"),
            responsible:String(risk.responsible ?? "Sin responsable"), detectedAt:String(risk.detectedAt ?? ""), recommendation:String(risk.recommendation ?? "Sin recomendación registrada.")
        }));
        populateDynamicFilters(); render();
    } catch(error) { console.error("[DIAGTI] Dashboard Riesgos:",error); showState("error",error.name==="AbortError"?"La consulta excedió el tiempo máximo.":error.message); }
    finally { state.loading=false; }
}

function populateDynamicFilters() {
    const add=(select,values)=>{ const current=select.value; select.querySelectorAll("option[data-dynamic]").forEach(o=>o.remove()); values.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;o.dataset.dynamic="true";select.append(o);}); if([...select.options].some(o=>o.value===current)) select.value=current; };
    add(el.filterArea,unique(state.data.map(r=>r.area))); add(el.filterCategory,unique(state.data.map(r=>r.category)));
}

function filteredRisks(ignore={}) {
    const q=normalize(state.filters.search);
    return state.data.filter(r=>{
        if (!ignore.period && r.period!==state.filters.period) return false;
        if (!ignore.area && state.filters.area!=="all" && r.area!==state.filters.area) return false;
        if (!ignore.category && state.filters.category!=="all" && r.category!==state.filters.category) return false;
        if (!ignore.level && state.filters.level!=="all" && r.level!==state.filters.level) return false;
        if (!ignore.status && state.filters.status!=="all" && r.status!==state.filters.status) return false;
        if (!ignore.matrix && state.matrix && (r.probability!==state.matrix.probability || r.impact!==state.matrix.impact)) return false;
        if (state.flag==="vulnerability" && !r.vulnerability) return false;
        if (state.flag==="bottleneck" && !r.bottleneck) return false;
        if (q && !normalize(`${r.code} ${r.title} ${r.area} ${r.category} ${r.responsible} ${r.stage}`).includes(q)) return false;
        return true;
    });
}

function render() {
    const risks=filteredRisks();
    renderActiveFilters();
    el.resultSummary.textContent=`${risks.length} riesgos encontrados · ${state.filters.period}`;
    if (!risks.length) { showState("empty"); return; }
    showState("content");
    renderKpis(risks); renderTrafficLight(); renderMatrix(); renderCategories(risks); renderBottlenecks(risks); renderTable(risks);
}

function renderActiveFilters() {
    const chips=[];
    if(state.filters.area!=="all") chips.push(["area",`Área: ${state.filters.area}`]);
    if(state.filters.category!=="all") chips.push(["category",`Categoría: ${state.filters.category}`]);
    if(state.filters.level!=="all") chips.push(["level",`Semáforo: ${RISK_LABELS.level[state.filters.level]}`]);
    if(state.filters.status!=="all") chips.push(["status",`Estado: ${RISK_LABELS.status[state.filters.status]}`]);
    if(state.filters.search) chips.push(["search",`Búsqueda: ${state.filters.search}`]);
    if(state.matrix) chips.push(["matrix",`Matriz: P${state.matrix.probability} × I${state.matrix.impact}`]);
    if(state.flag) chips.push(["flag",state.flag==="vulnerability"?"Vulnerabilidades":"Cuellos de botella"]);
    el.activeFilters.innerHTML=chips.map(([key,label])=>`<span class="analytics-filter-chip">${escapeHTML(label)}<button type="button" data-remove-risk-filter="${key}" aria-label="Quitar ${escapeHTML(label)}">×</button></span>`).join("");
}

function renderKpis(risks) {
    const count=predicate=>risks.filter(predicate).length;
    el.kpiCritical.textContent=count(r=>r.level==="critico");
    el.kpiVulnerabilities.textContent=count(r=>r.vulnerability && r.status!=="controlado");
    el.kpiBottlenecks.textContent=count(r=>r.bottleneck && r.status!=="controlado");
    el.kpiControlled.textContent=count(r=>r.level==="controlado" || r.status==="controlado");
    document.querySelectorAll("[data-risk-level]").forEach(b=>b.setAttribute("aria-pressed",String(state.filters.level===b.dataset.riskLevel)));
    document.querySelectorAll("[data-risk-flag]").forEach(b=>b.setAttribute("aria-pressed",String(state.flag===b.dataset.riskFlag)));
}

function renderTrafficLight() {
    const base=filteredRisks({level:true});
    const levels=["critico","advertencia","controlado"];
    el.totalCounter.textContent=`${base.length} riesgos`;
    el.trafficLight.innerHTML=levels.map(level=>{
        const count=base.filter(r=>r.level===level).length; const pct=base.length?Math.round(count/base.length*100):0;
        return `<button type="button" class="risk-light risk-light--${level}" data-risk-level="${level}" aria-pressed="${state.filters.level===level}"><span class="risk-light__circle" aria-hidden="true"></span><strong>${count}</strong><span>${RISK_LABELS.level[level]} · ${pct}%</span></button>`;
    }).join("");
}

function matrixTone(probability,impact) { const score=probability*impact; return score>=6?"high":score>=3?"medium":"low"; }
function renderMatrix() {
    const base=filteredRisks({matrix:true});
    let html="";
    [3,2,1].forEach(impact=>{
        html+=`<div class="risk-matrix__axis">I${impact}<br>${RISK_LABELS.impact[impact]}</div>`;
        [1,2,3].forEach(probability=>{ const count=base.filter(r=>r.probability===probability&&r.impact===impact).length; const pressed=state.matrix?.probability===probability&&state.matrix?.impact===impact; html+=`<button type="button" class="risk-matrix__cell risk-matrix__cell--${matrixTone(probability,impact)}" data-risk-probability="${probability}" data-risk-impact="${impact}" aria-pressed="${pressed}" title="Probabilidad ${RISK_LABELS.probability[probability]}, impacto ${RISK_LABELS.impact[impact]}: ${count} riesgos">${count}</button>`; });
    });
    html+='<div class="risk-matrix__axis"></div>';
    [1,2,3].forEach(p=>{html+=`<div class="risk-matrix__axis">P${p}<br>${RISK_LABELS.probability[p]}</div>`;});
    el.matrix.innerHTML=html;
}

function renderBarList(container,entries,actionAttribute,colorFn) {
    const max=Math.max(1,...entries.map(e=>e.value));
    container.innerHTML=entries.length?entries.map(e=>`<button type="button" class="analytics-bar-row" ${actionAttribute}="${escapeHTML(e.key)}"><span class="analytics-bar-row__label" title="${escapeHTML(e.label)}">${escapeHTML(e.label)}</span><span class="analytics-bar-row__track"><span class="analytics-bar-row__fill" style="width:${Math.max(3,e.value/max*100)}%;--analytics-color:${colorFn(e)}"></span></span><strong class="analytics-bar-row__value">${e.value}</strong></button>`).join(""):'<div class="analytics-state">Sin datos para mostrar.</div>';
}

function renderCategories(risks) {
    const entries=unique(risks.map(r=>r.category)).map(key=>({key,label:key,value:risks.filter(r=>r.category===key).length})).sort((a,b)=>b.value-a.value);
    renderBarList(el.categoryChart,entries,"data-risk-category",()=>"#0f75bc");
}
function renderBottlenecks(risks) {
    const blocked=risks.filter(r=>r.bottleneck);
    const entries=unique(blocked.map(r=>r.stage)).map(key=>({key,label:key,value:blocked.filter(r=>r.stage===key).length})).sort((a,b)=>b.value-a.value);
    renderBarList(el.bottleneckChart,entries,"data-risk-stage",e=>e.value>=2?"#cf3333":"#e7a52d");
}

function sortRisks(risks) {
    const order={level:{critico:0,advertencia:1,controlado:2}};
    const dir=state.sort.direction==="asc"?1:-1;
    return [...risks].sort((a,b)=>{ let av=state.sort.key==="area"?a.area:state.sort.key==="category"?a.category:state.sort.key==="level"?order.level[a.level]:a[state.sort.key]; let bv=state.sort.key==="area"?b.area:state.sort.key==="category"?b.category:state.sort.key==="level"?order.level[b.level]:b[state.sort.key]; if(av<bv)return-dir;if(av>bv)return dir; return b.probability*b.impact-a.probability*a.impact; });
}
function badge(text,tone) { return `<span class="analytics-badge analytics-badge--${tone}">${escapeHTML(text)}</span>`; }
function renderTable(risks) {
    const rows=sortRisks(risks); const pages=Math.max(1,Math.ceil(rows.length/state.pageSize)); state.page=Math.min(state.page,pages); const start=(state.page-1)*state.pageSize; const pageRows=rows.slice(start,start+state.pageSize);
    el.tableBody.innerHTML=pageRows.map(r=>`<tr><td><strong>${escapeHTML(r.code)}</strong></td><td>${escapeHTML(r.title)}</td><td>${escapeHTML(r.area)}</td><td>${escapeHTML(r.category)}</td><td>${badge(RISK_LABELS.level[r.level],r.level==="critico"?"danger":r.level==="advertencia"?"warning":"success")}</td><td>${RISK_LABELS.probability[r.probability]}</td><td>${RISK_LABELS.impact[r.impact]}</td><td>${badge(RISK_LABELS.status[r.status],r.status==="controlado"?"success":r.status==="mitigacion"?"info":"warning")}</td><td>${escapeHTML(r.responsible)}</td><td><button class="analytics-detail-button" data-risk-detail="${escapeHTML(r.id)}">Ver detalle</button></td></tr>`).join("");
    el.pageSummary.textContent=rows.length?`Mostrando ${start+1}–${Math.min(start+state.pageSize,rows.length)} de ${rows.length}`:"Sin resultados"; el.pageLabel.textContent=`Página ${state.page} de ${pages}`; el.prevPage.disabled=state.page<=1; el.nextPage.disabled=state.page>=pages;
}

function openDetail(id) {
    const r=state.data.find(item=>item.id===id); if(!r)return;
    el.dialogTitle.textContent=`${r.code} · ${r.title}`;
    el.dialogContent.innerHTML=`<div class="analytics-dialog__grid"><div class="analytics-dialog__item"><span>Área</span><strong>${escapeHTML(r.area)}</strong></div><div class="analytics-dialog__item"><span>Categoría</span><strong>${escapeHTML(r.category)}</strong></div><div class="analytics-dialog__item"><span>Semáforo</span><strong>${RISK_LABELS.level[r.level]}</strong></div><div class="analytics-dialog__item"><span>Probabilidad / Impacto</span><strong>${RISK_LABELS.probability[r.probability]} / ${RISK_LABELS.impact[r.impact]}</strong></div><div class="analytics-dialog__item"><span>Etapa</span><strong>${escapeHTML(r.stage)}</strong></div><div class="analytics-dialog__item"><span>Responsable</span><strong>${escapeHTML(r.responsible)}</strong></div><div class="analytics-dialog__item"><span>Detectado</span><strong>${formatDate(r.detectedAt)}</strong></div><div class="analytics-dialog__item"><span>Estado</span><strong>${RISK_LABELS.status[r.status]}</strong></div></div><div class="analytics-dialog__recommendation"><strong>Acción preventiva:</strong> ${escapeHTML(r.recommendation)}</div>`;
    typeof el.detailDialog.showModal==="function"?el.detailDialog.showModal():el.detailDialog.setAttribute("open","");
}

function resetFilters() {
    state.filters={period:"2026-I",area:"all",category:"all",level:"all",status:"all",search:""}; state.matrix=null; state.flag=null; state.page=1;
    el.filterPeriod.value="2026-I"; el.filterArea.value="all"; el.filterCategory.value="all"; el.filterLevel.value="all"; el.filterStatus.value="all"; el.filterSearch.value=""; render();
}
function bind() {
    const bindings=[[el.filterPeriod,"period"],[el.filterArea,"area"],[el.filterCategory,"category"],[el.filterLevel,"level"],[el.filterStatus,"status"]];
    bindings.forEach(([control,key])=>control.addEventListener("change",e=>{state.filters[key]=e.target.value;state.page=1;render();}));
    el.filterSearch.addEventListener("input",e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.filters.search=e.target.value.trim();state.page=1;render();},180);});
    el.reset.addEventListener("click",resetFilters); el.emptyReset.addEventListener("click",resetFilters); el.retry.addEventListener("click",loadData);
    document.addEventListener("click",event=>{
        const level=event.target.closest("[data-risk-level]"); if(level){state.filters.level=state.filters.level===level.dataset.riskLevel?"all":level.dataset.riskLevel;el.filterLevel.value=state.filters.level;state.flag=null;state.page=1;render();return;}
        const flag=event.target.closest("[data-risk-flag]"); if(flag){state.flag=state.flag===flag.dataset.riskFlag?null:flag.dataset.riskFlag;state.page=1;render();return;}
        const cell=event.target.closest("[data-risk-probability]"); if(cell){const next={probability:Number(cell.dataset.riskProbability),impact:Number(cell.dataset.riskImpact)};state.matrix=state.matrix&&state.matrix.probability===next.probability&&state.matrix.impact===next.impact?null:next;state.page=1;render();return;}
        const category=event.target.closest("[data-risk-category]"); if(category){state.filters.category=state.filters.category===category.dataset.riskCategory?"all":category.dataset.riskCategory;el.filterCategory.value=state.filters.category;state.page=1;render();return;}
        const stage=event.target.closest("[data-risk-stage]"); if(stage){state.flag="bottleneck";state.filters.search=stage.dataset.riskStage;el.filterSearch.value=state.filters.search;state.page=1;render();return;}
        const detail=event.target.closest("[data-risk-detail]"); if(detail){openDetail(detail.dataset.riskDetail);return;}
        const remove=event.target.closest("[data-remove-risk-filter]"); if(remove){const key=remove.dataset.removeRiskFilter;if(key==="matrix")state.matrix=null;else if(key==="flag")state.flag=null;else{state.filters[key]=key==="search"?"":"all";const map={area:el.filterArea,category:el.filterCategory,level:el.filterLevel,status:el.filterStatus,search:el.filterSearch};if(map[key])map[key].value=state.filters[key];}state.page=1;render();}
    });
    document.querySelectorAll("[data-risk-sort]").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.riskSort;state.sort.direction=state.sort.key===key&&state.sort.direction==="asc"?"desc":"asc";state.sort.key=key;render();}));
    el.pageSize.addEventListener("change",e=>{state.pageSize=Number(e.target.value)||10;state.page=1;render();}); el.prevPage.addEventListener("click",()=>{if(state.page>1){state.page--;render();}}); el.nextPage.addEventListener("click",()=>{state.page++;render();});
}

function cache() {
    const ids={resultSummary:"risk-result-summary",filterPeriod:"risk-filter-period",filterArea:"risk-filter-area",filterCategory:"risk-filter-category",filterLevel:"risk-filter-level",filterStatus:"risk-filter-status",filterSearch:"risk-filter-search",reset:"risk-reset-filters",activeFilters:"risk-active-filters",loading:"risk-loading",error:"risk-error",errorMessage:"risk-error-message",retry:"risk-retry",empty:"risk-empty",emptyReset:"risk-empty-reset",content:"risk-content",kpiCritical:"risk-kpi-critical",kpiVulnerabilities:"risk-kpi-vulnerabilities",kpiBottlenecks:"risk-kpi-bottlenecks",kpiControlled:"risk-kpi-controlled",totalCounter:"risk-total-counter",trafficLight:"risk-traffic-light",matrix:"risk-matrix",categoryChart:"risk-category-chart",bottleneckChart:"risk-bottleneck-chart",pageSize:"risk-page-size",tableBody:"risk-table-body",pageSummary:"risk-page-summary",pageLabel:"risk-page-label",prevPage:"risk-prev-page",nextPage:"risk-next-page",detailDialog:"risk-detail-dialog",dialogTitle:"risk-dialog-title",dialogContent:"risk-dialog-content"}; Object.entries(ids).forEach(([key,id])=>el[key]=document.getElementById(id));
}

document.addEventListener("DOMContentLoaded",()=>{cache();if(!el.content||!el.tableBody){console.error("[DIAGTI] Faltan elementos del Dashboard Riesgos.");return;}bind();loadData();});

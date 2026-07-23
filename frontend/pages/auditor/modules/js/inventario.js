// ============================================
// INVENTARIO AUDITOR · API real /api/auditor
// ============================================

const API_BASE = '/api/auditor';
const API_URL_INVENTARIO = `${API_BASE}/inventario`;

let inventarioActual = [];
let paginaActual = 1;
const registrosPorPagina = 5;
let cargando = false;
let sistemaSeleccionado = null;

const tablaInventario = document.getElementById("tabla-inventario");
const searchInput = document.getElementById("search-input");
const filterEstado = document.getElementById("filter-estado");
const filterRiesgo = document.getElementById("filter-riesgo");
const filterLegacy = document.getElementById("filter-legacy");
const contadorRegistros = document.getElementById("contador-registros");
const paginacion = document.getElementById("paginacion");

const kpiTotal = document.getElementById("kpi-total");
const kpiLegacy = document.getElementById("kpi-legacy");
const kpiRiesgo = document.getElementById("kpi-riesgo");
const kpiContrato = document.getElementById("kpi-contrato");
const modalDetalle = document.getElementById("modal-detalle");

async function obtenerInventario(filtros) {
    try {
        const params = new URLSearchParams();
        if (filtros.busqueda) params.set("busqueda", filtros.busqueda);
        if (filtros.estado) params.set("estado", filtros.estado);
        if (filtros.criticidad) params.set("criticidad", filtros.criticidad);
        if (filtros.area) params.set("area", filtros.area);
        if (filtros.codigo) params.set("codigo", filtros.codigo);

        const response = await fetch(`${API_URL_INVENTARIO}?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Error al obtener inventario: " + response.status);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error en obtenerInventario:", error);
        mostrarError("No se pudo cargar el inventario desde el servidor.");
        return [];
    }
}

async function obtenerKPIs() {
    try {
        const response = await fetch(`${API_URL_INVENTARIO}/kpis`);
        if (!response.ok) throw new Error("Error al obtener KPIs");
        return await response.json();
    } catch (error) {
        console.error("Error en obtenerKPIs:", error);
        return { total: 0, pendientes: 0, legacy: 0, riesgo: 0, contrato: 0 };
    }
}

async function obtenerDetalle(sistemaId) {
    const response = await fetch(`${API_URL_INVENTARIO}/${sistemaId}`);
    if (response.status === 404) {
        throw new Error("Sistema no encontrado");
    }
    if (!response.ok) {
        throw new Error("Error al obtener detalle: " + response.status);
    }
    return await response.json();
}

function texto(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";
    return valor;
}

function normalizar(valor) {
    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function formatearFecha(fecha) {
    if (!fecha) return "-";
    try {
        const fechaObj = new Date(String(fecha).replace(" ", "T"));
        if (isNaN(fechaObj.getTime())) return fecha;
        const dia = String(fechaObj.getDate()).padStart(2, "0");
        const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
        const anio = fechaObj.getFullYear();
        const hora = String(fechaObj.getHours()).padStart(2, "0");
        const minuto = String(fechaObj.getMinutes()).padStart(2, "0");
        return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
    } catch {
        return fecha;
    }
}

function obtenerIniciales(nombre) {
    return String(nombre || "SI")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(palabra => palabra[0])
        .join("")
        .toUpperCase();
}

function obtenerBadgeEstado(estado) {
    const valor = normalizar(estado);
    if (valor === "validado") return "status-success";
    if (valor === "observado" || valor === "subsanado") return "status-warning";
    if (valor === "rechazado") return "status-danger";
    if (valor === "en_validacion" || valor === "pendiente" || valor === "enviado") return "status-info";
    return "status-secondary";
}

function obtenerBadgeRiesgo(riesgo) {
    const valor = normalizar(riesgo);
    if (valor === "critico" || valor === "alto") return "status-danger";
    if (valor === "medio") return "status-warning";
    if (valor === "bajo") return "status-success";
    return "status-secondary";
}

function textoBooleano(valor) {
    return valor ? "Sí" : "No";
}

function idSistemaDe(item) {
    return item.sistemaId ?? item.idSistema ?? item.id ?? null;
}

async function cargarInventario() {
    if (cargando) return;
    cargando = true;

    try {
        const filtros = {
            busqueda: searchInput.value.trim() || null,
            estado: filterEstado.value || null,
            criticidad: null,
            area: null
        };

        // El filtro de riesgo se aplica en cliente sobre datos reales ya filtrados por estado/búsqueda.
        const data = await obtenerInventario(filtros);
        let lista = data || [];

        if (filterRiesgo.value) {
            const riesgo = normalizar(filterRiesgo.value);
            lista = lista.filter(s => normalizar(s.nivelRiesgo || "") === riesgo);
        }
        if (filterLegacy.value !== "") {
            const quierePendiente = filterLegacy.value === "true";
            lista = lista.filter(s => Boolean(s.sistemaPendiente) === quierePendiente);
        }

        inventarioActual = lista;

        const kpis = await obtenerKPIs();
        kpiTotal.textContent = kpis.total || 0;
        kpiLegacy.textContent = kpis.pendientes ?? kpis.legacy ?? 0;
        kpiRiesgo.textContent = kpis.riesgo || 0;
        kpiContrato.textContent = kpis.contrato || 0;

        renderInventario(inventarioActual);
    } catch (error) {
        console.error("Error en cargarInventario:", error);
        inventarioActual = [];
        renderInventario([]);
    } finally {
        cargando = false;
    }
}

function renderInventario(lista) {
    tablaInventario.innerHTML = "";

    if (!lista || lista.length === 0) {
        tablaInventario.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron sistemas en la base de datos.
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 registros";
        renderPaginacion(0);
        return;
    }

    const totalRegistros = lista.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = Math.min(inicio + registrosPorPagina, totalRegistros);
    const registrosPagina = lista.slice(inicio, fin);

    registrosPagina.forEach(sistema => {
        const id = idSistemaDe(sistema);
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><strong>#${texto(id)}</strong></td>
            <td><strong>${texto(sistema.codigo)}</strong></td>
            <td>
                <div class="cell-system">
                    <div class="system-avatar">${obtenerIniciales(sistema.nombre)}</div>
                    <div>
                        <div class="system-name">${texto(sistema.nombre)}</div>
                        <div class="system-desc">${texto(sistema.descripcion)}</div>
                    </div>
                </div>
            </td>
            <td>${texto(sistema.area)}</td>
            <td>${texto(sistema.tipo)}</td>
            <td><span class="badge ${obtenerBadgeEstado(sistema.estado)}">${texto(sistema.estado)}</span></td>
            <td><span class="badge ${obtenerBadgeRiesgo(sistema.nivelRiesgo)}">${texto(sistema.nivelRiesgo)}</span></td>
            <td><span class="badge ${sistema.sistemaPendiente ? "status-warning" : "status-success"}">${textoBooleano(sistema.sistemaPendiente)}</span></td>
            <td>${formatearFecha(sistema.fechaActualizacion)}</td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="abrirModalDetalle(${id})">Ver detalle</button>
            </td>
        `;
        tablaInventario.appendChild(fila);
    });

    contadorRegistros.textContent = `Mostrando ${inicio + 1} - ${fin} de ${totalRegistros} registros`;
    renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
    paginacion.innerHTML = "";
    if (totalPaginas <= 1) return;

    const btnAnterior = document.createElement("button");
    btnAnterior.className = "btn btn-ghost btn-sm";
    btnAnterior.textContent = "Anterior";
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.onclick = () => cambiarPagina(paginaActual - 1);
    paginacion.appendChild(btnAnterior);

    const maxPages = Math.min(totalPaginas, 5);
    let startPage = Math.max(1, paginaActual - 2);
    let endPage = Math.min(totalPaginas, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.className = `page ${i === paginaActual ? "active" : ""}`;
        btn.textContent = i;
        btn.onclick = () => cambiarPagina(i);
        paginacion.appendChild(btn);
    }

    const btnSiguiente = document.createElement("button");
    btnSiguiente.className = "btn btn-ghost btn-sm";
    btnSiguiente.textContent = "Siguiente";
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.onclick = () => cambiarPagina(paginaActual + 1);
    paginacion.appendChild(btnSiguiente);
}

function cambiarPagina(numeroPagina) {
    const totalPaginas = Math.ceil(inventarioActual.length / registrosPorPagina);
    if (numeroPagina < 1 || numeroPagina > totalPaginas) return;
    paginaActual = numeroPagina;
    renderInventario(inventarioActual);
}

function filtrarInventario() {
    paginaActual = 1;
    cargarInventario();
}

function mostrarError(mensaje) {
    console.error(mensaje);
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = "position:fixed;top:20px;right:20px;background:#e74c3c;color:white;padding:15px 25px;border-radius:8px;z-index:9999;";
    errorDiv.textContent = mensaje;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

async function abrirModalDetalle(sistemaId) {
    try {
        const sistema = await obtenerDetalle(sistemaId);
        sistemaSeleccionado = sistema;

        document.getElementById("modal-codigo").textContent = texto(sistema.codigo);
        document.getElementById("modal-nombre").textContent = texto(sistema.nombre);
        document.getElementById("modal-descripcion").textContent = texto(sistema.descripcion);
        document.getElementById("modal-id").textContent = texto(sistema.sistemaId);
        document.getElementById("modal-codigo-detalle").textContent = texto(sistema.codigo);
        document.getElementById("modal-area").textContent = texto(sistema.area);
        document.getElementById("modal-tipo").textContent = texto(sistema.tipo);
        document.getElementById("modal-criticidad").textContent = texto(sistema.criticidad);
        document.getElementById("modal-responsable-funcional").textContent = texto(sistema.responsableFuncional);
        document.getElementById("modal-responsable-tecnico").textContent = texto(sistema.responsableTecnico);
        document.getElementById("modal-desarrollador").textContent = texto(sistema.desarrolladorNombre);
        document.getElementById("modal-forma").textContent = texto(sistema.formaAdquisicion);
        document.getElementById("modal-ano").textContent = texto(sistema.anoAdquisicion);
        document.getElementById("modal-contrato").textContent = textoBooleano(sistema.contratoVigente);
        document.getElementById("modal-vencimiento").textContent = texto(sistema.fechaVencimientoSoporte);
        document.getElementById("modal-estado").textContent = texto(sistema.estado);
        document.getElementById("modal-riesgo").textContent = texto(sistema.nivelRiesgo);
        document.getElementById("modal-prioridad").textContent = texto(sistema.prioridadMigracion);
        document.getElementById("modal-legacy").textContent = textoBooleano(sistema.sistemaPendiente);
        document.getElementById("modal-fecha-creacion").textContent = formatearFecha(sistema.fechaCreacion);
        document.getElementById("modal-fecha-actualizacion").textContent = formatearFecha(sistema.fechaActualizacion);
        document.getElementById("modal-fecha-eliminacion").textContent = "-";

        const obs = (sistema.observaciones || []).length;
        const val = (sistema.validaciones || []).length;
        document.getElementById("modal-badges").innerHTML = `
            <span class="badge ${obtenerBadgeEstado(sistema.estado)}">${texto(sistema.estado)}</span>
            <span class="badge ${obtenerBadgeRiesgo(sistema.nivelRiesgo)}">${texto(sistema.nivelRiesgo)}</span>
            <span class="badge status-info">Obs: ${obs}</span>
            <span class="badge status-info">Val: ${val}</span>
            <span class="badge status-secondary">Solo lectura</span>
        `;

        modalDetalle.classList.add("active");
        document.body.style.overflow = "hidden";
    } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo cargar el detalle del sistema.");
    }
}

function cerrarModalDetalle() {
    modalDetalle.classList.remove("active");
    document.body.style.overflow = "";
}

function exportarExcel() {
    if (inventarioActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const encabezados = [
        "sistemaId", "codigo", "nombre", "descripcion", "area", "tipo", "criticidad",
        "estado", "estadoValidacion", "responsableTecnico", "responsableFuncional",
        "cantidadObservaciones", "nivelRiesgo", "sistemaPendiente", "fechaCreacion", "fechaActualizacion"
    ];
    const filas = inventarioActual.map(sistema => encabezados.map(campo => sistema[campo]));
    descargarCSV("inventario_sistemas_diagti.csv", encabezados, filas);
}

function descargarCSV(nombreArchivo, encabezados, filas) {
    const contenido = [encabezados, ...filas]
        .map(fila => fila.map(valor => `"${String(valor ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
}

function exportarPDF() {
    if (inventarioActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const filas = inventarioActual.map(sistema => `
        <tr>
            <td>${texto(idSistemaDe(sistema))}</td>
            <td>${texto(sistema.codigo)}</td>
            <td>${texto(sistema.nombre)}</td>
            <td>${texto(sistema.estado)}</td>
            <td>${texto(sistema.nivelRiesgo)}</td>
            <td>${textoBooleano(sistema.sistemaPendiente)}</td>
            <td>${formatearFecha(sistema.fechaActualizacion)}</td>
        </tr>
    `).join("");
    const html = `
        <html><head><title>Inventario - DIAGTI</title>
        <style>
            body{font-family:Arial,sans-serif;margin:30px}
            h1{color:#0f75bc}
            table{width:100%;border-collapse:collapse;font-size:12px}
            th{background:#0f75bc;color:#fff;padding:8px;text-align:left}
            td{border:1px solid #dfe6e5;padding:7px}
        </style></head><body>
        <h1>Reporte de Inventario de Sistemas</h1>
        <div>DIAGTI · CTIC UNAS · Módulo Auditor</div>
        <table><thead><tr>
            <th>ID</th><th>Código</th><th>Sistema</th><th>Estado</th><th>Riesgo</th><th>Pendiente</th><th>Actualización</th>
        </tr></thead><tbody>${filas}</tbody></table>
        <script>window.onload=function(){window.print();};<\/script>
        </body></html>`;
    abrirVentanaPDF(html);
}

function abrirVentanaPDF(html) {
    const ventana = window.open("", "_blank");
    if (!ventana) {
        alert("El navegador bloqueó la ventana emergente.");
        return;
    }
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
}

function exportarFichaSistema() {
    if (!sistemaSeleccionado) {
        alert("No hay sistema seleccionado.");
        return;
    }
    const encabezados = ["Campo", "Valor"];
    const filas = Object.entries(sistemaSeleccionado)
        .filter(([, v]) => typeof v !== "object")
        .map(([k, v]) => [k, v]);
    descargarCSV(`ficha_${sistemaSeleccionado.codigo || "sistema"}.csv`, encabezados, filas);
}

function exportarFichaPDF() {
    if (!sistemaSeleccionado) {
        alert("No hay sistema seleccionado.");
        return;
    }
    const filas = Object.entries(sistemaSeleccionado)
        .filter(([, v]) => typeof v !== "object")
        .map(([campo, valor]) => `<tr><td><strong>${campo}</strong></td><td>${texto(valor)}</td></tr>`)
        .join("");
    const html = `<html><head><title>Ficha</title>
        <style>body{font-family:Arial,sans-serif;margin:30px}h1{color:#0f75bc}
        table{width:100%;border-collapse:collapse}td{border:1px solid #dfe6e5;padding:8px}</style></head>
        <body><h1>Ficha del Sistema</h1>
        <div>${texto(sistemaSeleccionado.codigo)} · ${texto(sistemaSeleccionado.nombre)}</div>
        <table><tbody>${filas}</tbody></table>
        <script>window.onload=function(){window.print();};<\/script></body></html>`;
    abrirVentanaPDF(html);
}

function cerrarSesion() {
    document.getElementById("logout-confirm-overlay")?.classList.add("open");
}
function cancelarCerrarSesion() {
    document.getElementById("logout-confirm-overlay")?.classList.remove("open");
}
function confirmarCerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../../login/html/login.html";
}

searchInput.addEventListener("input", filtrarInventario);
filterEstado.addEventListener("change", filtrarInventario);
filterRiesgo.addEventListener("change", filtrarInventario);
filterLegacy.addEventListener("change", filtrarInventario);

modalDetalle.addEventListener("click", function (e) {
    if (e.target === modalDetalle) cerrarModalDetalle();
});
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarModalDetalle();
});

document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.getElementById("logout-confirm-overlay");
    if (overlay) {
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
    cargarInventario();
});

window.filtrarInventario = filtrarInventario;
window.exportarExcel = exportarExcel;
window.exportarPDF = exportarPDF;
window.exportarFichaSistema = exportarFichaSistema;
window.exportarFichaPDF = exportarFichaPDF;
window.abrirModalDetalle = abrirModalDetalle;
window.cerrarModalDetalle = cerrarModalDetalle;
window.cerrarSesion = cerrarSesion;
window.cancelarCerrarSesion = cancelarCerrarSesion;
window.confirmarCerrarSesion = confirmarCerrarSesion;

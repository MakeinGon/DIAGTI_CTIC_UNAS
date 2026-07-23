// ============================================
// REPORTES AUDITOR · API real /api/auditor
// ============================================

const API_URL_REPORTES = '/api/auditor';

let reportesGenerados = [];
let reportesFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 5;

const tablaReportes = document.getElementById("tabla-reportes");
const searchInput = document.getElementById("search-input");
const filterTipo = document.getElementById("filter-tipo");
const filterEstado = document.getElementById("filter-estado");
const contadorRegistros = document.getElementById("contador-registros");

const kpiTablas = document.getElementById("kpi-tablas");
const kpiSistemas = document.getElementById("kpi-sistemas");
const kpiAuditoria = document.getElementById("kpi-auditoria");
const kpiExportaciones = document.getElementById("kpi-exportaciones");

const nombresReportes = {
    sistemas: "Inventario de sistemas",
    auditoria: "Auditoría y trazabilidad",
    evidencias: "Evidencias técnicas",
    validaciones: "Validaciones",
    observaciones: "Observaciones"
};

async function obtenerDatosReporte(tipo) {
    const response = await fetch(`${API_URL_REPORTES}/reportes/datos?tipo=${encodeURIComponent(tipo)}`);
    if (!response.ok) {
        throw new Error("Error al obtener datos del reporte");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

async function obtenerKPIs() {
    try {
        const response = await fetch(`${API_URL_REPORTES}/kpis-reportes`);
        if (!response.ok) throw new Error("Error al obtener KPIs");
        return await response.json();
    } catch (error) {
        console.error("Error KPIs reportes:", error);
        return { tablas: 0, sistemas: 0, auditoria: 0, exportaciones: 0 };
    }
}

function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minuto = String(fecha.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
}

function obtenerFechaISOActual() {
    return new Date().toISOString().slice(0, 10);
}

function obtenerBadgeEstado(estado) {
    if (estado === "Generado") return "status-success";
    if (estado === "Descargado") return "status-info";
    return "status-secondary";
}

function obtenerBadgeFormato(formato) {
    if (formato === "PDF") return "status-info";
    if (formato === "Excel") return "status-success";
    return "status-secondary";
}

function normalizar(valor) {
    return String(valor ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function texto(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";
    return valor;
}

async function actualizarKPIs() {
    const kpis = await obtenerKPIs();
    kpiTablas.textContent = kpis.tablas || 0;
    kpiSistemas.textContent = kpis.sistemas || 0;
    kpiAuditoria.textContent = kpis.auditoria || 0;
    kpiExportaciones.textContent = reportesGenerados.length || 0;
}

function renderReportes(lista) {
    tablaReportes.innerHTML = "";
    if (!lista || lista.length === 0) {
        tablaReportes.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron reportes generados.
                </td>
            </tr>`;
        contadorRegistros.textContent = "Mostrando 0 reportes";
        return;
    }

    const totalRegistros = lista.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = Math.min(inicio + registrosPorPagina, totalRegistros);

    lista.slice(inicio, fin).forEach(reporte => {
        const idx = reportesFiltrados.indexOf(reporte);
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><strong>${reporte.fecha}</strong></td>
            <td>${reporte.nombre}</td>
            <td>${reporte.tabla}</td>
            <td>${reporte.periodo}</td>
            <td><span class="badge ${obtenerBadgeFormato(reporte.formato)}">${reporte.formato}</span></td>
            <td>${reporte.registros}</td>
            <td>${reporte.usuario}</td>
            <td><span class="badge ${obtenerBadgeEstado(reporte.estado)}">${reporte.estado}</span></td>
            <td><button class="btn btn-ghost btn-sm" onclick="descargarReporte(${idx})">Descargar</button></td>`;
        tablaReportes.appendChild(fila);
    });
    contadorRegistros.textContent = `Mostrando ${inicio + 1} - ${fin} de ${totalRegistros} reportes`;
}

function filtrarReportes() {
    const textoBusqueda = normalizar(searchInput.value);
    const tipo = filterTipo.value;
    const estado = filterEstado.value;
    reportesFiltrados = reportesGenerados.filter(reporte => {
        const contenido = normalizar(`${reporte.fecha} ${reporte.nombre} ${reporte.tabla} ${reporte.periodo} ${reporte.formato} ${reporte.usuario} ${reporte.estado}`);
        return contenido.includes(textoBusqueda)
            && (tipo === "" || reporte.tabla === tipo)
            && (estado === "" || reporte.estado === estado);
    });
    paginaActual = 1;
    renderReportes(reportesFiltrados);
}

async function generarReporte() {
    const tipo = document.getElementById("tipo-reporte").value;
    const desde = document.getElementById("fecha-desde").value;
    const hasta = document.getElementById("fecha-hasta").value;
    const formato = document.getElementById("formato-reporte").value;
    if (!tipo) {
        alert("Selecciona un tipo de reporte.");
        return;
    }
    await crearReporte(tipo, desde, hasta, formato);
}

async function generarRapido(tipo, formato) {
    await crearReporte(tipo, "", "", formato);
}

async function crearReporte(tabla, desde, hasta, formato) {
    try {
        const datos = await obtenerDatosReporte(tabla);
        const periodo = desde && hasta ? `${desde} - ${hasta}` : "Todos los registros";
        if (!datos || datos.length === 0) {
            alert("No hay datos para generar el reporte.");
            return;
        }
        const session = JSON.parse(localStorage.getItem("diagti_session") || "{}");
        const nuevoReporte = {
            fecha: obtenerFechaActual(),
            fecha_iso: obtenerFechaISOActual(),
            nombre: nombresReportes[tabla] || tabla,
            tabla,
            periodo,
            formato,
            registros: datos.length,
            usuario: session.nombre || session.username || "Auditor CTIC",
            estado: "Generado",
            datos
        };
        reportesGenerados.unshift(nuevoReporte);
        reportesFiltrados = [...reportesGenerados];
        descargarArchivoReporte(nuevoReporte);
        renderReportes(reportesFiltrados);
        await actualizarKPIs();
        alert(`Reporte "${nuevoReporte.nombre}" generado correctamente en ${formato}.`);
    } catch (error) {
        console.error("Error generando reporte:", error);
        alert("Error al generar el reporte. Verifica que el backend esté disponible.");
    }
}

function descargarReporte(index) {
    const reporte = reportesFiltrados[index];
    if (!reporte) {
        alert("No se encontró el reporte.");
        return;
    }
    reporte.estado = "Descargado";
    descargarArchivoReporte(reporte);
    renderReportes(reportesFiltrados);
}

function descargarArchivoReporte(reporte) {
    if (reporte.formato === "PDF") {
        descargarPDF(reporte);
    } else {
        descargarCSV(`${reporte.tabla}_diagti.csv`, reporte.datos);
    }
}

function descargarCSV(nombreArchivo, datos) {
    if (!datos || datos.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const encabezados = Object.keys(datos[0]);
    const filas = datos.map(item => encabezados.map(campo => item[campo]));
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

function descargarPDF(reporte) {
    const encabezados = Object.keys(reporte.datos[0] || {});
    const columnas = encabezados.map(campo => `<th>${escaparHTML(campo)}</th>`).join("");
    const filas = reporte.datos.map(item => `
        <tr>${encabezados.map(campo => `<td>${escaparHTML(texto(item[campo]))}</td>`).join("")}</tr>`).join("");
    const html = `<html><head><title>${escaparHTML(reporte.nombre)}</title>
        <style>body{font-family:Arial,sans-serif;margin:20px}h1{color:#0f75bc}
        table{width:100%;border-collapse:collapse;font-size:9px}
        th{background:#0f75bc;color:#fff;padding:6px;text-align:left}
        td{border:1px solid #dfe6e5;padding:5px}</style></head>
        <body><h1>${escaparHTML(reporte.nombre)}</h1>
        <div>DIAGTI · Auditor · ${escaparHTML(reporte.periodo)}</div>
        <table><thead><tr>${columnas}</tr></thead><tbody>${filas}</tbody></table>
        <script>window.onload=function(){window.print();};<\/script></body></html>`;
    const ventana = window.open("", "_blank");
    if (!ventana) {
        alert("El navegador bloqueó la ventana emergente.");
        return;
    }
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
}

function limpiarFormulario() {
    document.getElementById("tipo-reporte").value = "";
    document.getElementById("fecha-desde").value = "";
    document.getElementById("fecha-hasta").value = "";
    document.getElementById("formato-reporte").value = "Excel";
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

searchInput.addEventListener("input", filtrarReportes);
filterTipo.addEventListener("change", filtrarReportes);
filterEstado.addEventListener("change", filtrarReportes);

document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.getElementById("logout-confirm-overlay");
    if (overlay) {
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
    reportesFiltrados = [...reportesGenerados];
    renderReportes(reportesGenerados);
    actualizarKPIs();
});

window.generarReporte = generarReporte;
window.generarRapido = generarRapido;
window.descargarReporte = descargarReporte;
window.limpiarFormulario = limpiarFormulario;
window.cerrarSesion = cerrarSesion;
window.cancelarCerrarSesion = cancelarCerrarSesion;
window.confirmarCerrarSesion = confirmarCerrarSesion;

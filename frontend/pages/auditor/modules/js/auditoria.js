// ============================================
// AUDITORÍA · API real /api/auditor (solo lectura)
// ============================================

const API_URL_AUDITOR = '/api/auditor';

let auditoriaActual = [];
let paginaActual = 1;
const registrosPorPagina = 5;
let cargando = false;

const tablaAuditoria = document.getElementById("tabla-auditoria");
const searchInput = document.getElementById("search-input");
const filterModulo = document.getElementById("filter-modulo");
const filterAccion = document.getElementById("filter-accion");
const filterDesde = document.getElementById("filter-desde");
const filterHasta = document.getElementById("filter-hasta");
const contadorRegistros = document.getElementById("contador-registros");
const paginacion = document.getElementById("paginacion");

const kpiTotal = document.getElementById("kpi-total");
const kpiConsultas = document.getElementById("kpi-consultas");
const kpiFallidos = document.getElementById("kpi-fallidos");
const kpiExportaciones = document.getElementById("kpi-exportaciones");

async function obtenerAuditoria(filtros) {
    try {
        const response = await fetch(`${API_URL_AUDITOR}/auditoria`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filtros || {})
        });
        if (!response.ok) {
            throw new Error("Error al obtener auditoría: " + response.status);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error:", error);
        mostrarError("No se pudo cargar el historial de auditoría.");
        return [];
    }
}

async function obtenerKPIs() {
    try {
        const response = await fetch(`${API_URL_AUDITOR}/kpis`);
        if (!response.ok) throw new Error("Error al obtener KPIs");
        return await response.json();
    } catch (error) {
        console.error("Error en obtenerKPIs:", error);
        return { total: 0, consultas: 0, intentosFallidos: 0, exportaciones: 0 };
    }
}

async function cargarAuditoria() {
    if (cargando) return;
    cargando = true;

    try {
        const filtros = {
            searchText: searchInput.value.trim() || null,
            modulo: filterModulo.value || null,
            accion: filterAccion.value || null,
            fechaDesde: filterDesde.value || null,
            fechaHasta: filterHasta.value || null
        };
        Object.keys(filtros).forEach(key => {
            if (filtros[key] === null || filtros[key] === "") delete filtros[key];
        });

        const data = await obtenerAuditoria(filtros);
        auditoriaActual = data;

        const kpis = await obtenerKPIs();
        kpiTotal.textContent = kpis.total || 0;
        kpiConsultas.textContent = kpis.consultas || 0;
        kpiFallidos.textContent = kpis.intentosFallidos || 0;
        kpiExportaciones.textContent = kpis.exportaciones || 0;

        renderAuditoria(data);
    } catch (error) {
        console.error("Error en cargarAuditoria:", error);
        mostrarError("Error al cargar los datos de auditoría");
        auditoriaActual = [];
        renderAuditoria([]);
    } finally {
        cargando = false;
    }
}

function renderAuditoria(lista) {
    tablaAuditoria.innerHTML = "";

    if (!lista || lista.length === 0) {
        tablaAuditoria.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; color:#64757a; padding:40px 20px;">
                    No se encontraron eventos en la base de datos con los filtros seleccionados.
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 eventos";
        renderPaginacion(0);
        return;
    }

    const totalRegistros = lista.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = Math.min(inicio + registrosPorPagina, totalRegistros);
    const registrosPagina = lista.slice(inicio, fin);

    registrosPagina.forEach(log => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><span class="id-cell">#${log.idAuditoria || "?"}</span></td>
            <td><strong>${formatearFecha(log.fechaEvento)}</strong></td>
            <td><div class="user-cell"><b>${log.nombreUsuario || "Usuario no registrado"}</b></div></td>
            <td><span class="email-cell">${log.correoUsuario || "Sin correo"}</span></td>
            <td>${log.modulo || "-"}</td>
            <td><span class="action-badge ${obtenerClaseAccion(log.accion)}">${log.accion || "-"}</span></td>
            <td><div class="desc-cell">${log.descripcion || "-"}</div></td>
            <td><span class="ip-cell">${log.direccionIp || "-"}</span></td>
        `;
        tablaAuditoria.appendChild(fila);
    });

    contadorRegistros.textContent = `Mostrando ${inicio + 1} - ${fin} de ${totalRegistros} eventos auditables`;
    renderPaginacion(totalPaginas);
}

function formatearFecha(fechaEvento) {
    if (!fechaEvento) return "-";
    try {
        const fecha = new Date(String(fechaEvento).replace(" ", "T"));
        if (isNaN(fecha.getTime())) return fechaEvento;
        const dia = String(fecha.getDate()).padStart(2, "0");
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const anio = fecha.getFullYear();
        const hora = String(fecha.getHours()).padStart(2, "0");
        const minuto = String(fecha.getMinutes()).padStart(2, "0");
        return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
    } catch {
        return fechaEvento;
    }
}

function obtenerClaseAccion(accion) {
    const acciones = {
        Consulta: "action-consulta",
        Exportación: "action-exportacion",
        "Intento fallido": "action-fallido",
        "Eliminación lógica": "action-eliminacion",
        Registro: "action-default",
        Actualización: "action-default"
    };
    return acciones[accion] || "action-default";
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

    for (let i = 1; i <= Math.min(totalPaginas, 5); i++) {
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
    const totalPaginas = Math.ceil(auditoriaActual.length / registrosPorPagina);
    if (numeroPagina < 1 || numeroPagina > totalPaginas) return;
    paginaActual = numeroPagina;
    renderAuditoria(auditoriaActual);
}

function mostrarError(mensaje) {
    console.error(mensaje);
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = "position:fixed;top:20px;right:20px;background:#e74c3c;color:white;padding:15px 25px;border-radius:8px;z-index:9999;";
    errorDiv.textContent = mensaje;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

async function filtrarAuditoria() {
    paginaActual = 1;
    await cargarAuditoria();
}

function exportarExcel() {
    if (!auditoriaActual || auditoriaActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const encabezados = ["ID", "Fecha y hora", "Usuario", "Correo", "Módulo", "Acción", "Descripción", "IP origen"];
    const filas = auditoriaActual.map(log => [
        log.idAuditoria || "",
        formatearFecha(log.fechaEvento),
        log.nombreUsuario || "Usuario no registrado",
        log.correoUsuario || "Sin correo",
        log.modulo || "-",
        log.accion || "-",
        log.descripcion || "-",
        log.direccionIp || "-"
    ]);
    const contenido = [encabezados, ...filas]
        .map(fila => fila.map(valor => `"${String(valor ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `auditoria_diagti_${new Date().toISOString().slice(0, 10)}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
}

function exportarPDF() {
    if (!auditoriaActual || auditoriaActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const filas = auditoriaActual.map(log => `
        <tr>
            <td>${log.idAuditoria || ""}</td>
            <td>${formatearFecha(log.fechaEvento)}</td>
            <td>${log.nombreUsuario || "Usuario no registrado"}</td>
            <td>${log.correoUsuario || "Sin correo"}</td>
            <td>${log.modulo || "-"}</td>
            <td>${log.accion || "-"}</td>
            <td>${log.descripcion || "-"}</td>
            <td>${log.direccionIp || "-"}</td>
        </tr>`).join("");
    const html = `<html><head><title>Auditoría - DIAGTI</title>
        <style>body{font-family:Arial,sans-serif;margin:30px}h1{color:#0f75bc}
        table{width:100%;border-collapse:collapse;font-size:11px}
        th{background:#0f75bc;color:#fff;padding:8px;text-align:left}
        td{border:1px solid #dfe6e5;padding:7px}</style></head>
        <body><h1>Reporte de Auditoría</h1>
        <table><thead><tr>
            <th>ID</th><th>Fecha</th><th>Usuario</th><th>Correo</th><th>Módulo</th><th>Acción</th><th>Descripción</th><th>IP</th>
        </tr></thead><tbody>${filas}</tbody></table>
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

searchInput.addEventListener("input", filtrarAuditoria);
filterModulo.addEventListener("change", filtrarAuditoria);
filterAccion.addEventListener("change", filtrarAuditoria);
filterDesde.addEventListener("change", filtrarAuditoria);
filterHasta.addEventListener("change", filtrarAuditoria);

document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.getElementById("logout-confirm-overlay");
    if (overlay) {
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
    cargarAuditoria();
});

window.filtrarAuditoria = filtrarAuditoria;
window.exportarExcel = exportarExcel;
window.exportarPDF = exportarPDF;
window.cerrarSesion = cerrarSesion;
window.cancelarCerrarSesion = cancelarCerrarSesion;
window.confirmarCerrarSesion = confirmarCerrarSesion;

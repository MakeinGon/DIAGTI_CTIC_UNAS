// ============================================
// CONEXIÓN CON EL BACKEND - REPORTES
// ============================================

// ✅ Usar proxy de nginx
const API_URL_REPORTES = '/auditor';

let reportesGenerados = [];
let reportesFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 5;

// Elementos del DOM
const tablaReportes = document.getElementById("tabla-reportes");
const searchInput = document.getElementById("search-input");
const filterTipo = document.getElementById("filter-tipo");
const filterEstado = document.getElementById("filter-estado");
const contadorRegistros = document.getElementById("contador-registros");

const kpiTablas = document.getElementById("kpi-tablas");
const kpiSistemas = document.getElementById("kpi-sistemas");
const kpiAuditoria = document.getElementById("kpi-auditoria");
const kpiExportaciones = document.getElementById("kpi-exportaciones");

// Nombres de los reportes
const nombresReportes = {
    sistemas: "Inventario de sistemas",
    auditoria: "Auditoría y trazabilidad",
    evidencias: "Evidencias técnicas",
    validaciones: "Validaciones",
    observaciones: "Observaciones"
};

// ============================================
// DATOS LOCALES (FALLBACK)
// ============================================
const datosLocales = {
    sistemas: [
        { id: 1, codigo: "SYS-001", nombre: "Sistema Académico", estado: "VALIDADO", riesgo: "MEDIO" },
        { id: 2, codigo: "SYS-002", nombre: "Trámite Documentario", estado: "OBSERVADO", riesgo: "ALTO" },
        { id: 3, codigo: "SYS-003", nombre: "Sistema de Biblioteca", estado: "OBSERVADO", riesgo: "CRITICO" },
        { id: 4, codigo: "SYS-004", nombre: "Recursos Humanos", estado: "VALIDADO", riesgo: "BAJO" },
        { id: 5, codigo: "SYS-005", nombre: "Sistema Financiero", estado: "ENVIADO", riesgo: "ALTO" }
    ],
    auditoria: [
        { id: 1, usuario: "Auditor CTIC", modulo: "Inventario", accion: "Consulta", fecha: "2026-07-16" },
        { id: 2, usuario: "Auditor CTIC", modulo: "Reportes", accion: "Exportación", fecha: "2026-07-16" },
        { id: 3, usuario: "Admin CTIC", modulo: "Sistemas", accion: "Registro", fecha: "2026-07-15" }
    ],
    evidencias: [
        { id: 1, sistema: "Sistema Académico", tipo: "Manual técnico", estado: "ACTIVA" },
        { id: 2, sistema: "Trámite Documentario", tipo: "Contrato", estado: "ACTIVA" }
    ],
    validaciones: [
        { id: 1, sistema: "Sistema Académico", estado: "VALIDADO", resultado: "APROBADO" },
        { id: 2, sistema: "Trámite Documentario", estado: "OBSERVADO", resultado: "PENDIENTE" }
    ],
    observaciones: [
        { id: 1, sistema: "Trámite Documentario", descripcion: "Falta evidencia de backup", estado: "PENDIENTE" },
        { id: 2, sistema: "Sistema de Biblioteca", descripcion: "Soporte vencido", estado: "PENDIENTE" }
    ]
};

// ============================================
// FUNCIONES DE CONEXIÓN CON EL BACKEND
// ============================================

async function obtenerDatosReporte(tipo, desde, hasta) {
    try {
        console.log('📡 Enviando petición a reporte:', tipo);
        
        const filtros = {
            tipo: tipo,
            fechaDesde: desde || null,
            fechaHasta: hasta || null
        };
        
        const response = await fetch(`${API_URL_REPORTES}/reporte`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filtros)
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener datos del reporte');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('⚠️ Backend no disponible, usando datos locales:', error);
        return obtenerDatosLocales(tipo);
    }
}

function obtenerDatosLocales(tipo) {
    console.log('📂 Cargando datos locales para:', tipo);
    return datosLocales[tipo] || [];
}

async function obtenerKPIs() {
    try {
        const response = await fetch(`${API_URL_REPORTES}/kpis-reportes`);
        if (!response.ok) throw new Error('Error al obtener KPIs');
        return await response.json();
    } catch (error) {
        console.warn('⚠️ Backend no disponible, calculando KPIs locales');
        return calcularKPIsLocales();
    }
}

function calcularKPIsLocales() {
    const totalTablas = Object.keys(datosLocales).length;
    const totalSistemas = datosLocales.sistemas.length;
    const totalAuditoria = datosLocales.auditoria.length;
    const totalExportaciones = reportesGenerados.length;
    return { tablas: totalTablas, sistemas: totalSistemas, auditoria: totalAuditoria, exportaciones: totalExportaciones };
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

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
    const fecha = new Date();
    return fecha.toISOString().slice(0, 10);
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
    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
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

// ============================================
// FUNCIONES DE KPIs
// ============================================

async function actualizarKPIs() {
    try {
        const kpis = await obtenerKPIs();
        kpiTablas.textContent = kpis.tablas || 0;
        kpiSistemas.textContent = kpis.sistemas || 0;
        kpiAuditoria.textContent = kpis.auditoria || 0;
        kpiExportaciones.textContent = reportesGenerados.length || 0;
    } catch (error) {
        console.error('Error actualizando KPIs:', error);
    }
}

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================

function renderReportes(lista) {
    tablaReportes.innerHTML = "";
    
    if (!lista || lista.length === 0) {
        tablaReportes.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; color:#64757a; padding:20px;">
                    No se encontraron reportes generados.
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 reportes";
        return;
    }
    
    const totalRegistros = lista.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    
    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas || 1;
    }
    
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = Math.min(inicio + registrosPorPagina, totalRegistros);
    const registrosPagina = lista.slice(inicio, fin);
    
    registrosPagina.forEach((reporte, index) => {
        const fila = document.createElement("tr");
        const idx = reportesFiltrados.indexOf(reporte);
        
        fila.innerHTML = `
            <td><strong>${reporte.fecha}</strong></td>
            <td>${reporte.nombre}</td>
            <td>${reporte.tabla}</td>
            <td>${reporte.periodo}</td>
            <td>
                <span class="badge ${obtenerBadgeFormato(reporte.formato)}">
                    ${reporte.formato}
                </span>
            </td>
            <td>${reporte.registros}</td>
            <td>${reporte.usuario}</td>
            <td>
                <span class="badge ${obtenerBadgeEstado(reporte.estado)}">
                    ${reporte.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="descargarReporte(${idx})">
                    Descargar
                </button>
            </td>
        `;
        
        tablaReportes.appendChild(fila);
    });
    
    const desde = inicio + 1;
    contadorRegistros.textContent = `Mostrando ${desde} - ${fin} de ${totalRegistros} reportes`;
    renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
    const paginacion = document.querySelector('.page-actions');
    if (!paginacion) return;
    
    paginacion.innerHTML = "";
    
    if (totalPaginas <= 1) return;
    
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn btn-ghost btn-sm';
    btnAnterior.textContent = 'Anterior';
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
        const btn = document.createElement('button');
        btn.className = `page ${i === paginaActual ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => cambiarPagina(i);
        paginacion.appendChild(btn);
    }
    
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn btn-ghost btn-sm';
    btnSiguiente.textContent = 'Siguiente';
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.onclick = () => cambiarPagina(paginaActual + 1);
    paginacion.appendChild(btnSiguiente);
}

function cambiarPagina(numeroPagina) {
    const totalPaginas = Math.ceil(reportesFiltrados.length / registrosPorPagina);
    if (numeroPagina < 1 || numeroPagina > totalPaginas) return;
    
    paginaActual = numeroPagina;
    renderReportes(reportesFiltrados);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// FUNCIONES DE FILTRADO
// ============================================

function filtrarReportes() {
    const texto = normalizar(searchInput.value);
    const tipo = filterTipo.value;
    const estado = filterEstado.value;
    
    const filtrados = reportesGenerados.filter(reporte => {
        const contenido = normalizar(`
            ${reporte.fecha}
            ${reporte.nombre}
            ${reporte.tabla}
            ${reporte.periodo}
            ${reporte.formato}
            ${reporte.usuario}
            ${reporte.estado}
        `);
        
        const coincideTexto = contenido.includes(texto);
        const coincideTipo = tipo === "" || reporte.tabla === tipo;
        const coincideEstado = estado === "" || reporte.estado === estado;
        
        return coincideTexto && coincideTipo && coincideEstado;
    });
    
    reportesFiltrados = filtrados;
    paginaActual = 1;
    renderReportes(filtrados);
}

// ============================================
// FUNCIONES DE GENERACIÓN DE REPORTES
// ============================================

async function generarReporte() {
    const tipo = document.getElementById("tipo-reporte").value;
    const desde = document.getElementById("fecha-desde").value;
    const hasta = document.getElementById("fecha-hasta").value;
    const formato = document.getElementById("formato-reporte").value;
    
    if (tipo === "") {
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
        const datos = await obtenerDatosReporte(tabla, desde, hasta);
        const periodo = desde && hasta ? `${desde} - ${hasta}` : "Todos los registros";
        
        if (!datos || datos.length === 0) {
            alert("No hay datos para generar el reporte.");
            return;
        }
        
        const nuevoReporte = {
            fecha: obtenerFechaActual(),
            fecha_iso: obtenerFechaISOActual(),
            nombre: nombresReportes[tabla],
            tabla: tabla,
            periodo: periodo,
            formato: formato,
            registros: datos.length,
            usuario: "Auditor CTIC",
            estado: "Generado",
            datos: datos
        };
        
        reportesGenerados.unshift(nuevoReporte);
        reportesFiltrados = [...reportesGenerados];
        
        descargarArchivoReporte(nuevoReporte);
        renderReportes(reportesFiltrados);
        await actualizarKPIs();
        
        alert(`Reporte "${nombresReportes[tabla]}" generado correctamente en ${formato}.`);
        
    } catch (error) {
        console.error('Error generando reporte:', error);
        alert('Error al generar el reporte. Intenta de nuevo.');
    }
}

// ============================================
// FUNCIONES DE DESCARGA
// ============================================

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
    
    const filas = datos.map(item =>
        encabezados.map(campo => item[campo])
    );
    
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
    if (!reporte.datos || reporte.datos.length === 0) {
        alert("No hay datos para exportar en PDF.");
        return;
    }
    
    const encabezados = Object.keys(reporte.datos[0]);
    
    const columnas = encabezados.map(campo => `
        <th>${escaparHTML(campo)}</th>
    `).join("");
    
    const filas = reporte.datos.map(item => `
        <tr>
            ${encabezados.map(campo => `
                <td>${escaparHTML(texto(item[campo]))}</td>
            `).join("")}
        </tr>
    `).join("");
    
    const html = `
        <html>
        <head>
            <title>${escaparHTML(reporte.nombre)} - DIAGTI</title>
            <style>
                @page { size: A4 landscape; margin: 12mm; }
                body { font-family: Arial, sans-serif; margin: 20px; color: #1f2a2e; }
                h1 { color: #0f75bc; margin-bottom: 4px; font-size: 22px; }
                .subtitulo { color: #64757a; margin-bottom: 16px; font-size: 12px; }
                .info {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                    font-size: 11px;
                }
                .info div {
                    border: 1px solid #dfe6e5;
                    padding: 8px;
                    border-radius: 6px;
                    background: #f8fafa;
                }
                table { width: 100%; border-collapse: collapse; font-size: 9px; }
                th { background: #0f75bc; color: white; padding: 6px; text-align: left; border: 1px solid #0f75bc; }
                td { border: 1px solid #dfe6e5; padding: 5px; vertical-align: top; word-break: break-word; }
                .footer { margin-top: 18px; font-size: 10px; color: #64757a; }
            </style>
        </head>
        <body>
            <h1>${escaparHTML(reporte.nombre)}</h1>
            <div class="subtitulo">DIAGTI · CTIC UNAS · Módulo Auditor</div>
            <div class="info">
                <div><strong>Tabla:</strong><br>${escaparHTML(reporte.tabla)}</div>
                <div><strong>Período:</strong><br>${escaparHTML(reporte.periodo)}</div>
                <div><strong>Registros:</strong><br>${escaparHTML(reporte.registros)}</div>
                <div><strong>Generado por:</strong><br>${escaparHTML(reporte.usuario)}</div>
            </div>
            <table>
                <thead><tr>${columnas}</tr></thead>
                <tbody>${filas}</tbody>
            </table>
            <div class="footer">Reporte generado el ${escaparHTML(reporte.fecha)} · Formato PDF.</div>
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `;
    
    abrirVentanaPDF(html);
}

function abrirVentanaPDF(html) {
    const ventana = window.open("", "_blank");
    if (!ventana) {
        alert("El navegador bloqueó la ventana emergente. Permite pop-ups para generar el PDF.");
        return;
    }
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
}

// ============================================
// FUNCIONES DE SESIÓN
// ============================================

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

// ============================================
// EVENTOS Y INICIALIZACIÓN
// ============================================

searchInput.addEventListener("input", filtrarReportes);
filterTipo.addEventListener("change", filtrarReportes);
filterEstado.addEventListener("change", filtrarReportes);

document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.getElementById("logout-confirm-overlay");
    if (overlay) {
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
    
    console.log('🚀 Iniciando módulo de Reportes...');
    reportesFiltrados = [...reportesGenerados];
    renderReportes(reportesGenerados);
    actualizarKPIs();
    
    const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
    if (!session.rol || session.rol !== 'auditor') {
        console.warn('Usuario no autorizado para esta página');
    }
    
    console.log('✅ Módulo de Reportes inicializado correctamente');
});

// Exponer funciones globales
window.generarReporte = generarReporte;
window.generarRapido = generarRapido;
window.descargarReporte = descargarReporte;
window.limpiarFormulario = limpiarFormulario;
window.cerrarSesion = cerrarSesion;
window.cancelarCerrarSesion = cancelarCerrarSesion;
window.confirmarCerrarSesion = confirmarCerrarSesion;
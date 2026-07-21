// ============================================
// CONEXIÓN CON EL BACKEND - AUDITORÍA
// ============================================

const API_URL_AUDITOR = 'http://localhost:8080/auditor';

// Variable global para almacenar los datos
let auditoriaActual = [];
let paginaActual = 1;
const registrosPorPagina = 5;
let cargando = false;

// Elementos del DOM
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

// ============================================
// FUNCIONES DE CONEXIÓN CON EL BACKEND
// ============================================

async function obtenerAuditoria(filtros) {
    try {
        const response = await fetch(`${API_URL_AUDITOR}/auditoria`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filtros)
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener auditoría');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerAuditoria:', error);
        return [];
    }
}

async function obtenerKPIs() {
    try {
        const response = await fetch(`${API_URL_AUDITOR}/kpis`);
        
        if (!response.ok) {
            throw new Error('Error al obtener KPIs');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerKPIs:', error);
        return { total: 0, consultas: 0, intentosFallidos: 0, exportaciones: 0 };
    }
}

async function registrarEvento(modulo, accion, descripcion) {
    try {
        const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
        const idUsuario = session.idUsuario || null;
        
        const params = new URLSearchParams({
            modulo: modulo,
            accion: accion,
            descripcion: descripcion
        });
        
        if (idUsuario) {
            params.append('idUsuario', idUsuario);
        }
        
        const response = await fetch(`${API_URL_AUDITOR}/registrar?${params}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            console.error('Error al registrar evento');
        }
    } catch (error) {
        console.error('Error en registrarEvento:', error);
    }
}

// ============================================
// FUNCIONES DE CARGA Y RENDERIZADO
// ============================================

async function cargarAuditoria() {
    if (cargando) return;
    cargando = true;
    
    try {
        const texto = searchInput.value.trim() || null;
        const modulo = filterModulo.value || null;
        const accion = filterAccion.value || null;
        const desde = filterDesde.value || null;
        const hasta = filterHasta.value || null;
        
        const filtros = {
            searchText: texto,
            modulo: modulo,
            accion: accion,
            fechaDesde: desde || null,
            fechaHasta: hasta || null,
            page: paginaActual,
            size: registrosPorPagina
        };
        
        // Limpiar valores vacíos
        Object.keys(filtros).forEach(key => {
            if (filtros[key] === null || filtros[key] === '') {
                delete filtros[key];
            }
        });
        
        const data = await obtenerAuditoria(filtros);
        auditoriaActual = data;
        
        // Actualizar KPIs desde el backend
        const kpis = await obtenerKPIs();
        kpiTotal.textContent = kpis.total || 0;
        kpiConsultas.textContent = kpis.consultas || 0;
        kpiFallidos.textContent = kpis.intentosFallidos || 0;
        kpiExportaciones.textContent = kpis.exportaciones || 0;
        
        renderAuditoria(data);
        
        // Registrar evento de consulta
        await registrarEvento('Auditoría', 'Consulta', 'El auditor consultó el historial de eventos');
        
    } catch (error) {
        console.error('Error en cargarAuditoria:', error);
        mostrarError('Error al cargar los datos de auditoría');
    } finally {
        cargando = false;
    }
}

function renderAuditoria(lista) {
    tablaAuditoria.innerHTML = "";
    
    // Si no hay datos, mostrar mensaje
    if (!lista || lista.length === 0) {
        tablaAuditoria.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; color:#64757a; padding:40px 20px;">
                    <div style="font-size: 18px; margin-bottom: 8px;">📋</div>
                    No se encontraron eventos con los filtros seleccionados.
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 eventos";
        renderPaginacion(0);
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
    
    registrosPagina.forEach(log => {
        const fila = document.createElement("tr");
        
        // Formatear fecha
        let fechaFormateada = "-";
        if (log.fechaEvento) {
            try {
                const fecha = new Date(log.fechaEvento);
                if (!isNaN(fecha.getTime())) {
                    const dia = String(fecha.getDate()).padStart(2, "0");
                    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
                    const anio = fecha.getFullYear();
                    const hora = String(fecha.getHours()).padStart(2, "0");
                    const minuto = String(fecha.getMinutes()).padStart(2, "0");
                    fechaFormateada = `${dia}/${mes}/${anio} ${hora}:${minuto}`;
                }
            } catch (e) {
                fechaFormateada = log.fechaEvento;
            }
        }
        
        // Obtener nombre y correo (pueden venir del backend o de campos antiguos)
        const nombreUsuario = log.nombreUsuario || log.usuario || "Usuario no registrado";
        const correoUsuario = log.correoUsuario || log.correo || "Sin correo";
        const idAuditoria = log.idAuditoria || log.id_auditoria || '?';
        const modulo = log.modulo || "-";
        const accion = log.accion || "-";
        const descripcion = log.descripcion || "-";
        const direccionIp = log.direccionIp || log.direccion_ip || "-";
        
        fila.innerHTML = `
            <td><span class="id-cell">#${idAuditoria}</span></td>
            <td><strong>${fechaFormateada}</strong></td>
            <td>
                <div class="user-cell">
                    <b>${nombreUsuario}</b>
                </div>
            </td>
            <td><span class="email-cell">${correoUsuario}</span></td>
            <td>${modulo}</td>
            <td>
                <span class="action-badge ${obtenerClaseAccion(accion)}">
                    ${accion}
                </span>
            </td>
            <td><div class="desc-cell">${descripcion}</div></td>
            <td><span class="ip-cell">${direccionIp}</span></td>
        `;
        
        tablaAuditoria.appendChild(fila);
    });
    
    const desde = inicio + 1;
    contadorRegistros.textContent = `Mostrando ${desde} - ${fin} de ${totalRegistros} eventos auditables`;
    
    renderPaginacion(totalPaginas);
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function formatearFecha(fechaEvento) {
    if (!fechaEvento) return "-";
    try {
        const fecha = new Date(fechaEvento.replace(" ", "T"));
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

function obtenerFechaISO(fechaEvento) {
    if (!fechaEvento) return "";
    return fechaEvento.substring(0, 10);
}

function obtenerClaseAccion(accion) {
    const acciones = {
        "Consulta": "action-consulta",
        "Exportación": "action-exportacion",
        "Intento fallido": "action-fallido",
        "Eliminación lógica": "action-eliminacion",
        "Registro": "action-default",
        "Actualización": "action-default"
    };
    return acciones[accion] || "action-default";
}

function renderPaginacion(totalPaginas) {
    paginacion.innerHTML = "";
    
    if (totalPaginas <= 1) {
        return;
    }
    
    // Botón Anterior
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn btn-ghost btn-sm';
    btnAnterior.textContent = 'Anterior';
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.onclick = () => cambiarPagina(paginaActual - 1);
    paginacion.appendChild(btnAnterior);
    
    // Números de página
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
    
    // Botón Siguiente
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn btn-ghost btn-sm';
    btnSiguiente.textContent = 'Siguiente';
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.onclick = () => cambiarPagina(paginaActual + 1);
    paginacion.appendChild(btnSiguiente);
}

function cambiarPagina(numeroPagina) {
    const totalPaginas = Math.ceil(auditoriaActual.length / registrosPorPagina);
    if (numeroPagina < 1 || numeroPagina > totalPaginas) return;
    
    paginaActual = numeroPagina;
    renderAuditoria(auditoriaActual);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarError(mensaje) {
    // Puedes implementar un toast o notificación
    console.error(mensaje);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-family: 'Inter', sans-serif;
    `;
    errorDiv.textContent = mensaje;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// ============================================
// FUNCIONES DE FILTRADO Y EXPORTACIÓN
// ============================================

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
        log.idAuditoria || log.id_auditoria || '',
        formatearFecha(log.fechaEvento || log.fecha_evento),
        log.nombreUsuario || log.usuario || 'Usuario no registrado',
        log.correoUsuario || log.correo || 'Sin correo',
        log.modulo || '-',
        log.accion || '-',
        log.descripcion || '-',
        log.direccionIp || log.direccion_ip || '-'
    ]);
    
    const contenido = [encabezados, ...filas]
        .map(fila => fila.map(valor => `"${String(valor ?? '').replace(/"/g, '""')}"`).join(","))
        .join("\n");
    
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `auditoria_diagti_${new Date().toISOString().slice(0,10)}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
    
    // Registrar evento de exportación
    registrarEvento('Reportes', 'Exportación', 'El auditor exportó el reporte de auditoría en Excel');
}

function exportarPDF() {
    if (!auditoriaActual || auditoriaActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    
    const filas = auditoriaActual.map(log => `
        <tr>
            <td>${log.idAuditoria || log.id_auditoria || ''}</td>
            <td>${formatearFecha(log.fechaEvento || log.fecha_evento)}</td>
            <td>${log.nombreUsuario || log.usuario || 'Usuario no registrado'}</td>
            <td>${log.correoUsuario || log.correo || 'Sin correo'}</td>
            <td>${log.modulo || '-'}</td>
            <td>${log.accion || '-'}</td>
            <td>${log.descripcion || '-'}</td>
            <td>${log.direccionIp || log.direccion_ip || '-'}</td>
        </tr>
    `).join("");
    
    const html = `
        <html>
        <head>
            <title>Reporte de Auditoría - DIAGTI</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; color: #1f2a2e; }
                h1 { color: #0f75bc; margin-bottom: 4px; }
                .subtitulo { color: #64757a; margin-bottom: 20px; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th { background: #0f75bc; color: white; padding: 8px; text-align: left; }
                td { border: 1px solid #dfe6e5; padding: 7px; vertical-align: top; }
                .footer { margin-top: 24px; font-size: 11px; color: #64757a; }
                .fecha { color: #64757a; font-size: 12px; margin-bottom: 15px; }
            </style>
        </head>
        <body>
            <h1>Reporte de Auditoría del Sistema</h1>
            <div class="subtitulo">DIAGTI · CTIC UNAS · Módulo Auditor</div>
            <div class="fecha">Generado: ${new Date().toLocaleString()}</div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha y hora</th>
                        <th>Usuario</th>
                        <th>Correo</th>
                        <th>Módulo</th>
                        <th>Acción</th>
                        <th>Descripción</th>
                        <th>IP origen</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
            <div class="footer">
                Reporte generado por Auditor CTIC. Total de eventos: ${auditoriaActual.length}.
            </div>
            <script>
                window.onload = function() { window.print(); };
            <\/script>
        </body>
        </html>
    `;
    
    abrirVentanaPDF(html);
    
    // Registrar evento de exportación
    registrarEvento('Reportes', 'Exportación', 'El auditor exportó el reporte de auditoría en PDF');
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

// Event listeners para filtros
searchInput.addEventListener("input", filtrarAuditoria);
filterModulo.addEventListener("change", filtrarAuditoria);
filterAccion.addEventListener("change", filtrarAuditoria);
filterDesde.addEventListener("change", filtrarAuditoria);
filterHasta.addEventListener("change", filtrarAuditoria);

// Cerrar modal de logout al hacer clic fuera
document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.getElementById("logout-confirm-overlay");
    if (overlay) {
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) {
                cancelarCerrarSesion();
            }
        });
    }
    
    // Cargar datos iniciales
    cargarAuditoria();
    
    // Verificar sesión
    const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
    if (!session.rol || session.rol !== 'auditor') {
        console.warn('Usuario no autorizado para esta página');
        // window.location.href = '../../../login/html/login.html';
    }
    
    console.log('Módulo de Auditoría inicializado correctamente');
});
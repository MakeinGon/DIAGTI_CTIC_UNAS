// ============================================
// CONEXIÓN CON EL BACKEND - INVENTARIO REAL
// ============================================

const API_URL_INVENTARIO = '/auditor/inventario';

let inventarioActual = [];
let paginaActual = 1;
const registrosPorPagina = 5;
let cargando = false;

// Elementos del DOM
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
let sistemaSeleccionado = null;

// ============================================
// FUNCIONES DE CONEXIÓN CON EL BACKEND
// ============================================

async function obtenerInventario(filtros) {
    try {
        console.log('📡 Enviando a:', `${API_URL_INVENTARIO}`);
        console.log('📋 Filtros:', filtros);
        
        const response = await fetch(`${API_URL_INVENTARIO}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filtros || {})
        });
        
        console.log('📥 Status de la respuesta:', response.status);
        
        if (!response.ok) {
            throw new Error('Error al obtener inventario: ' + response.status);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos del backend:', data);
        console.log('✅ Cantidad de registros:', data.length);
        
        // ✅ SIEMPRE devolver los datos del backend, aunque sea []
        return data;
    } catch (error) {
        console.error('❌ Error en obtenerInventario:', error);
        // 🔴 SIN FALLBACK - Devolver array vacío
        return [];
    }
}

async function obtenerKPIs() {
    try {
        const response = await fetch(`${API_URL_INVENTARIO}/kpis`);
        if (!response.ok) throw new Error('Error al obtener KPIs');
        const data = await response.json();
        console.log('📊 KPIs desde BD:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en obtenerKPIs:', error);
        return { total: 0, legacy: 0, riesgo: 0, contrato: 0 };
    }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

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
    if (valor === "validado" || valor === "cerrado") return "status-success";
    if (valor === "observado" || valor === "subsanado") return "status-warning";
    if (valor === "rechazado") return "status-danger";
    if (valor === "enviado") return "status-info";
    return "status-secondary";
}

function obtenerBadgeRiesgo(riesgo) {
    const valor = normalizar(riesgo);
    if (valor === "critico" || valor === "alto") return "status-danger";
    if (valor === "medio") return "status-warning";
    if (valor === "bajo") return "status-success";
    return "status-secondary";
}

function obtenerBadgeLegacy(esLegacy) {
    return esLegacy ? "status-warning" : "status-success";
}

function textoBooleano(valor) {
    return valor ? "Sí" : "No";
}

// ============================================
// FUNCIONES DE CARGA Y RENDERIZADO
// ============================================

async function cargarInventario() {
    if (cargando) return;
    cargando = true;
    
    try {
        const filtros = {
            searchText: searchInput.value.trim() || null,
            estado: filterEstado.value || null,
            riesgo: filterRiesgo.value || null,
            legacy: filterLegacy.value || null
        };
        
        Object.keys(filtros).forEach(key => {
            if (filtros[key] === null || filtros[key] === '') {
                delete filtros[key];
            }
        });
        
        // ✅ OBTENER DATOS DEL BACKEND
        const data = await obtenerInventario(filtros);
        inventarioActual = data || [];
        
        console.log('📊 Datos a renderizar:', inventarioActual.length);
        
        // Actualizar KPIs
        const kpis = await obtenerKPIs();
        kpiTotal.textContent = kpis.total || 0;
        kpiLegacy.textContent = kpis.legacy || 0;
        kpiRiesgo.textContent = kpis.riesgo || 0;
        kpiContrato.textContent = kpis.contrato || 0;
        
        renderInventario(inventarioActual);
        
    } catch (error) {
        console.error('❌ Error en cargarInventario:', error);
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
                    <br><small>Verifica que la tabla sistemas tenga registros.</small>
                </td>
            </tr>
        `;
        contadorRegistros.textContent = "Mostrando 0 registros";
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
    
    registrosPagina.forEach(sistema => {
        const fila = document.createElement("tr");
        
        // Usar camelCase o snake_case según venga del backend
        const id = sistema.idSistema || sistema.id || sistema.id_sistema || '?';
        const codigo = sistema.codigoUnico || sistema.codigo || sistema.codigo_unico || '-';
        const nombre = sistema.nombre || 'Sistema sin nombre';
        const descripcion = sistema.descripcion || '';
        const idArea = sistema.idAreaUsuario || sistema.id_area_usuario || '-';
        const idTipo = sistema.idTipoAplicativo || sistema.id_tipo_aplicativo || '-';
        const estado = sistema.estadoFlujo || sistema.estado || sistema.estado_flujo || '-';
        const riesgo = sistema.nivelRiesgo || sistema.riesgo || sistema.nivel_riesgo || '-';
        const legacy = sistema.esLegacy || sistema.legacy || sistema.es_legacy || false;
        const fecha = sistema.fechaActualizacion || sistema.actualizacion || sistema.fecha_actualizacion || null;
        
        fila.innerHTML = `
            <td><strong>#${texto(id)}</strong></td>
            <td><strong>${texto(codigo)}</strong></td>
            <td>
                <div class="cell-system">
                    <div class="system-avatar">${obtenerIniciales(nombre)}</div>
                    <div>
                        <div class="system-name">${texto(nombre)}</div>
                        <div class="system-desc">${texto(descripcion)}</div>
                    </div>
                </div>
            </td>
            <td>${texto(idArea)}</td>
            <td>${texto(idTipo)}</td>
            <td>
                <span class="badge ${obtenerBadgeEstado(estado)}">
                    ${texto(estado)}
                </span>
            </td>
            <td>
                <span class="badge ${obtenerBadgeRiesgo(riesgo)}">
                    ${texto(riesgo)}
                </span>
            </td>
            <td>
                <span class="badge ${obtenerBadgeLegacy(legacy)}">
                    ${textoBooleano(legacy)}
                </span>
            </td>
            <td>${formatearFecha(fecha)}</td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="abrirModalDetalle(${id})">
                    Ver detalle
                </button>
            </td>
        `;
        
        tablaInventario.appendChild(fila);
    });
    
    const desde = inicio + 1;
    contadorRegistros.textContent = `Mostrando ${desde} - ${fin} de ${totalRegistros} registros`;
    
    renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
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
    const totalPaginas = Math.ceil(inventarioActual.length / registrosPorPagina);
    if (numeroPagina < 1 || numeroPagina > totalPaginas) return;
    
    paginaActual = numeroPagina;
    renderInventario(inventarioActual);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarError(mensaje) {
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
// FUNCIONES DE FILTRADO
// ============================================

function filtrarInventario() {
    paginaActual = 1;
    cargarInventario();
}

// ============================================
// FUNCIONES DE MODAL DETALLE
// ============================================

function abrirModalDetalle(idSistema) {
    const sistema = inventarioActual.find(item => {
        const id = item.idSistema || item.id || item.id_sistema;
        return id == idSistema;
    });
    
    if (!sistema) {
        alert("No se encontró el detalle del sistema.");
        return;
    }
    
    sistemaSeleccionado = sistema;
    
    document.getElementById("modal-codigo").textContent = texto(sistema.codigoUnico || sistema.codigo || sistema.codigo_unico);
    document.getElementById("modal-nombre").textContent = texto(sistema.nombre);
    document.getElementById("modal-descripcion").textContent = texto(sistema.descripcion);
    
    document.getElementById("modal-id").textContent = texto(sistema.idSistema || sistema.id || sistema.id_sistema);
    document.getElementById("modal-codigo-detalle").textContent = texto(sistema.codigoUnico || sistema.codigo || sistema.codigo_unico);
    document.getElementById("modal-area").textContent = texto(sistema.idAreaUsuario || sistema.id_area_usuario);
    document.getElementById("modal-tipo").textContent = texto(sistema.idTipoAplicativo || sistema.id_tipo_aplicativo);
    document.getElementById("modal-criticidad").textContent = texto(sistema.idCriticidad || sistema.id_criticidad);
    
    document.getElementById("modal-responsable-funcional").textContent = texto(sistema.idResponsableFuncional || sistema.id_responsable_funcional);
    document.getElementById("modal-responsable-tecnico").textContent = texto(sistema.idResponsableTecnico || sistema.id_responsable_tecnico);
    document.getElementById("modal-desarrollador").textContent = texto(sistema.desarrolladorNombre || sistema.desarrollador_nombre);
    
    document.getElementById("modal-forma").textContent = texto(sistema.formaAdquisicion || sistema.forma_adquisicion);
    document.getElementById("modal-ano").textContent = texto(sistema.anoAdquisicion || sistema.ano_adquisicion);
    document.getElementById("modal-contrato").textContent = textoBooleano(sistema.contratoVigente || sistema.contrato_vigente);
    document.getElementById("modal-vencimiento").textContent = texto(sistema.fechaVencimientoSoporte || sistema.fecha_vencimiento_soporte);
    
    document.getElementById("modal-estado").textContent = texto(sistema.estadoFlujo || sistema.estado || sistema.estado_flujo);
    document.getElementById("modal-riesgo").textContent = texto(sistema.nivelRiesgo || sistema.riesgo || sistema.nivel_riesgo);
    document.getElementById("modal-prioridad").textContent = texto(sistema.prioridadMigracion || sistema.prioridad_migracion);
    document.getElementById("modal-legacy").textContent = textoBooleano(sistema.esLegacy || sistema.legacy || sistema.es_legacy);
    
    document.getElementById("modal-fecha-creacion").textContent = formatearFecha(sistema.fechaCreacion || sistema.fecha_creacion);
    document.getElementById("modal-fecha-actualizacion").textContent = formatearFecha(sistema.fechaActualizacion || sistema.actualizacion || sistema.fecha_actualizacion);
    document.getElementById("modal-fecha-eliminacion").textContent = formatearFecha(sistema.fechaEliminacion || sistema.fecha_eliminacion);
    
    document.getElementById("modal-badges").innerHTML = `
        <span class="badge ${obtenerBadgeEstado(sistema.estadoFlujo || sistema.estado || sistema.estado_flujo)}">${texto(sistema.estadoFlujo || sistema.estado || sistema.estado_flujo)}</span>
        <span class="badge ${obtenerBadgeRiesgo(sistema.nivelRiesgo || sistema.riesgo || sistema.nivel_riesgo)}">${texto(sistema.nivelRiesgo || sistema.riesgo || sistema.nivel_riesgo)}</span>
        <span class="badge ${obtenerBadgeLegacy(sistema.esLegacy || sistema.legacy || sistema.es_legacy)}">Legacy: ${textoBooleano(sistema.esLegacy || sistema.legacy || sistema.es_legacy)}</span>
        <span class="badge status-secondary">Solo lectura</span>
    `;
    
    modalDetalle.classList.add("active");
    document.body.style.overflow = "hidden";
}

function cerrarModalDetalle() {
    modalDetalle.classList.remove("active");
    document.body.style.overflow = "";
}

// ============================================
// FUNCIONES DE EXPORTACIÓN
// ============================================

function exportarExcel() {
    if (inventarioActual.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    
    const encabezados = [
        "idSistema", "codigoUnico", "nombre", "descripcion",
        "idAreaUsuario", "idTipoAplicativo", "idCriticidad",
        "formaAdquisicion", "idResponsableFuncional", "idResponsableTecnico",
        "anoAdquisicion", "desarrolladorNombre", "contratoVigente",
        "fechaVencimientoSoporte", "esLegacy", "estadoFlujo",
        "nivelRiesgo", "prioridadMigracion", "fechaCreacion",
        "fechaActualizacion", "fechaEliminacion"
    ];
    
    const filas = inventarioActual.map(sistema =>
        encabezados.map(campo => sistema[campo])
    );
    
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
            <td>${texto(sistema.idSistema || sistema.id || sistema.id_sistema)}</td>
            <td>${texto(sistema.codigoUnico || sistema.codigo || sistema.codigo_unico)}</td>
            <td>${texto(sistema.nombre)}</td>
            <td>${texto(sistema.descripcion)}</td>
            <td>${texto(sistema.estadoFlujo || sistema.estado || sistema.estado_flujo)}</td>
            <td>${texto(sistema.nivelRiesgo || sistema.riesgo || sistema.nivel_riesgo)}</td>
            <td>${textoBooleano(sistema.esLegacy || sistema.legacy || sistema.es_legacy)}</td>
            <td>${formatearFecha(sistema.fechaActualizacion || sistema.actualizacion || sistema.fecha_actualizacion)}</td>
        </tr>
    `).join("");
    
    const html = `
        <html>
        <head>
            <title>Inventario de Sistemas - DIAGTI</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; color: #1f2a2e; }
                h1 { color: #0f75bc; margin-bottom: 4px; }
                .subtitulo { color: #64757a; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { background: #0f75bc; color: white; padding: 8px; text-align: left; }
                td { border: 1px solid #dfe6e5; padding: 7px; vertical-align: top; }
                .footer { margin-top: 24px; font-size: 11px; color: #64757a; }
            </style>
        </head>
        <body>
            <h1>Reporte de Inventario de Sistemas</h1>
            <div class="subtitulo">DIAGTI · CTIC UNAS · Módulo Auditor</div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Sistema</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Riesgo</th>
                        <th>Legacy</th>
                        <th>Actualización</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
            <div class="footer">Reporte generado por Auditor CTIC. Total: ${inventarioActual.length}</div>
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

function exportarFichaSistema() {
    if (!sistemaSeleccionado) {
        alert("No hay sistema seleccionado.");
        return;
    }
    
    const encabezados = ["Campo", "Valor"];
    const filas = Object.entries(sistemaSeleccionado);
    descargarCSV(`ficha_${sistemaSeleccionado.codigoUnico || sistemaSeleccionado.codigo || sistemaSeleccionado.codigo_unico}.csv`, encabezados, filas);
}

function exportarFichaPDF() {
    if (!sistemaSeleccionado) {
        alert("No hay sistema seleccionado.");
        return;
    }
    
    const filas = Object.entries(sistemaSeleccionado).map(([campo, valor]) => `
        <tr>
            <td><strong>${campo}</strong></td>
            <td>${texto(valor)}</td>
        </tr>
    `).join("");
    
    const html = `
        <html>
        <head>
            <title>Ficha de Sistema - ${texto(sistemaSeleccionado.codigoUnico || sistemaSeleccionado.codigo || sistemaSeleccionado.codigo_unico)}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; }
                h1 { color: #0f75bc; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                td { border: 1px solid #dfe6e5; padding: 8px; }
                td:first-child { background: #f3f6f6; width: 35%; }
                .footer { margin-top: 24px; font-size: 11px; color: #64757a; }
            </style>
        </head>
        <body>
            <h1>Ficha del Sistema</h1>
            <div class="subtitulo">${texto(sistemaSeleccionado.codigoUnico || sistemaSeleccionado.codigo || sistemaSeleccionado.codigo_unico)} · ${texto(sistemaSeleccionado.nombre)}</div>
            <table><tbody>${filas}</tbody></table>
            <div class="footer">Ficha generada por Auditor CTIC · DIAGTI CTIC UNAS.</div>
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `;
    
    abrirVentanaPDF(html);
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

searchInput.addEventListener("input", filtrarInventario);
filterEstado.addEventListener("change", filtrarInventario);
filterRiesgo.addEventListener("change", filtrarInventario);
filterLegacy.addEventListener("change", filtrarInventario);

modalDetalle.addEventListener("click", function(e) {
    if (e.target === modalDetalle) cerrarModalDetalle();
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") cerrarModalDetalle();
});

document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.getElementById("logout-confirm-overlay");
    if (overlay) {
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
    
    console.log('🚀 Iniciando módulo de Inventario...');
    cargarInventario();
    
    const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
    if (!session.rol || session.rol !== 'auditor') {
        console.warn('Usuario no autorizado para esta página');
    }
    
    console.log('✅ Módulo de Inventario inicializado correctamente');
});

// Exponer funciones globales
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
// ============================================================
// MÓDULO DE ADMINISTRACIÓN DE EVIDENCIAS - CONECTADO AL BACKEND
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================
const API_BASE = "http://localhost:8080/api/admin/evidencias";
const API_SISTEMAS = "http://localhost:8080/api/admin/sistemas";

// ============================================================
// STATE
// ============================================================
let evidencias = [];
let evidenciasFiltradas = [];
let paginaActual = 1;
const ITEMS_POR_PAGINA = 5;
let isLoading = false;

// ============================================================
// FUNCIONES DE CARGA DE DATOS
// ============================================================

async function cargarEvidencias() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        // Obtener filtros
        const busqueda = document.getElementById('buscarEvidencia')?.value || '';
        const modulo = document.getElementById('filtroModulo')?.value || '';
        const responsable = document.getElementById('filtroResponsable')?.value || '';
        const estado = document.getElementById('filtroEstado')?.value || '';
        
        // Construir URL con filtros
        let url = `${API_BASE}?`;
        const params = [];
        if (busqueda) params.push(`busqueda=${encodeURIComponent(busqueda)}`);
        if (modulo) params.push(`modulo=${encodeURIComponent(modulo)}`);
        if (responsable) params.push(`responsable=${encodeURIComponent(responsable)}`);
        if (estado) params.push(`estado=${encodeURIComponent(estado)}`);
        url += params.join('&');
        
        // Si no hay filtros, quitar el '?'
        if (params.length === 0) url = API_BASE;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        
        evidencias = await response.json();
        evidenciasFiltradas = [...evidencias];
        
        // Cargar estadísticas
        await cargarStats();
        
        // Llenar filtros dinámicos
        llenarFiltrosDinamicos();
        
        // Renderizar tabla
        paginaActual = 1;
        renderTabla();
        
        console.log(`📎 ${evidencias.length} evidencias cargadas desde el backend`);
        
    } catch (error) {
        console.error('❌ Error cargando evidencias:', error);
        mostrarError('Error al cargar las evidencias: ' + error.message);
    } finally {
        isLoading = false;
    }
}

async function cargarStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const stats = await response.json();
        renderStats(stats);
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
    }
}

async function cargarDetalle(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('❌ Error cargando detalle:', error);
        return null;
    }
}

// ============================================================
// FUNCIONES DE RENDERIZADO
// ============================================================

function renderStats(stats) {
    const container = document.getElementById('statsEvidencias');
    if (!container) return;
    
    const total = stats.total || 0;
    const activa = stats.activa || 0;
    const inactiva = stats.inactiva || 0;
    
    container.innerHTML = `
        <div class="card azul">
            <div class="card-number">${total}</div>
            <div class="card-label">Total Evidencias</div>
        </div>
        <div class="card verde">
            <div class="card-number">${activa}</div>
            <div class="card-label">Activas</div>
        </div>
        <div class="card rojo">
            <div class="card-number">${inactiva}</div>
            <div class="card-label">Inactivas</div>
        </div>
    `;
}

function renderTabla() {
    const tbody = document.getElementById('tablaEvidencias');
    if (!tbody) return;

    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    const datosPagina = evidenciasFiltradas.slice(inicio, fin);

    if (datosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:3rem;color:#999;">
                    <div style="font-size:3rem;margin-bottom:0.5rem;">📎</div>
                    No hay evidencias que coincidan con los filtros
                </td>
            </tr>
        `;
        document.getElementById('evidenciaCount').textContent = 'Total: 0';
        actualizarPaginacion();
        return;
    }

    tbody.innerHTML = datosPagina.map(e => {
        const estadoLower = (e.estado || '').toLowerCase();
        let badgeClase = 'secondary';
        if (estadoLower === 'activa' || estadoLower === 'validado') badgeClase = 'success';
        else if (estadoLower === 'inactiva' || estadoLower === 'observado') badgeClase = 'danger';
        else if (estadoLower === 'pendiente') badgeClase = 'warning';
        
        return `
            <tr>
                <td><strong>${e.sistema || 'Sin sistema'}</strong></td>
                <td>${e.modulo || '—'}</td>
                <td>${e.responsable || '—'}</td>
                <td><span class="badge badge-info">${e.tipo || 'N/A'}</span></td>
                <td><span class="badge badge-${badgeClase}">${e.estado || 'N/A'}</span></td>
                <td>${e.fecha || 'N/A'}</td>
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn-icon btn-ver" data-id="${e.id}" title="Ver detalle" style="margin:0 3px; padding:6px 8px; background:#f0f4f8; border-radius:6px; cursor:pointer;">👁️</button>
                    <button class="btn-icon btn-descargar" data-archivo="${e.archivo || ''}" title="Descargar" style="margin:0 3px; padding:6px 8px; background:#f0f4f8; border-radius:6px; cursor:pointer;">⬇️</button>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('evidenciaCount').textContent = `Total: ${evidenciasFiltradas.length}`;
    actualizarPaginacion();
}

function llenarFiltrosDinamicos() {
    // Módulos únicos desde los datos
    const modulos = [...new Set(evidencias.map(e => e.modulo).filter(Boolean))].sort();
    const selectModulo = document.getElementById('filtroModulo');
    if (selectModulo) {
        const currentValue = selectModulo.value;
        selectModulo.innerHTML = '<option value="">Todos los módulos</option>';
        modulos.forEach(m => {
            selectModulo.innerHTML += `<option value="${m}">${m}</option>`;
        });
        selectModulo.value = currentValue;
    }

    // Responsables únicos desde los datos
    const responsables = [...new Set(evidencias.map(e => e.responsable).filter(Boolean))].sort();
    const selectResponsable = document.getElementById('filtroResponsable');
    if (selectResponsable) {
        const currentValue = selectResponsable.value;
        selectResponsable.innerHTML = '<option value="">Todos los responsables</option>';
        responsables.forEach(r => {
            selectResponsable.innerHTML += `<option value="${r}">${r}</option>`;
        });
        selectResponsable.value = currentValue;
    }
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(evidenciasFiltradas.length / ITEMS_POR_PAGINA) || 1;
    document.getElementById('paginaInfo').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btnAnterior').disabled = (paginaActual === 1);
    document.getElementById('btnSiguiente').disabled = (paginaActual === totalPaginas);
}

function cambiarPagina(delta) {
    const totalPaginas = Math.ceil(evidenciasFiltradas.length / ITEMS_POR_PAGINA) || 1;
    const nuevaPagina = paginaActual + delta;
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    paginaActual = nuevaPagina;
    renderTabla();
}

// ============================================================
// FILTROS
// ============================================================

function filtrarEvidencias() {
    const busqueda = document.getElementById('buscarEvidencia')?.value?.toLowerCase()?.trim() || '';
    const modulo = document.getElementById('filtroModulo')?.value || '';
    const responsable = document.getElementById('filtroResponsable')?.value || '';
    const estado = document.getElementById('filtroEstado')?.value || '';

    evidenciasFiltradas = evidencias.filter(e => {
        const matchBusqueda = (e.sistema || '').toLowerCase().includes(busqueda) ||
                             (e.modulo || '').toLowerCase().includes(busqueda) ||
                             (e.responsable || '').toLowerCase().includes(busqueda) ||
                             (e.tipo || '').toLowerCase().includes(busqueda) ||
                             (e.archivo || '').toLowerCase().includes(busqueda);
        const matchModulo = modulo === '' || e.modulo === modulo;
        const matchResponsable = responsable === '' || e.responsable === responsable;
        const matchEstado = estado === '' || e.estado === estado;
        return matchBusqueda && matchModulo && matchResponsable && matchEstado;
    });

    paginaActual = 1;
    renderTabla();
}

function limpiarFiltros() {
    document.getElementById('buscarEvidencia').value = '';
    document.getElementById('filtroModulo').value = '';
    document.getElementById('filtroResponsable').value = '';
    document.getElementById('filtroEstado').value = '';
    evidenciasFiltradas = [...evidencias];
    paginaActual = 1;
    renderTabla();
}

// ============================================================
// ACCIONES
// ============================================================

async function verDetalle(id) {
    const ev = await cargarDetalle(id);
    if (!ev) {
        alert('Evidencia no encontrada.');
        return;
    }

    const body = document.getElementById('detalleBody');
    if (!body) return;

    body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; padding:4px 0;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Sistema</span>
                <span style="color:#1f2937;">${ev.sistema || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Módulo</span>
                <span style="color:#1f2937;">${ev.modulo || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Responsable</span>
                <span style="color:#1f2937;">${ev.responsable || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Tipo</span>
                <span style="color:#1f2937;">${ev.tipo || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Estado</span>
                <span style="color:#1f2937;">${ev.estado || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Fecha</span>
                <span style="color:#1f2937;">${ev.fecha || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Archivo</span>
                <span style="color:#1f2937;">${ev.archivo || 'Sin archivo'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Descripción</span>
                <span style="color:#1f2937;">${ev.descripcion || 'No disponible'}</span>
            </div>
        </div>
    `;

    document.getElementById('modalDetalleTitulo').textContent = `📄 Detalle de Evidencia (${ev.sistema || 'Sin sistema'})`;
    const modal = document.getElementById('modalDetalle');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
    }
}

function descargarEvidencia(archivo) {
    if (!archivo) {
        alert('⚠️ No hay archivo asociado para descargar.');
        return;
    }

    if (archivo.startsWith('http://') || archivo.startsWith('https://')) {
        window.open(archivo, '_blank');
        return;
    }

    // Simular descarga de un archivo de ejemplo
    const contenido = `📎 EVIDENCIA - DIAGTI\n\n` +
                     `Archivo: ${archivo}\n` +
                     `Descargado desde el sistema DIAGTI\n` +
                     `Fecha: ${new Date().toLocaleString('es-PE')}\n\n` +
                     `---\nDIAGTI v2.0 · CTIC UNAS`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivo;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`✅ Archivo "${archivo}" descargado correctamente.`);
}

// ============================================================
// EXPORTACIONES
// ============================================================

function exportarCSV() {
    const datos = evidenciasFiltradas.length > 0 ? evidenciasFiltradas : evidencias;
    if (datos.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    const headers = ['Sistema', 'Módulo', 'Responsable', 'Tipo', 'Estado', 'Fecha', 'Archivo'];
    const rows = datos.map(e => [
        e.sistema || '',
        e.modulo || '',
        e.responsable || '',
        e.tipo || '',
        e.estado || '',
        e.fecha || '',
        e.archivo || ''
    ]);

    let csvContent = '\uFEFF';
    csvContent += headers.join(';') + '\n';
    rows.forEach(row => {
        const escaped = row.map(cell => {
            if (typeof cell === 'string' && (cell.includes(';') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        });
        csvContent += escaped.join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `evidencias_${fecha}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`✅ CSV exportado correctamente (${datos.length} registros)`);
}

// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) overlay.classList.add('open');
}

function cancelarCerrarSesion() {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) overlay.classList.remove('open');
}

function confirmarCerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../../login/html/login.html";
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

function mostrarError(mensaje) {
    // Mostrar error en la tabla
    const tbody = document.getElementById('tablaEvidencias');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:3rem;color:#991b1b;">
                    <div style="font-size:3rem;margin-bottom:0.5rem;">❌</div>
                    ${mensaje}
                </td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📎 Módulo de Administración de Evidencias iniciando...');

    // === EVENTOS ===
    document.getElementById('btnFiltrar')?.addEventListener('click', filtrarEvidencias);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);
    document.getElementById('buscarEvidencia')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') filtrarEvidencias();
    });
    document.getElementById('btnExportarCSV')?.addEventListener('click', exportarCSV);
    document.getElementById('btnRefrescar')?.addEventListener('click', function() {
        cargarEvidencias();
    });
    document.getElementById('btnAnterior')?.addEventListener('click', function() { cambiarPagina(-1); });
    document.getElementById('btnSiguiente')?.addEventListener('click', function() { cambiarPagina(1); });

    // Delegación de eventos para botones de la tabla
    document.getElementById('tablaEvidencias')?.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('btn-ver')) {
            const id = parseInt(btn.dataset.id);
            if (!isNaN(id)) verDetalle(id);
        } else if (btn.classList.contains('btn-descargar')) {
            const archivo = btn.dataset.archivo;
            if (archivo) descargarEvidencia(archivo);
        }
    });

    // Cerrar modales
    document.getElementById('btnCerrarDetalle')?.addEventListener('click', function() {
        document.getElementById('modalDetalle').style.display = 'none';
    });
    document.getElementById('btnCerrarDetalleFooter')?.addEventListener('click', function() {
        document.getElementById('modalDetalle').style.display = 'none';
    });
    document.getElementById('modalDetalle')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });

    // Cerrar sesión
    document.getElementById('btnCerrarSesion')?.addEventListener('click', cerrarSesion);
    document.getElementById('btnCancelarCerrarSesion')?.addEventListener('click', cancelarCerrarSesion);
    document.getElementById('btnCancelarCerrarSesion2')?.addEventListener('click', cancelarCerrarSesion);
    document.getElementById('btnConfirmarCerrarSesion')?.addEventListener('click', confirmarCerrarSesion);
    document.getElementById('logout-confirm-overlay')?.addEventListener('click', function(e) {
        if (e.target === this) cancelarCerrarSesion();
    });

    // Cargar datos iniciales
    cargarEvidencias();

    console.log('✅ Módulo de Evidencias inicializado correctamente');
});
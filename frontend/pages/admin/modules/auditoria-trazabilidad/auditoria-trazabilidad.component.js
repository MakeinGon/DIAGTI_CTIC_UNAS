// ============================================================
// AUDITORÍA - BITÁCORA DE ACCIONES ADMINISTRATIVAS
// CONECTADO AL BACKEND
// ============================================================

// ============================================================
// CONFIGURACIÓN API
// ============================================================
const API_BASE = "/api/admin/auditoria";

// ============================================================
// STATE
// ============================================================
let registros = [];
let registrosFiltrados = [];
let paginaActual = 1;
const ITEMS_POR_PAGINA = 8;
let isLoading = false;

// ============================================================
// UTILIDAD DE MANEJO DE ERRORES DE FETCH
// ============================================================
function manejarError(res) {
    if (!res.ok) {
        return res.json().catch(() => ({})).then(err => {
            throw new Error(err.message || `Error ${res.status} en la petición`);
        });
    }
    if (res.status === 204) return null;
    return res.json();
}

// ============================================================
// CARGA DE DATOS DESDE EL BACKEND
// ============================================================
function cargarAuditoria() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const usuario = document.getElementById('filtroUsuario')?.value?.trim() || '';
        const modulo = document.getElementById('filtroModulo')?.value || '';
        const fechaDesde = document.getElementById('filtroFechaDesde')?.value || '';
        const fechaHasta = document.getElementById('filtroFechaHasta')?.value || '';
        
        let url = `${API_BASE}?`;
        const params = [];
        if (usuario) params.push(`usuario=${encodeURIComponent(usuario)}`);
        if (modulo) params.push(`modulo=${encodeURIComponent(modulo)}`);
        if (fechaDesde) params.push(`fechaDesde=${encodeURIComponent(fechaDesde)}`);
        if (fechaHasta) params.push(`fechaHasta=${encodeURIComponent(fechaHasta)}`);
        url += params.join('&');
        
        if (params.length === 0) url = API_BASE;
        
        console.log('📋 Cargando auditoría desde:', url);
        
        fetch(url)
            .then(res => manejarError(res))
            .then(data => {
                registros = (data || []).map(r => ({
                    id: r.id,
                    fecha: r.fecha || '',
                    usuario: r.usuario || 'Sistema',
                    modulo: r.modulo || 'N/A',
                    accion: r.accion || 'N/A',
                    detalle: r.descripcion || 'Sin detalles'
                }));
                registrosFiltrados = [...registros];
                
                console.log(`📋 ${registros.length} registros de auditoría cargados`);
                
                // Cargar estadísticas y renderizar
                cargarStats();
                llenarFiltros();
                paginaActual = 1;
                renderTabla();
                renderStats();
            })
            .catch(error => {
                console.error('❌ Error al cargar auditoría:', error);
                mostrarError('Error al cargar los registros: ' + error.message);
            })
            .finally(() => {
                isLoading = false;
            });
    } catch (error) {
        console.error('❌ Error en cargarAuditoria:', error);
        isLoading = false;
    }
}

// ============================================================
// CARGA DE ESTADÍSTICAS
// ============================================================
function cargarStats() {
    return fetch(`${API_BASE}/stats`)
        .then(res => manejarError(res))
        .then(stats => {
            renderStats(stats);
        })
        .catch(error => {
            console.error('❌ Error cargando estadísticas:', error);
            // Renderizar stats con datos locales si falla
            renderStats(null);
        });
}

// ============================================================
// CARGA DE DETALLE POR ID
// ============================================================
function cargarDetalle(id) {
    return fetch(`${API_BASE}/${id}`)
        .then(res => manejarError(res))
        .then(data => data)
        .catch(error => {
            console.error('❌ Error cargando detalle:', error);
            return null;
        });
}

// ============================================================
// RENDERIZADO DE TARJETAS DE RESUMEN
// ============================================================
function renderStats(stats) {
    const container = document.getElementById('statsAuditoria');
    if (!container) return;
    
    let totalRegistros = registros.length;
    let modulosActivos = 0;
    let usuariosActivos = 0;
    let ultimaActualizacion = new Date().toLocaleString('es-PE');
    
    if (stats) {
        totalRegistros = stats.totalRegistros || registros.length;
        modulosActivos = stats.modulosActivos || 0;
        usuariosActivos = stats.usuariosActivos || 0;
        ultimaActualizacion = stats.ultimaActualizacion || ultimaActualizacion;
    } else {
        // Calcular desde los datos locales
        const modulos = new Set(registros.map(r => r.modulo));
        modulosActivos = modulos.size;
        const usuarios = new Set(registros.map(r => r.usuario));
        usuariosActivos = usuarios.size;
    }
    
    container.innerHTML = `
        <div class="card azul">
            <div class="card-number">${totalRegistros}</div>
            <div class="card-label">Total registros</div>
        </div>
        <div class="card verde">
            <div class="card-number">${modulosActivos}</div>
            <div class="card-label">Módulos activos</div>
        </div>
        <div class="card amarillo">
            <div class="card-number">${usuariosActivos}</div>
            <div class="card-label">Usuarios activos</div>
        </div>
        <div class="card" style="border-left-color:#6b7280;">
            <div class="card-number" style="font-size:16px; margin:6px 0 8px;">${ultimaActualizacion}</div>
            <div class="card-label">Última actualización</div>
        </div>
    `;
}

// ============================================================
// RENDERIZADO DE TABLA
// ============================================================
function renderTabla() {
    const tbody = document.getElementById('tablaAuditoria');
    if (!tbody) return;

    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = Math.min(inicio + ITEMS_POR_PAGINA, registrosFiltrados.length);
    const datosPagina = registrosFiltrados.slice(inicio, fin);

    if (datosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:3rem;color:var(--muted);">
                    <div style="font-size:3rem;margin-bottom:0.5rem;">📋</div>
                    No hay registros que coincidan con los filtros
                </td>
            </tr>
        `;
        document.getElementById('registroCount').textContent = 'Total: 0';
        actualizarPaginacion();
        return;
    }

    tbody.innerHTML = datosPagina.map(r => {
        const badgeClase = getBadgeClase(r.accion);
        return `
            <tr>
                <td style="white-space:nowrap;">${formatearFecha(r.fecha)}</td>
                <td><strong>${r.usuario}</strong></td>
                <td><span class="badge-modulo">${r.modulo}</span></td>
                <td><span class="badge-accion ${badgeClase}">${r.accion}</span></td>
                <td>
                    <button class="btn-icon btn-ver" data-id="${r.id}" title="Ver detalle">👁️</button>
                    <button class="btn-icon btn-exportar-registro" data-id="${r.id}" title="Exportar este registro">📤</button>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('registroCount').textContent = `Total: ${registrosFiltrados.length}`;
    actualizarPaginacion();
    asignarEventosTabla();
}

// ============================================================
// ASIGNAR EVENTOS A LA TABLA
// ============================================================
function asignarEventosTabla() {
    const tbody = document.getElementById('tablaAuditoria');
    if (!tbody) return;
    
    tbody.querySelectorAll('.btn-ver').forEach(btn => {
        btn.removeEventListener('click', handleVerClick);
        btn.addEventListener('click', handleVerClick);
    });
    
    tbody.querySelectorAll('.btn-exportar-registro').forEach(btn => {
        btn.removeEventListener('click', handleExportarRegistroClick);
        btn.addEventListener('click', handleExportarRegistroClick);
    });
}

function handleVerClick(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    if (!isNaN(id)) verDetalle(id);
}

function handleExportarRegistroClick(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    if (!isNaN(id)) exportarRegistroIndividual(id);
}

// ============================================================
// FILTROS
// ============================================================
function llenarFiltros() {
    const selectModulo = document.getElementById('filtroModulo');
    if (!selectModulo) return;
    
    const modulos = [...new Set(registros.map(r => r.modulo).filter(Boolean))].sort();
    selectModulo.innerHTML = '<option value="">Todos los módulos</option>';
    modulos.forEach(m => {
        selectModulo.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

function filtrarRegistros() {
    const usuario = document.getElementById('filtroUsuario')?.value?.toLowerCase()?.trim() || '';
    const modulo = document.getElementById('filtroModulo')?.value || '';
    const fechaDesde = document.getElementById('filtroFechaDesde')?.value || '';
    const fechaHasta = document.getElementById('filtroFechaHasta')?.value || '';

    registrosFiltrados = registros.filter(r => {
        const matchUsuario = usuario === '' || r.usuario.toLowerCase().includes(usuario);
        const matchModulo = modulo === '' || r.modulo === modulo;
        let matchFecha = true;
        const fechaRegistro = r.fecha ? r.fecha.split(' ')[0] : '';
        if (fechaDesde && fechaHasta) {
            matchFecha = fechaRegistro >= fechaDesde && fechaRegistro <= fechaHasta;
        } else if (fechaDesde) {
            matchFecha = fechaRegistro >= fechaDesde;
        } else if (fechaHasta) {
            matchFecha = fechaRegistro <= fechaHasta;
        }
        return matchUsuario && matchModulo && matchFecha;
    });

    paginaActual = 1;
    renderTabla();
}

function limpiarFiltros() {
    document.getElementById('filtroUsuario').value = '';
    document.getElementById('filtroModulo').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    registrosFiltrados = [...registros];
    paginaActual = 1;
    renderTabla();
}

// ============================================================
// ACCIONES: VER DETALLE (MODAL MEJORADO)
// ============================================================
function verDetalle(id) {
    // Buscar en datos locales primero
    let registro = registros.find(r => r.id === id);
    
    if (!registro) {
        alert('Registro no encontrado.');
        return;
    }

    const body = document.getElementById('detalleBody');
    if (!body) return;

    body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; padding:4px 0;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:100px;">Fecha</span>
                <span style="color:#1f2937;">${formatearFecha(registro.fecha)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:100px;">Usuario</span>
                <span style="color:#1f2937;">${registro.usuario}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:100px;">Módulo</span>
                <span style="color:#1f2937;">${registro.modulo}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:100px;">Acción</span>
                <span style="color:#1f2937;"><span class="badge-accion ${getBadgeClase(registro.accion)}">${registro.accion}</span></span>
            </div>
            <div style="display:flex; justify-content:space-between; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:100px;">Detalle</span>
                <span style="color:#1f2937;">${registro.detalle || 'Sin detalles'}</span>
            </div>
        </div>
    `;

    document.getElementById('modalDetalleTitulo').textContent = `📄 Detalle del registro #${registro.id}`;
    const modal = document.getElementById('modalDetalle');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
    }
}

// ============================================================
// EXPORTAR REGISTRO INDIVIDUAL
// ============================================================
function exportarRegistroIndividual(id) {
    const registro = registros.find(r => r.id === id);
    if (!registro) {
        alert('Registro no encontrado.');
        return;
    }
    const headers = ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Detalle'];
    const row = [
        registro.fecha || '',
        registro.usuario || '',
        registro.modulo || '',
        registro.accion || '',
        registro.detalle || ''
    ];
    descargarCSV([row], headers, `registro_${id}_${new Date().toISOString().split('T')[0]}.csv`);
    alert(`📤 Registro #${id} exportado a CSV.`);
}

// ============================================================
// EXPORTAR LISTADO COMPLETO (CSV)
// ============================================================
function exportarListado() {
    const datos = registrosFiltrados.length > 0 ? registrosFiltrados : registros;
    if (datos.length === 0) {
        alert('No hay registros para exportar.');
        return;
    }
    const headers = ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Detalle'];
    const rows = datos.map(r => [
        r.fecha || '',
        r.usuario || '',
        r.modulo || '',
        r.accion || '',
        r.detalle || ''
    ]);
    descargarCSV(rows, headers, `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    alert(`📤 Listado exportado a CSV (${datos.length} registros).`);
}

function descargarCSV(rows, headers, filename) {
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
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================================
// EXPORTAR PDF (opcional - se puede implementar igual que las otras)
// ============================================================
function exportarPDF() {
    alert('📄 La exportación a PDF estará disponible próximamente.');
}

// ============================================================
// PAGINACIÓN
// ============================================================
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(registrosFiltrados.length / ITEMS_POR_PAGINA) || 1;
    document.getElementById('paginaInfo').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btnAnterior').disabled = (paginaActual === 1);
    document.getElementById('btnSiguiente').disabled = (paginaActual === totalPaginas);
}

function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(registrosFiltrados.length / ITEMS_POR_PAGINA) || 1;
    const nuevaPagina = paginaActual + direccion;
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderTabla();
    }
}

// ============================================================
// UTILIDADES
// ============================================================
function formatearFecha(fechaStr) {
    if (!fechaStr) return 'N/A';
    try {
        // Si la fecha ya está formateada (DD/MM/YYYY HH:MM)
        if (fechaStr.includes('/')) return fechaStr;
        
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return fechaStr;
        return fecha.toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return fechaStr;
    }
}

function getBadgeClase(accion) {
    if (!accion) return 'resolucion';
    const accionLower = accion.toLowerCase();
    if (accionLower.includes('creó') || accionLower.includes('registró') || accionLower.includes('crear')) return 'creacion';
    if (accionLower.includes('editó') || accionLower.includes('actualizó') || accionLower.includes('editar') || accionLower.includes('actualizar')) return 'edicion';
    if (accionLower.includes('eliminó') || accionLower.includes('eliminar')) return 'eliminacion';
    if (accionLower.includes('aprobó') || accionLower.includes('aprobar')) return 'aprobacion';
    if (accionLower.includes('observó') || accionLower.includes('observar')) return 'observacion';
    if (accionLower.includes('rechazó') || accionLower.includes('rechazar')) return 'rechazo';
    return 'resolucion';
}

function mostrarError(mensaje) {
    const tbody = document.getElementById('tablaAuditoria');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:3rem;color:#991b1b;">
                    <div style="font-size:3rem;margin-bottom:0.5rem;">❌</div>
                    ${mensaje}
                </td>
            </tr>
        `;
    }
}

function refrescar() {
    registrosFiltrados = [...registros];
    paginaActual = 1;
    cargarStats();
    renderTabla();
    alert('🔄 Datos actualizados.');
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Módulo de Auditoría iniciando...');

    // Event Listeners
    document.getElementById('btnFiltrar')?.addEventListener('click', filtrarRegistros);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);
    document.getElementById('filtroUsuario')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') filtrarRegistros();
    });
    document.getElementById('btnExportarListado')?.addEventListener('click', exportarListado);
    document.getElementById('btnRefrescar')?.addEventListener('click', refrescar);
    document.getElementById('btnAnterior')?.addEventListener('click', function() { cambiarPagina(-1); });
    document.getElementById('btnSiguiente')?.addEventListener('click', function() { cambiarPagina(1); });

    // Cerrar modal detalle
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
    document.getElementById('btnCancelarCerrarSesion1')?.addEventListener('click', cancelarCerrarSesion);
    document.getElementById('btnCancelarCerrarSesion2')?.addEventListener('click', cancelarCerrarSesion);
    document.getElementById('btnConfirmarCerrarSesion')?.addEventListener('click', confirmarCerrarSesion);
    document.getElementById('logout-confirm-overlay')?.addEventListener('click', function(e) {
        if (e.target === this) cancelarCerrarSesion();
    });

    // Cargar datos
    cargarAuditoria();

    console.log('✅ Módulo de Auditoría inicializado correctamente');
});
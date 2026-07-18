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
        const busqueda = document.getElementById('buscarEvidencia')?.value || '';
        const modulo = document.getElementById('filtroModulo')?.value || '';
        const responsable = document.getElementById('filtroResponsable')?.value || '';
        const estado = document.getElementById('filtroEstado')?.value || '';
        
        let url = `${API_BASE}?`;
        const params = [];
        if (busqueda) params.push(`busqueda=${encodeURIComponent(busqueda)}`);
        if (modulo) params.push(`modulo=${encodeURIComponent(modulo)}`);
        if (responsable) params.push(`responsable=${encodeURIComponent(responsable)}`);
        if (estado) params.push(`estado=${encodeURIComponent(estado)}`);
        url += params.join('&');
        
        if (params.length === 0) url = API_BASE;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        
        evidencias = await response.json();
        evidenciasFiltradas = [...evidencias];
        
        await cargarStats();
        llenarFiltrosDinamicos();
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
    const pendiente = total - activa - inactiva;
    
    container.innerHTML = `
        <div class="card azul">
            <div class="card-number">${total}</div>
            <div class="card-label">Total Evidencias</div>
        </div>
        <div class="card verde">
            <div class="card-number">${activa}</div>
            <div class="card-label">Activas</div>
        </div>
        <div class="card amarillo">
            <div class="card-number">${pendiente}</div>
            <div class="card-label">Pendientes</div>
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
        let badgeClase = 'secondary';
        let estadoMostrar = e.estado || 'N/A';
        
        if (e.estado === 'ACTIVA') {
            badgeClase = 'success';
            estadoMostrar = 'Activa';
        } else if (e.estado === 'INACTIVA') {
            badgeClase = 'danger';
            estadoMostrar = 'Inactiva';
        } else if (e.estado === 'PENDIENTE') {
            badgeClase = 'warning';
            estadoMostrar = 'Pendiente';
        }
        
        return `
            <tr>
                <td><strong>${e.sistema || 'Sin sistema'}</strong></td>
                <td>${e.modulo || '—'}</td>
                <td>${e.responsable || '—'}</td>
                <td><span class="badge badge-info">${e.tipo || 'N/A'}</span></td>
                <td><span class="badge badge-${badgeClase}">${estadoMostrar}</span></td>
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

// ============================================================
// DESCARGA INDIVIDUAL CON HTML2PDF
// ============================================================

// ============================================================
// DESCARGA INDIVIDUAL EN FORMATO .TXT
// ============================================================

function descargarEvidencia(archivo) {
    if (!archivo || archivo === 'Sin archivo' || archivo === '—') {
        alert('⚠️ No hay archivo asociado para descargar.');
        return;
    }

    if (archivo.startsWith('http://') || archivo.startsWith('https://')) {
        window.open(archivo, '_blank');
        return;
    }

    try {
        const ev = evidencias.find(e => e.archivo === archivo);
        if (!ev) {
            alert('❌ No se encontró la evidencia.');
            return;
        }

        // Generar el contenido en formato .txt
        const contenidoTXT = generarTXTIndividual(ev);
        
        // Crear y descargar el archivo .txt
        const blob = new Blob([contenidoTXT], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const nombreArchivo = `${ev.sistema || 'evidencia'}_${new Date().toISOString().split('T')[0]}.txt`;
        link.download = nombreArchivo;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`✅ Evidencia descargada correctamente como:\n📄 ${nombreArchivo}`);

    } catch (error) {
        console.error('❌ Error al descargar:', error);
        alert('❌ Error al descargar la evidencia: ' + error.message);
    }
}

function generarTXTIndividual(ev) {
    const fecha = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const linea = '='.repeat(52);
    const lineaSep = '-'.repeat(52);

    let estadoTexto = 'Activa';
    if (ev.estado === 'INACTIVA') estadoTexto = 'Inactiva';
    else if (ev.estado === 'PENDIENTE') estadoTexto = 'Pendiente';

    return `
${linea}
        REPORTE DE EVIDENCIA - DIAGTI
${linea}

Detalle de evidencia técnica
Generado: ${fecha}

${lineaSep}
SISTEMA:          ${ev.sistema || 'No especificado'}
MÓDULO / ÁREA:    ${ev.modulo || 'No especificado'}
RESPONSABLE:      ${ev.responsable || 'No especificado'}
TIPO:             ${ev.tipo || 'No especificado'}
ESTADO:           ${estadoTexto}
FECHA DE CARGA:   ${ev.fecha || 'No especificado'}
ARCHIVO:          ${ev.archivo || 'No especificado'}
${lineaSep}

DESCRIPCIÓN:
${ev.descripcion || 'Sin descripción registrada.'}

${lineaSep}
Firmado por: DIAGTI
${linea}
`;
}

function generarHTMLIndividual(ev, archivo) {
    const fecha = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let estadoClase = 'success';
    let estadoTexto = 'Activa';
    if (ev.estado === 'INACTIVA') {
        estadoClase = 'danger';
        estadoTexto = 'Inactiva';
    } else if (ev.estado === 'PENDIENTE') {
        estadoClase = 'warning';
        estadoTexto = 'Pendiente';
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Evidencia - DIAGTI</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', Arial, sans-serif; }
            body { padding: 30px; background: white; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #0f75bc; margin-bottom: 20px; }
            .header h1 { font-size: 22px; color: #0f75bc; }
            .header p { color: #666; font-size: 14px; margin-top: 5px; }
            .header .fecha { color: #888; font-size: 12px; margin-top: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 30px; margin: 20px 0; }
            .info-item { display: flex; border-bottom: 1px solid #e5e7eb; padding: 8px 0; }
            .info-item .label { font-weight: 600; color: #374151; width: 130px; flex-shrink: 0; }
            .info-item .value { color: #1f2937; }
            .badge { padding: 2px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
            .badge-success { background: #dcfce7; color: #166534; }
            .badge-warning { background: #fef9c3; color: #854d0e; }
            .badge-danger { background: #fee2e2; color: #991b1b; }
            .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #ddd; color: #999; font-size: 11px; }
            .footer span { color: #0f75bc; font-weight: 600; }
            .desc-box { background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 10px; border-left: 3px solid #0f75bc; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📎 Reporte de Evidencia - DIAGTI</h1>
            <p>Detalle de evidencia técnica</p>
            <div class="fecha">Generado: ${fecha}</div>
        </div>

        <div class="info-grid">
            <div class="info-item"><span class="label">Sistema</span><span class="value">${ev.sistema || 'Desconocido'}</span></div>
            <div class="info-item"><span class="label">Módulo / Área</span><span class="value">${ev.modulo || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Responsable</span><span class="value">${ev.responsable || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Tipo</span><span class="value">${ev.tipo || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Estado</span><span class="value"><span class="badge badge-${estadoClase}">${estadoTexto}</span></span></div>
            <div class="info-item"><span class="label">Fecha de carga</span><span class="value">${ev.fecha || 'N/A'}</span></div>
            <div class="info-item" style="grid-column: span 2;"><span class="label">Archivo original</span><span class="value">${archivo}</span></div>
        </div>

        <div style="margin-top: 15px;">
            <strong style="display: block; margin-bottom: 5px;">📝 Descripción</strong>
            <div class="desc-box">${ev.descripcion || 'Sin descripción registrada.'}</div>
        </div>

        <div class="footer">
            DIAGTI v2.0 · <span>CTIC UNAS</span> · ${new Date().getFullYear()}
        </div>
    </body>
    </html>
    `;
}

function descargarPDFSimple(ev, archivo) {
    const contenido = `📎 EVIDENCIA - DIAGTI\n\n` +
        `Sistema: ${ev?.sistema || 'Desconocido'}\n` +
        `Módulo/Área: ${ev?.modulo || 'N/A'}\n` +
        `Responsable: ${ev?.responsable || 'N/A'}\n` +
        `Tipo: ${ev?.tipo || 'N/A'}\n` +
        `Estado: ${ev?.estado || 'N/A'}\n` +
        `Fecha: ${ev?.fecha || 'N/A'}\n` +
        `Archivo: ${archivo}\n` +
        `Descripción: ${ev?.descripcion || 'Sin descripción'}\n\n` +
        `---\nDIAGTI v2.0 · CTIC UNAS`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${archivo.split('.')[0] || 'evidencia'}.txt`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert(`✅ Archivo descargado como TXT.`);
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

function exportarPDF() {
    try {
        const datos = evidenciasFiltradas.length > 0 ? evidenciasFiltradas : evidencias;
        if (datos.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        if (typeof html2pdf === 'undefined') {
            alert('❌ La librería html2pdf no está cargada. Verifica que el script esté incluido en el HTML.');
            return;
        }

        const contenido = generarHTMLReportePDF(datos);
        
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `evidencias_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        const loading = document.createElement('div');
        loading.id = 'pdfLoading';
        loading.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 9999;
            text-align: center;
            font-size: 18px;
            font-family: 'Inter', Arial, sans-serif;
        `;
        loading.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
            <strong>Generando PDF...</strong>
            <br>
            <small style="color: #6b7280; font-size: 14px;">Por favor espera</small>
            <div style="margin-top: 15px; width: 200px; height: 4px; background: #e5e7eb; border-radius: 2px; margin-left: auto; margin-right: auto; overflow: hidden;">
                <div style="width: 40%; height: 100%; background: #1abb9c; border-radius: 2px; animation: loadingBar 1s ease-in-out infinite;"></div>
            </div>
        `;
        document.body.appendChild(loading);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes loadingBar {
                0% { width: 10%; margin-left: 0; }
                50% { width: 70%; margin-left: 30%; }
                100% { width: 10%; margin-left: 90%; }
            }
        `;
        document.head.appendChild(style);

        html2pdf()
            .set(opt)
            .from(contenido)
            .save()
            .then(() => {
                const el = document.getElementById('pdfLoading');
                if (el) el.remove();
                alert(`✅ PDF exportado correctamente\n📄 ${datos.length} registros`);
            })
            .catch((error) => {
                const el = document.getElementById('pdfLoading');
                if (el) el.remove();
                console.error('Error al generar PDF:', error);
                alert('❌ Error al generar el PDF. Verifica la consola para más detalles.');
            });

    } catch (error) {
        console.error('❌ Error al exportar PDF:', error);
        alert('❌ Error al exportar PDF: ' + error.message);
    }
}

function generarHTMLReportePDF(datos) {
    const fecha = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const total = datos.length;
    const activas = datos.filter(e => e.estado === 'ACTIVA').length;
    const pendientes = datos.filter(e => e.estado === 'PENDIENTE').length;
    const inactivas = datos.filter(e => e.estado === 'INACTIVA').length;

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Evidencias - DIAGTI</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', Arial, sans-serif; }
            body { padding: 20px; background: white; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #0f75bc; margin-bottom: 20px; }
            .header h1 { font-size: 22px; color: #0f75bc; }
            .header p { color: #666; font-size: 14px; margin-top: 5px; }
            .header .fecha { color: #888; font-size: 12px; margin-top: 5px; }
            
            .stats { display: flex; justify-content: space-around; background: #f5f6fa; padding: 12px; border-radius: 8px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
            .stats span { font-size: 13px; font-weight: 500; }
            .stats .num { font-weight: 700; color: #0f75bc; }
            .stats .num.green { color: #1abb9c; }
            .stats .num.yellow { color: #f59e0b; }
            .stats .num.red { color: #ef4444; }
            
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px; }
            th { background: #0f75bc; color: white; padding: 8px 6px; text-align: left; }
            td { padding: 6px; border-bottom: 1px solid #e0e0e0; }
            tr:nth-child(even) { background: #f8f9fa; }
            .badge { padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; display: inline-block; }
            .badge-success { background: #dcfce7; color: #166534; }
            .badge-warning { background: #fef9c3; color: #854d0e; }
            .badge-danger { background: #fee2e2; color: #991b1b; }
            
            .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #ddd; color: #999; font-size: 11px; }
            .footer span { color: #0f75bc; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📎 Reporte de Evidencias - DIAGTI</h1>
            <p>Administración de evidencias técnicas del sistema</p>
            <div class="fecha">Generado: ${fecha}</div>
        </div>
        
        <div class="stats">
            <span>📊 Total: <span class="num">${total}</span></span>
            <span>✅ Activas: <span class="num green">${activas}</span></span>
            <span>⏳ Pendientes: <span class="num yellow">${pendientes}</span></span>
            <span>❌ Inactivas: <span class="num red">${inactivas}</span></span>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Sistema</th>
                    <th>Módulo / Área</th>
                    <th>Responsable</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Archivo</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    datos.forEach(e => {
        let badgeClase = 'badge-success';
        let estadoTexto = 'Activa';
        if (e.estado === 'INACTIVA') {
            badgeClase = 'badge-danger';
            estadoTexto = 'Inactiva';
        } else if (e.estado === 'PENDIENTE') {
            badgeClase = 'badge-warning';
            estadoTexto = 'Pendiente';
        }
        
        html += `
            <tr>
                <td><strong>${e.sistema || ''}</strong></td>
                <td>${e.modulo || '—'}</td>
                <td>${e.responsable || '—'}</td>
                <td>${e.tipo || 'N/A'}</td>
                <td><span class="badge ${badgeClase}">${estadoTexto}</span></td>
                <td>${e.fecha || ''}</td>
                <td>${e.archivo || ''}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        
        <div class="footer">
            DIAGTI v2.0 · <span>CTIC UNAS</span> · ${new Date().getFullYear()}
        </div>
    </body>
    </html>
    `;
    
    return html;
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

    document.getElementById('btnFiltrar')?.addEventListener('click', filtrarEvidencias);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);
    document.getElementById('buscarEvidencia')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') filtrarEvidencias();
    });
    document.getElementById('btnExportarCSV')?.addEventListener('click', exportarCSV);
    document.getElementById('btnExportarPDF')?.addEventListener('click', exportarPDF);
    document.getElementById('btnRefrescar')?.addEventListener('click', function() {
        cargarEvidencias();
    });
    document.getElementById('btnAnterior')?.addEventListener('click', function() { cambiarPagina(-1); });
    document.getElementById('btnSiguiente')?.addEventListener('click', function() { cambiarPagina(1); });

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

    document.getElementById('btnCerrarDetalle')?.addEventListener('click', function() {
        document.getElementById('modalDetalle').style.display = 'none';
    });
    document.getElementById('btnCerrarDetalleFooter')?.addEventListener('click', function() {
        document.getElementById('modalDetalle').style.display = 'none';
    });
    document.getElementById('modalDetalle')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });

    document.getElementById('btnCerrarSesion')?.addEventListener('click', cerrarSesion);
    document.getElementById('btnCancelarCerrarSesion')?.addEventListener('click', cancelarCerrarSesion);
    document.getElementById('btnCancelarCerrarSesion2')?.addEventListener('click', cancelarCerrarSesion);
    document.getElementById('btnConfirmarCerrarSesion')?.addEventListener('click', confirmarCerrarSesion);
    document.getElementById('logout-confirm-overlay')?.addEventListener('click', function(e) {
        if (e.target === this) cancelarCerrarSesion();
    });

    cargarEvidencias();

    console.log('✅ Módulo de Evidencias inicializado correctamente');
});
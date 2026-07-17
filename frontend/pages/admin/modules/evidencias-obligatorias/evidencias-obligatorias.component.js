// ============================================================
// MÓDULO DE ADMINISTRACIÓN DE EVIDENCIAS - SOLO CONSULTA
// ============================================================

// ============================================================
// CONFIGURACIÓN INICIAL
// ============================================================
const STORAGE_KEY = 'evidencias_diagti';

// ============================================================
// DATOS MOCK - EVIDENCIAS (CON ESTADOS REALES)
// ============================================================
let evidencias = [];
let evidenciasFiltradas = [];
let paginaActual = 1;
const ITEMS_POR_PAGINA = 5;
let delegacionAsignada = false;

// ============================================================
// CARGA Y PERSISTENCIA - CON LIMPIEZA DE DATOS CORRUPTOS
// ============================================================
function cargarDatos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let cargarMock = false;
        
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.length > 0) {
                    const primera = parsed[0];
                    if (!primera.modulo || !primera.responsable) {
                        console.warn('⚠️ Datos corruptos detectados. Limpiando...');
                        localStorage.removeItem(STORAGE_KEY);
                        cargarMock = true;
                    } else {
                        evidencias = parsed;
                        console.log(`📎 ${evidencias.length} evidencias cargadas desde localStorage`);
                    }
                } else {
                    cargarMock = true;
                }
            } catch (e) {
                console.warn('⚠️ Error al parsear datos. Limpiando...');
                localStorage.removeItem(STORAGE_KEY);
                cargarMock = true;
            }
        } else {
            cargarMock = true;
        }

        if (cargarMock) {
            evidencias = [
                {
                    id: 1,
                    sistema: 'Sistema Académico',
                    modulo: 'Registro Académico',
                    responsable: 'Juan Pérez',
                    tipo: 'PDF',
                    estado: 'Validado',
                    fecha: '2026-07-10',
                    archivo: 'manual_tecnico.pdf',
                    descripcion: 'Manual técnico del sistema académico',
                    historial: [
                        { fecha: '2026-07-10 10:30', accion: 'Creación', detalle: 'Registro inicial' },
                        { fecha: '2026-07-12 14:20', accion: 'Validación', detalle: 'Aprobado por el validador' }
                    ]
                },
                {
                    id: 2,
                    sistema: 'Sistema Financiero',
                    modulo: 'Finanzas',
                    responsable: 'María Gómez',
                    tipo: 'URL',
                    estado: 'Pendiente',
                    fecha: '2026-07-09',
                    archivo: 'https://docs.google.com/...',
                    descripcion: 'Enlace a documentación financiera',
                    historial: [
                        { fecha: '2026-07-09 09:15', accion: 'Creación', detalle: 'Registro inicial' }
                    ]
                },
                {
                    id: 3,
                    sistema: 'Portal Web',
                    modulo: 'Comunicaciones',
                    responsable: 'Carlos Ruiz',
                    tipo: 'DOCX',
                    estado: 'Observado',
                    fecha: '2026-07-08',
                    archivo: 'contrato_servicio.docx',
                    descripcion: 'Contrato de servicio del portal',
                    historial: [
                        { fecha: '2026-07-08 11:00', accion: 'Creación', detalle: 'Registro inicial' },
                        { fecha: '2026-07-09 16:45', accion: 'Observación', detalle: 'Falta la firma del responsable' }
                    ]
                },
                {
                    id: 4,
                    sistema: 'Sistema Legacy',
                    modulo: 'Infraestructura',
                    responsable: 'Ana Torres',
                    tipo: 'Imagen',
                    estado: 'Borrador',
                    fecha: '2026-07-07',
                    archivo: 'captura_pantalla.png',
                    descripcion: 'Captura de pantalla del sistema legacy',
                    historial: [
                        { fecha: '2026-07-07 08:30', accion: 'Creación', detalle: 'Registro inicial' }
                    ]
                },
                {
                    id: 5,
                    sistema: 'CRM',
                    modulo: 'Ventas',
                    responsable: 'Laura García',
                    tipo: 'PDF',
                    estado: 'Validado',
                    fecha: '2026-07-06',
                    archivo: 'manual_crm.pdf',
                    descripcion: 'Manual de usuario del CRM',
                    historial: [
                        { fecha: '2026-07-06 13:10', accion: 'Creación', detalle: 'Registro inicial' },
                        { fecha: '2026-07-07 09:00', accion: 'Validación', detalle: 'Aprobado por el validador' }
                    ]
                },
                {
                    id: 6,
                    sistema: 'ERP',
                    modulo: 'Administración',
                    responsable: 'Roberto Díaz',
                    tipo: 'DOC',
                    estado: 'Pendiente',
                    fecha: '2026-07-05',
                    archivo: 'politica_seguridad.doc',
                    descripcion: 'Política de seguridad del ERP',
                    historial: [
                        { fecha: '2026-07-05 15:20', accion: 'Creación', detalle: 'Registro inicial' }
                    ]
                },
                {
                    id: 7,
                    sistema: 'Sistema de Recursos Humanos',
                    modulo: 'Administración',
                    responsable: 'Patricia López',
                    tipo: 'URL',
                    estado: 'Observado',
                    fecha: '2026-07-04',
                    archivo: 'https://repositorio.ctic/...',
                    descripcion: 'Enlace al repositorio de código',
                    historial: [
                        { fecha: '2026-07-04 10:00', accion: 'Creación', detalle: 'Registro inicial' },
                        { fecha: '2026-07-06 11:30', accion: 'Observación', detalle: 'El enlace no es accesible' }
                    ]
                },
                {
                    id: 8,
                    sistema: 'Sistema de Inventario',
                    modulo: 'Logística',
                    responsable: 'Luis Martínez',
                    tipo: 'PDF',
                    estado: 'Validado',
                    fecha: '2026-07-03',
                    archivo: 'manual_inventario.pdf',
                    descripcion: 'Manual del sistema de inventario',
                    historial: [
                        { fecha: '2026-07-03 09:45', accion: 'Creación', detalle: 'Registro inicial' },
                        { fecha: '2026-07-04 14:00', accion: 'Validación', detalle: 'Aprobado por el validador' }
                    ]
                }
            ];
            guardarDatos();
            console.log('📦 Datos mock inicializados correctamente');
        }
        
        evidenciasFiltradas = [...evidencias];
        console.log('📊 Módulos disponibles:', [...new Set(evidencias.map(e => e.modulo))]);
        console.log('👤 Responsables disponibles:', [...new Set(evidencias.map(e => e.responsable))]);
        console.log('📎 Total evidencias:', evidencias.length);
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        evidencias = [];
        evidenciasFiltradas = [];
    }
}

function guardarDatos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(evidencias));
        console.log('💾 Datos guardados en localStorage');
    } catch (error) {
        console.error('❌ Error al guardar datos:', error);
    }
}

// ============================================================
// FUNCIONES DE RENDERIZADO
// ============================================================

function badgeEstado(estado) {
    const map = {
        'Borrador': 'secondary',
        'Pendiente': 'warning',
        'Observado': 'danger',
        'Validado': 'success'
    };
    return map[estado] || 'secondary';
}

function renderStats() {
    try {
        const total = evidencias.length;
        const borrador = evidencias.filter(e => e.estado === 'Borrador').length;
        const pendiente = evidencias.filter(e => e.estado === 'Pendiente').length;
        const observado = evidencias.filter(e => e.estado === 'Observado').length;
        const validado = evidencias.filter(e => e.estado === 'Validado').length;

        const container = document.getElementById('statsEvidencias');
        if (!container) return;
        container.innerHTML = `
            <div class="card azul">
                <div class="card-number">${total}</div>
                <div class="card-label">Total Evidencias</div>
            </div>
            <div class="card">
                <div class="card-number">${borrador}</div>
                <div class="card-label">Borrador</div>
            </div>
            <div class="card amarillo">
                <div class="card-number">${pendiente}</div>
                <div class="card-label">Pendiente</div>
            </div>
            <div class="card rojo">
                <div class="card-number">${observado}</div>
                <div class="card-label">Observado</div>
            </div>
            <div class="card verde">
                <div class="card-number">${validado}</div>
                <div class="card-label">Validado</div>
            </div>
        `;
    } catch (error) {
        console.error('❌ Error al renderizar estadísticas:', error);
    }
}

function renderTabla() {
    try {
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

        tbody.innerHTML = datosPagina.map(e => `
            <tr>
                <td><strong>${e.sistema || 'Sin sistema'}</strong></td>
                <td>${e.modulo || 'Sin módulo'}</td>
                <td>${e.responsable || 'Sin responsable'}</td>
                <td><span class="badge badge-info">${e.tipo || 'N/A'}</span></td>
                <td><span class="badge badge-${badgeEstado(e.estado)}">${e.estado || 'N/A'}</span></td>
                <td>${e.fecha || 'N/A'}</td>
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn-icon btn-ver" data-id="${e.id}" title="Ver detalle" style="margin:0 3px; padding:6px 8px; background:#f0f4f8; border-radius:6px; cursor:pointer;">👁️</button>
                    <button class="btn-icon btn-descargar" data-archivo="${e.archivo || ''}" title="Descargar" style="margin:0 3px; padding:6px 8px; background:#f0f4f8; border-radius:6px; cursor:pointer;">⬇️</button>
                    <button class="btn-icon btn-historial" data-id="${e.id}" title="Ver historial" style="margin:0 3px; padding:6px 8px; background:#f0f4f8; border-radius:6px; cursor:pointer;">📜</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('evidenciaCount').textContent = `Total: ${evidenciasFiltradas.length}`;
        actualizarPaginacion();
        asignarDelegacionEventos();

    } catch (error) {
        console.error('❌ Error al renderizar tabla:', error);
    }
}

// ============================================================
// DELEGACIÓN DE EVENTOS
// ============================================================

function asignarDelegacionEventos() {
    const tbody = document.getElementById('tablaEvidencias');
    if (!tbody || delegacionAsignada) return;

    tbody.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('btn-ver')) {
            const id = parseInt(btn.dataset.id);
            if (!isNaN(id)) verDetalle(id);
        } else if (btn.classList.contains('btn-descargar')) {
            const archivo = btn.dataset.archivo;
            if (archivo) descargarEvidencia(archivo);
        } else if (btn.classList.contains('btn-historial')) {
            const id = parseInt(btn.dataset.id);
            if (!isNaN(id)) verHistorial(id);
        }
    });

    delegacionAsignada = true;
    console.log('✅ Delegación de eventos configurada');
}

// ============================================================
// PAGINACIÓN
// ============================================================

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

function llenarFiltros() {
    const modulos = [...new Set(evidencias.map(e => e.modulo).filter(Boolean))].sort();
    const selectModulo = document.getElementById('filtroModulo');
    if (selectModulo) {
        selectModulo.innerHTML = '<option value="">Todos los módulos</option>';
        modulos.forEach(m => {
            selectModulo.innerHTML += `<option value="${m}">${m}</option>`;
        });
    }

    const responsables = [...new Set(evidencias.map(e => e.responsable).filter(Boolean))].sort();
    const selectResponsable = document.getElementById('filtroResponsable');
    if (selectResponsable) {
        selectResponsable.innerHTML = '<option value="">Todos los responsables</option>';
        responsables.forEach(r => {
            selectResponsable.innerHTML += `<option value="${r}">${r}</option>`;
        });
    }
}

function filtrarEvidencias() {
    try {
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
    } catch (error) {
        console.error('❌ Error al filtrar:', error);
    }
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
// ACCIONES ADMINISTRATIVAS
// ============================================================

function verDetalle(id) {
    const ev = evidencias.find(e => e.id === id);
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
                <span style="font-weight:600; color:#374151; width:120px;">Módulo / Área</span>
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
                <span style="color:#1f2937;"><span class="badge badge-${badgeEstado(ev.estado)}">${ev.estado || 'N/A'}</span></span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Fecha</span>
                <span style="color:#1f2937;">${ev.fecha || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Archivo</span>
                <span style="color:#1f2937;">${ev.archivo || 'N/A'}</span>
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

// ✅ FUNCIÓN DE DESCARGA MEJORADA - DESCARGA REAL
function descargarEvidencia(archivo) {
    console.log('⬇️ Descargando:', archivo);
    
    if (!archivo) {
        alert('⚠️ No hay archivo asociado para descargar.');
        return;
    }

    // Si es una URL, abrir en nueva pestaña
    if (archivo.startsWith('http://') || archivo.startsWith('https://')) {
        window.open(archivo, '_blank');
        return;
    }

    try {
        // Buscar la evidencia para obtener más contexto
        const ev = evidencias.find(e => e.archivo === archivo);
        
        // Crear contenido de ejemplo para el archivo
        const contenido = `📎 ARCHIVO DE EVIDENCIA - DIAGTI\n\n` +
                         `Nombre del archivo: ${archivo}\n` +
                         `Sistema: ${ev?.sistema || 'Desconocido'}\n` +
                         `Módulo: ${ev?.modulo || 'Desconocido'}\n` +
                         `Responsable: ${ev?.responsable || 'Desconocido'}\n` +
                         `Fecha: ${ev?.fecha || new Date().toISOString().split('T')[0]}\n` +
                         `Tipo: ${ev?.tipo || 'Documento'}\n` +
                         `Estado: ${ev?.estado || 'N/A'}\n` +
                         `\n${'='.repeat(50)}\n` +
                         `CONTENIDO DEL DOCUMENTO\n` +
                         `${'='.repeat(50)}\n\n` +
                         `(Este es un archivo de demostración generado automáticamente por DIAGTI.\n` +
                         `En un entorno de producción, este sería el contenido real del archivo: ${archivo})\n\n` +
                         `${ev?.descripcion || 'Sin descripción adicional.'}\n\n` +
                         `---\n` +
                         `DIAGTI v2.0 · CTIC UNAS · ${new Date().getFullYear()}`;

        // Crear Blob con el contenido
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Crear y disparar descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = archivo;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(`✅ Archivo "${archivo}" descargado correctamente.`);
        
    } catch (error) {
        console.error('❌ Error al descargar:', error);
        alert('❌ Error al descargar el archivo. Por favor, intenta de nuevo.');
    }
}

function verHistorial(id) {
    const ev = evidencias.find(e => e.id === id);
    if (!ev) {
        alert('Evidencia no encontrada.');
        return;
    }
    if (!ev.historial || ev.historial.length === 0) {
        alert('📜 Esta evidencia no tiene historial registrado.');
        return;
    }

    const body = document.getElementById('historialBody');
    if (!body) return;

    body.innerHTML = ev.historial.map(h => `
        <div class="historial-item" style="padding:10px 0; border-bottom:1px solid #e5e7eb;">
            <div style="font-weight:600; color:#1a5276; font-size:13px;">${h.fecha}</div>
            <div style="margin-top:4px; color:#1f2937;">${h.accion}</div>
            <div style="font-size:13px; color:#6b7280; margin-top:2px;">${h.detalle}</div>
        </div>
    `).join('');

    document.getElementById('modalHistorial').style.display = 'flex';
}

// ============================================================
// EXPORTACIONES (CSV y PDF)
// ============================================================

function exportarCSV() {
    try {
        const datos = evidenciasFiltradas.length > 0 ? evidenciasFiltradas : evidencias;
        if (datos.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        const headers = ['Sistema', 'Módulo/Área', 'Responsable', 'Tipo', 'Estado', 'Fecha', 'Archivo'];
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

        alert(`✅ CSV exportado correctamente\n📊 ${datos.length} registros`);
    } catch (error) {
        console.error('❌ Error al exportar CSV:', error);
        alert('❌ Error al exportar CSV');
    }
}

function exportarPDF() {
    try {
        const datos = evidenciasFiltradas.length > 0 ? evidenciasFiltradas : evidencias;
        if (datos.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        if (typeof html2pdf === 'undefined') {
            alert('❌ Librería html2pdf no encontrada. Asegúrate de incluir el script en el HTML.');
            return;
        }

        const contenido = generarHTMLReporte(datos);
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `evidencias_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        const loading = document.createElement('div');
        loading.id = 'pdfLoading';
        loading.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:9999;text-align:center;font-size:18px;';
        loading.innerHTML = '📄 Generando PDF...<br><small>Por favor espera</small>';
        document.body.appendChild(loading);

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
                alert('❌ Error al generar el PDF.');
            });
    } catch (error) {
        console.error('❌ Error al exportar PDF:', error);
        alert('❌ Error al exportar PDF');
    }
}

function generarHTMLReporte(datos) {
    const fecha = new Date().toLocaleString('es-ES');
    let html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: 'Inter', Arial, sans-serif; }
        body { padding:20px; background:white; }
        .header { text-align:center; padding-bottom:20px; border-bottom:3px solid #1a5276; margin-bottom:20px; }
        .header h1 { font-size:24px; color:#1a5276; }
        .header p { color:#666; font-size:14px; }
        .header .fecha { color:#888; font-size:12px; margin-top:5px; }
        table { width:100%; border-collapse:collapse; font-size:11px; margin-top:15px; }
        th { background:#1a5276; color:white; padding:8px 6px; text-align:left; }
        td { padding:6px; border-bottom:1px solid #e0e0e0; }
        tr:nth-child(even) { background:#f8f9fa; }
        .footer { text-align:center; margin-top:30px; padding-top:15px; border-top:2px solid #ddd; color:#999; font-size:11px; }
        .stats { display:flex; justify-content:space-around; background:#f5f6fa; padding:10px; border-radius:8px; margin-bottom:15px; }
        .stats span { font-size:13px; font-weight:500; }
        .stats .num { font-weight:700; color:#1a5276; }
    </style>
    </head>
    <body>
        <div class="header">
            <h1>📎 ADMINISTRACIÓN DE EVIDENCIAS - DIAGTI</h1>
            <p>Reporte consolidado de evidencias técnicas</p>
            <div class="fecha">Fecha: ${fecha}</div>
        </div>
        <div class="stats">
            <span>📊 Total: <span class="num">${datos.length}</span></span>
            <span>📝 Borrador: <span class="num">${datos.filter(e => e.estado === 'Borrador').length}</span></span>
            <span>⏳ Pendiente: <span class="num">${datos.filter(e => e.estado === 'Pendiente').length}</span></span>
            <span>👀 Observado: <span class="num">${datos.filter(e => e.estado === 'Observado').length}</span></span>
            <span>✅ Validado: <span class="num">${datos.filter(e => e.estado === 'Validado').length}</span></span>
        </div>
        <table>
            <thead>
                <tr><th>Sistema</th><th>Módulo</th><th>Responsable</th><th>Tipo</th><th>Estado</th><th>Fecha</th><th>Archivo</th></tr>
            </thead>
            <tbody>
    `;
    datos.forEach(e => {
        html += `
            <tr>
                <td>${e.sistema || ''}</td>
                <td>${e.modulo || ''}</td>
                <td>${e.responsable || ''}</td>
                <td>${e.tipo || ''}</td>
                <td>${e.estado || ''}</td>
                <td>${e.fecha || ''}</td>
                <td>${e.archivo || ''}</td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
        <div class="footer">DIAGTI v2.0 · CTIC UNAS · ${new Date().getFullYear()}</div>
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

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('📎 Módulo de Administración de Evidencias iniciando...');

        cargarDatos();
        llenarFiltros();
        renderStats();
        renderTabla();

        // Eventos
        document.getElementById('btnFiltrar')?.addEventListener('click', filtrarEvidencias);
        document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);
        document.getElementById('buscarEvidencia')?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') filtrarEvidencias();
        });

        document.getElementById('btnExportarCSV')?.addEventListener('click', exportarCSV);
        document.getElementById('btnExportarPDF')?.addEventListener('click', exportarPDF);

        document.getElementById('btnRefrescar')?.addEventListener('click', function() {
            evidenciasFiltradas = [...evidencias];
            paginaActual = 1;
            renderTabla();
            renderStats();
            alert('🔄 Datos actualizados');
        });

        document.getElementById('btnAnterior')?.addEventListener('click', function() { cambiarPagina(-1); });
        document.getElementById('btnSiguiente')?.addEventListener('click', function() { cambiarPagina(1); });

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

        document.getElementById('btnCerrarHistorial')?.addEventListener('click', function() {
            document.getElementById('modalHistorial').style.display = 'none';
        });
        document.getElementById('btnCerrarHistorialFooter')?.addEventListener('click', function() {
            document.getElementById('modalHistorial').style.display = 'none';
        });
        document.getElementById('modalHistorial')?.addEventListener('click', function(e) {
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

        console.log('✅ Módulo inicializado correctamente');
        console.log(`📎 ${evidencias.length} evidencias cargadas`);

    } catch (error) {
        console.error('❌ Error en la inicialización:', error);
        alert('⚠️ Error al cargar el módulo.');
    }
});
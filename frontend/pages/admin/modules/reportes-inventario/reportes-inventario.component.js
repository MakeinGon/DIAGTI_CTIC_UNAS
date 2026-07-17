// ============================================================
// CONFIGURACIÓN INICIAL
// ============================================================
const STORAGE_KEY = 'sistemas_diagti';

// ============================================================
// DATOS MOCK - SISTEMAS (CON EVIDENCIAS ASOCIADAS)
// ============================================================
let sistemas = [];
let sistemasFiltrados = [];
let paginaActual = 1;
const ITEMS_POR_PAGINA = 5;

// ============================================================
// CARGA Y PERSISTENCIA
// ============================================================
function cargarDatos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            sistemas = JSON.parse(stored);
            console.log(`📊 ${sistemas.length} sistemas cargados desde localStorage`);
        } else {
            sistemas = [
                {
                    id: 1, codigo: 'SYS-001', nombre: 'Sistema Académico', area: 'Registro',
                    responsable: 'Juan Pérez', estado: 'Validado', criticidad: 'Alta',
                    tipo: 'Web', fechaActualizacion: '2026-07-10',
                    tecnologias: ['PHP', 'MySQL', 'Laravel'], heredado: false,
                    evidencias: [
                        { nombre: 'manual_tecnico.pdf', tipo: 'PDF', fecha: '2026-07-10' },
                        { nombre: 'captura_interfaz.png', tipo: 'Imagen', fecha: '2026-07-09' }
                    ]
                },
                {
                    id: 2, codigo: 'SYS-002', nombre: 'Sistema Financiero', area: 'Finanzas',
                    responsable: 'María Gómez', estado: 'Pendiente', criticidad: 'Crítica / Misión Crítica',
                    tipo: 'Desktop', fechaActualizacion: '2026-07-09',
                    tecnologias: ['Java', 'PostgreSQL', 'Spring Boot'], heredado: false,
                    evidencias: [
                        { nombre: 'contrato_servicio.pdf', tipo: 'PDF', fecha: '2026-07-08' },
                        { nombre: 'diagrama_arquitectura.png', tipo: 'Imagen', fecha: '2026-07-07' }
                    ]
                },
                {
                    id: 3, codigo: 'SYS-003', nombre: 'Portal Web', area: 'Comunicaciones',
                    responsable: 'Carlos Ruiz', estado: 'Validado', criticidad: 'Media',
                    tipo: 'Web', fechaActualizacion: '2026-07-08',
                    tecnologias: ['Python', 'Django', 'PostgreSQL'], heredado: false,
                    evidencias: [
                        { nombre: 'documentacion_api.pdf', tipo: 'PDF', fecha: '2026-07-06' }
                    ]
                },
                {
                    id: 4, codigo: 'SYS-004', nombre: 'Sistema Heredado', area: 'Infraestructura',
                    responsable: 'Ana Torres', estado: 'Observado', criticidad: 'Baja',
                    tipo: 'Legacy', fechaActualizacion: '2026-07-07',
                    tecnologias: ['COBOL', 'DB2', 'Mainframe'], heredado: true,
                    evidencias: [
                        { nombre: 'informe_legacy.pdf', tipo: 'PDF', fecha: '2026-07-05' },
                        { nombre: 'captura_mainframe.png', tipo: 'Imagen', fecha: '2026-07-04' }
                    ]
                },

                {
                    id: 6, codigo: 'SYS-006', nombre: 'CRM', area: 'Ventas',
                    responsable: 'Laura García', estado: 'Validado', criticidad: 'Media',
                    tipo: 'Web', fechaActualizacion: '2026-07-05',
                    tecnologias: ['JavaScript', 'MongoDB', 'Node.js'], heredado: false,
                    evidencias: [
                        { nombre: 'manual_usuario_crm.pdf', tipo: 'PDF', fecha: '2026-07-03' }
                    ]
                },

                {
                    id: 8, codigo: 'SYS-008', nombre: 'Sistema de Recursos Humanos', area: 'Administración',
                    responsable: 'Patricia López', estado: 'Validado', criticidad: 'Alta',
                    tipo: 'Web', fechaActualizacion: '2026-07-03',
                    tecnologias: ['PHP', 'MySQL', 'CodeIgniter'], heredado: false,
                    evidencias: [
                        { nombre: 'manual_rrhh.pdf', tipo: 'PDF', fecha: '2026-07-01' },
                        { nombre: 'organigrama.png', tipo: 'Imagen', fecha: '2026-06-30' }
                    ]
                }
            ];
            guardarDatos();
            console.log('📦 Datos mock inicializados');
        }
        sistemasFiltrados = [...sistemas];
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        sistemas = [];
        sistemasFiltrados = [];
    }
}

function guardarDatos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sistemas));
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
        'Validado': 'success',
        'Pendiente': 'warning',
        'Observado': 'warning'
    };
    return map[estado] || 'info';
}

function badgeCriticidad(criticidad) {
    const map = {
        'Baja': 'success',
        'Media': 'warning',
        'Alta': 'danger',
        'Crítica / Misión Crítica': 'danger'
    };
    return map[criticidad] || 'info';
}

function renderStats() {
    try {
        const total = sistemas.length;
        const activos = sistemas.filter(s => s.estado === 'Validado' || s.estado === 'En revisión').length;
        const enMantenimiento = sistemas.filter(s => s.estado === 'En revisión').length;
        const observados = sistemas.filter(s => s.estado === 'Observado').length;
        const validados = sistemas.filter(s => s.estado === 'Validado').length;

        const container = document.getElementById('statsReportes');
        if (!container) return;
        container.innerHTML = `
            <div class="card azul">
                <div class="card-number">${total}</div>
                <div class="card-label">Total Sistemas</div>
            </div>
            <div class="card verde">
                <div class="card-number">${activos}</div>
                <div class="card-label">Activos</div>
            </div>
            <div class="card amarillo">
                <div class="card-number">${enMantenimiento}</div>
                <div class="card-label">En mantenimiento</div>
            </div>
            <div class="card rojo">
                <div class="card-number">${observados}</div>
                <div class="card-label">Observados</div>
            </div>
            <div class="card verde">
                <div class="card-number">${validados}</div>
                <div class="card-label">Validados</div>
            </div>
        `;
    } catch (error) {
        console.error('❌ Error al renderizar estadísticas:', error);
    }
}

function renderTabla() {
    try {
        const tbody = document.getElementById('tablaSistemas');
        if (!tbody) return;

        const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        const fin = inicio + ITEMS_POR_PAGINA;
        const datosPagina = sistemasFiltrados.slice(inicio, fin);

        if (datosPagina.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:3rem;color:#999;">
                        <div style="font-size:3rem;margin-bottom:0.5rem;">🔍</div>
                        No hay sistemas que coincidan con los filtros
                    </td>
                </tr>
            `;
            document.getElementById('sistemaCount').textContent = 'Total: 0';
            actualizarPaginacion();
            return;
        }

        // ✅ CORREGIDO: 8 columnas para coincidir con el thead
        tbody.innerHTML = datosPagina.map(s => `
            <tr>
                <td><strong>${s.codigo}</strong></td>
                <td>${s.nombre}</td>
                <td>${s.area}</td>
                <td>${s.responsable}</td>
                <td><span class="badge badge-${badgeEstado(s.estado)}">${s.estado}</span></td>
                <td><span class="badge badge-${badgeCriticidad(s.criticidad)}">${s.criticidad}</span></td>
                <td>${s.fechaActualizacion || 'N/A'}</td>
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn-icon btn-ver" data-id="${s.id}" title="Ver detalle" style="margin:0 3px; padding:6px 8px; background:#f0f4f8; border-radius:6px;">👁️</button>
                    <button class="btn-icon btn-exportar-sistema" data-id="${s.id}" title="Exportar sistema (PDF/Excel)" style="margin:0 3px; padding:6px 8px; background:#f0f4f8; border-radius:6px;">📤</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('sistemaCount').textContent = `Total: ${sistemasFiltrados.length}`;
        actualizarPaginacion();

        asignarDelegacionEventos();
    } catch (error) {
        console.error('❌ Error al renderizar tabla:', error);
    }
}

// ============================================================
// DELEGACIÓN DE EVENTOS
// ============================================================
let delegacionAsignada = false;

function asignarDelegacionEventos() {
    const tbody = document.getElementById('tablaSistemas');
    if (!tbody) return;
    if (delegacionAsignada) return;

    tbody.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = parseInt(btn.dataset.id);
        if (isNaN(id)) return;

        if (btn.classList.contains('btn-ver')) {
            console.log('👁️ Ver detalle, ID:', id);
            verSistema(id);
        } else if (btn.classList.contains('btn-exportar-sistema')) {
            console.log('📤 Exportar sistema, ID:', id);
            mostrarOpcionesExportacion(id);
        }
    });

    delegacionAsignada = true;
    console.log('✅ Delegación de eventos configurada en tbody');
}

// ============================================================
// PAGINACIÓN
// ============================================================

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(sistemasFiltrados.length / ITEMS_POR_PAGINA) || 1;
    const pageInfo = document.getElementById('paginaInfo');
    const btnPrev = document.getElementById('btnAnterior');
    const btnNext = document.getElementById('btnSiguiente');

    if (pageInfo) pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    if (btnPrev) btnPrev.disabled = (paginaActual === 1);
    if (btnNext) btnNext.disabled = (paginaActual === totalPaginas);
}

function cambiarPagina(delta) {
    const totalPaginas = Math.ceil(sistemasFiltrados.length / ITEMS_POR_PAGINA) || 1;
    const nuevaPagina = paginaActual + delta;
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    paginaActual = nuevaPagina;
    renderTabla();
}

// ============================================================
// FILTROS
// ============================================================

function llenarFiltros() {
    const areas = [...new Set(sistemas.map(s => s.area))].sort();
    const selectArea = document.getElementById('filtroArea');
    if (selectArea) {
        selectArea.innerHTML = '<option value="">Todas</option>';
        areas.forEach(a => selectArea.innerHTML += `<option value="${a}">${a}</option>`);
    }

    const responsables = [...new Set(sistemas.map(s => s.responsable))].sort();
    const selectResp = document.getElementById('filtroResponsable');
    if (selectResp) {
        selectResp.innerHTML = '<option value="">Todos</option>';
        responsables.forEach(r => selectResp.innerHTML += `<option value="${r}">${r}</option>`);
    }
}

function filtrarReportes() {
    try {
        const busqueda = document.getElementById('buscarReporte')?.value?.toLowerCase()?.trim() || '';
        const area = document.getElementById('filtroArea')?.value || '';
        const responsable = document.getElementById('filtroResponsable')?.value || '';
        const estado = document.getElementById('filtroEstado')?.value || '';
        const criticidad = document.getElementById('filtroCriticidad')?.value || '';
        const tipo = document.getElementById('filtroTipo')?.value || '';
        const fechaDesde = document.getElementById('filtroFechaDesde')?.value || '';
        const fechaHasta = document.getElementById('filtroFechaHasta')?.value || '';

        sistemasFiltrados = sistemas.filter(s => {
            const matchBusqueda = s.nombre.toLowerCase().includes(busqueda) ||
                                 s.codigo.toLowerCase().includes(busqueda) ||
                                 s.responsable.toLowerCase().includes(busqueda);
            const matchArea = area === '' || s.area === area;
            const matchResponsable = responsable === '' || s.responsable === responsable;
            const matchEstado = estado === '' || s.estado === estado;
            const matchCriticidad = criticidad === '' || s.criticidad === criticidad;
            const matchTipo = tipo === '' || s.tipo === tipo;
            let matchFecha = true;
            if (fechaDesde && s.fechaActualizacion) {
                matchFecha = matchFecha && s.fechaActualizacion >= fechaDesde;
            }
            if (fechaHasta && s.fechaActualizacion) {
                matchFecha = matchFecha && s.fechaActualizacion <= fechaHasta;
            }
            return matchBusqueda && matchArea && matchResponsable && matchEstado && matchCriticidad && matchTipo && matchFecha;
        });

        paginaActual = 1;
        renderTabla();
    } catch (error) {
        console.error('❌ Error al filtrar:', error);
    }
}

function limpiarFiltros() {
    const inputs = ['buscarReporte', 'filtroArea', 'filtroResponsable', 'filtroEstado', 'filtroCriticidad', 'filtroTipo', 'filtroFechaDesde', 'filtroFechaHasta'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    sistemasFiltrados = [...sistemas];
    paginaActual = 1;
    renderTabla();
}

// ============================================================
// VER DETALLE (MODAL MEJORADO)
// ============================================================

function verSistema(id) {
    const s = sistemas.find(s => s.id === id);
    if (!s) {
        alert('Sistema no encontrado.');
        return;
    }

    const body = document.getElementById('detalleBody');
    if (!body) {
        console.error('❌ No se encontró el elemento detalleBody');
        return;
    }

    let evidenciasHtml = '';
    if (s.evidencias && s.evidencias.length > 0) {
        evidenciasHtml = s.evidencias.map(ev =>
            `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #f3f4f6; padding:6px 0; font-size:13px;">
                <span>📎 ${ev.nombre}</span>
                <span style="color:#6b7280;">${ev.tipo} · ${ev.fecha}</span>
            </div>`
        ).join('');
    } else {
        evidenciasHtml = '<span style="color:#9ca3af;">No hay evidencias registradas</span>';
    }

    body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; padding:4px 0;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Código</span>
                <span style="color:#1f2937;">${s.codigo}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Nombre</span>
                <span style="color:#1f2937;">${s.nombre}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Área</span>
                <span style="color:#1f2937;">${s.area}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Responsable</span>
                <span style="color:#1f2937;">${s.responsable}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Estado</span>
                <span style="color:#1f2937;"><span class="badge badge-${badgeEstado(s.estado)}">${s.estado}</span></span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Criticidad</span>
                <span style="color:#1f2937;"><span class="badge badge-${badgeCriticidad(s.criticidad)}">${s.criticidad}</span></span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Tipo</span>
                <span style="color:#1f2937;">${s.tipo || 'No especificado'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Tecnologías</span>
                <span style="color:#1f2937;">${s.tecnologias ? s.tecnologias.join(', ') : 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Heredado</span>
                <span style="color:#1f2937;">${s.heredado ? 'Sí' : 'No'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Últ. actualización</span>
                <span style="color:#1f2937;">${s.fechaActualizacion || 'N/A'}</span>
            </div>
            <div style="margin-top:8px;">
                <span style="font-weight:600; color:#374151; display:block; margin-bottom:6px;">📎 Evidencias asociadas</span>
                <div style="background:#f9fafb; border-radius:6px; padding:10px;">
                    ${evidenciasHtml}
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalDetalleTitulo').textContent = `📄 Detalle: ${s.nombre}`;
    const modal = document.getElementById('modalDetalle');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
    }
}

// ============================================================
// EXPORTACIÓN INDIVIDUAL - SELECCIONAR FORMATO
// ============================================================

function mostrarOpcionesExportacion(id) {
    const s = sistemas.find(s => s.id === id);
    if (!s) {
        alert('Sistema no encontrado.');
        return;
    }

    const opcion = confirm(
        `📤 Exportar sistema: ${s.nombre}\n\n` +
        `Selecciona el formato:\n` +
        `✅ "Aceptar" → Exportar a PDF\n` +
        `❌ "Cancelar" → Exportar a Excel (CSV)\n\n` +
        `¿Exportar a PDF?`
    );

    if (opcion) {
        exportarSistemaPDF(id);
    } else {
        exportarSistemaExcel(id);
    }
}

function exportarSistemaPDF(id) {
    const s = sistemas.find(s => s.id === id);
    if (!s) return;

    const contenido = generarHTMLReporteIndividual(s);

    if (typeof html2pdf === 'undefined') {
        alert('❌ Librería html2pdf no encontrada. No se puede generar PDF.');
        return;
    }

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `sistema_${s.codigo}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
            alert(`✅ PDF exportado para ${s.nombre}`);
        })
        .catch((error) => {
            const el = document.getElementById('pdfLoading');
            if (el) el.remove();
            console.error('Error al generar PDF:', error);
            alert('❌ Error al generar el PDF.');
        });
}

function generarHTMLReporteIndividual(s) {
    const fecha = new Date().toLocaleString('es-ES');
    let evidenciasHtml = '';
    if (s.evidencias && s.evidencias.length > 0) {
        evidenciasHtml = s.evidencias.map(ev =>
            `<tr><td>${ev.nombre}</td><td>${ev.tipo}</td><td>${ev.fecha}</td></tr>`
        ).join('');
    } else {
        evidenciasHtml = '<tr><td colspan="3" style="text-align:center;">No hay evidencias</td></tr>';
    }

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: 'Inter', Arial, sans-serif; }
        body { padding:20px; background:white; }
        .header { text-align:center; padding-bottom:20px; border-bottom:3px solid #1a5276; margin-bottom:20px; }
        .header h1 { font-size:22px; color:#1a5276; }
        .header p { color:#666; font-size:14px; }
        .header .fecha { color:#888; font-size:12px; margin-top:5px; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 30px; margin-bottom:20px; }
        .info-item { display:flex; border-bottom:1px solid #e5e7eb; padding:6px 0; }
        .info-item .label { font-weight:600; width:120px; color:#374151; }
        .info-item .value { color:#1f2937; }
        table { width:100%; border-collapse:collapse; font-size:12px; margin-top:10px; }
        th { background:#1a5276; color:white; padding:6px 8px; text-align:left; }
        td { padding:6px 8px; border-bottom:1px solid #e0e0e0; }
        .footer { text-align:center; margin-top:30px; padding-top:15px; border-top:2px solid #ddd; color:#999; font-size:11px; }
        .badge { padding:2px 10px; border-radius:12px; font-size:11px; font-weight:600; }
        .badge-success { background:#dcfce7; color:#166534; }
        .badge-warning { background:#fef9c3; color:#854d0e; }
        .badge-danger { background:#fee2e2; color:#991b1b; }
        .badge-info { background:#dbeafe; color:#1e40af; }
    </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 Reporte de Sistema</h1>
            <p>${s.nombre} (${s.codigo})</p>
            <div class="fecha">Fecha: ${fecha}</div>
        </div>

        <div class="info-grid">
            <div class="info-item"><span class="label">Código</span><span class="value">${s.codigo}</span></div>
            <div class="info-item"><span class="label">Nombre</span><span class="value">${s.nombre}</span></div>
            <div class="info-item"><span class="label">Área</span><span class="value">${s.area}</span></div>
            <div class="info-item"><span class="label">Responsable</span><span class="value">${s.responsable}</span></div>
            <div class="info-item"><span class="label">Estado</span><span class="value"><span class="badge badge-${badgeEstado(s.estado)}">${s.estado}</span></span></div>
            <div class="info-item"><span class="label">Criticidad</span><span class="value"><span class="badge badge-${badgeCriticidad(s.criticidad)}">${s.criticidad}</span></span></div>
            <div class="info-item"><span class="label">Tipo</span><span class="value">${s.tipo || 'N/A'}</span></div>
            <div class="info-item"><span class="label">Heredado</span><span class="value">${s.heredado ? 'Sí' : 'No'}</span></div>
            <div class="info-item"><span class="label">Tecnologías</span><span class="value">${s.tecnologias ? s.tecnologias.join(', ') : 'N/A'}</span></div>
            <div class="info-item"><span class="label">Últ. actualización</span><span class="value">${s.fechaActualizacion || 'N/A'}</span></div>
        </div>

        <h3 style="margin:16px 0 8px;">📎 Evidencias asociadas</h3>
        <table>
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Fecha</th></tr></thead>
            <tbody>${evidenciasHtml}</tbody>
        </table>

        <div class="footer">DIAGTI v2.0 · CTIC UNAS · ${new Date().getFullYear()}</div>
    </body>
    </html>
    `;
}

function exportarSistemaExcel(id) {
    const s = sistemas.find(s => s.id === id);
    if (!s) return;

    const headers = ['Código', 'Nombre', 'Área', 'Responsable', 'Estado', 'Criticidad', 'Tipo', 'Tecnologías', 'Heredado', 'Últ. Actualización', 'Evidencias'];
    const evidenciasStr = s.evidencias ? s.evidencias.map(e => e.nombre + ' (' + e.tipo + ')').join('; ') : 'Sin evidencias';
    const row = [
        s.codigo,
        s.nombre,
        s.area,
        s.responsable,
        s.estado,
        s.criticidad,
        s.tipo || '',
        s.tecnologias ? s.tecnologias.join('; ') : '',
        s.heredado ? 'Sí' : 'No',
        s.fechaActualizacion || '',
        evidenciasStr
    ];

    let csvContent = '\uFEFF';
    csvContent += headers.join(';') + '\n';
    const escaped = row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(';') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
    });
    csvContent += escaped.join(';') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sistema_${s.codigo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`✅ Excel (CSV) exportado para ${s.nombre}`);
}

// ============================================================
// EXPORTACIONES GENERALES (CSV y PDF)
// ============================================================

function exportarCSV() {
    try {
        const datos = sistemasFiltrados.length > 0 ? sistemasFiltrados : sistemas;
        if (datos.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        const headers = ['Código', 'Nombre', 'Área', 'Responsable', 'Estado', 'Criticidad', 'Tipo', 'Tecnologías', 'Heredado', 'Últ. Actualización'];
        const rows = datos.map(s => [
            s.codigo,
            s.nombre,
            s.area,
            s.responsable,
            s.estado,
            s.criticidad,
            s.tipo || '',
            s.tecnologias ? s.tecnologias.join('; ') : '',
            s.heredado ? 'Sí' : 'No',
            s.fechaActualizacion || ''
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
        link.setAttribute('download', `inventario_sistemas_${fecha}.csv`);
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
        const datos = sistemasFiltrados.length > 0 ? sistemasFiltrados : sistemas;
        if (datos.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        if (typeof html2pdf === 'undefined') {
            alert('❌ Librería html2pdf no encontrada. Asegúrate de incluir el script en el HTML.');
            return;
        }

        const contenido = generarHTMLReporteGeneral(datos);
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `inventario_sistemas_${new Date().toISOString().split('T')[0]}.pdf`,
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

function generarHTMLReporteGeneral(datos) {
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
        .badge { padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600; }
        .badge-success { background:#dcfce7; color:#166534; }
        .badge-warning { background:#fef9c3; color:#854d0e; }
        .badge-danger { background:#fee2e2; color:#991b1b; }
        .badge-info { background:#dbeafe; color:#1e40af; }
    </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 REPORTE DE INVENTARIO - DIAGTI</h1>
            <p>Inventario consolidado de sistemas informáticos</p>
            <div class="fecha">Fecha: ${fecha}</div>
        </div>
        <div class="stats">
            <span>📊 Total: <span class="num">${datos.length}</span></span>
            <span>✅ Activos: <span class="num">${datos.filter(s => s.estado === 'Validado' || s.estado === 'En revisión').length}</span></span>
            <span>🔄 Mantenimiento: <span class="num">${datos.filter(s => s.estado === 'En revisión').length}</span></span>
            <span>👀 Observados: <span class="num">${datos.filter(s => s.estado === 'Observado').length}</span></span>
            <span>✔️ Validados: <span class="num">${datos.filter(s => s.estado === 'Validado').length}</span></span>
        </div>
        <table>
            <thead>
                <tr><th>Código</th><th>Nombre</th><th>Área</th><th>Responsable</th><th>Estado</th><th>Criticidad</th><th>Tipo</th><th>Últ. Actualización</th></tr>
            </thead>
            <tbody>
    `;
    datos.forEach(s => {
        html += `
            <tr>
                <td>${s.codigo}</td>
                <td><strong>${s.nombre}</strong></td>
                <td>${s.area}</td>
                <td>${s.responsable}</td>
                <td><span class="badge badge-${badgeEstado(s.estado)}">${s.estado}</span></td>
                <td><span class="badge badge-${badgeCriticidad(s.criticidad)}">${s.criticidad}</span></td>
                <td>${s.tipo || ''}</td>
                <td>${s.fechaActualizacion || ''}</td>
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
        console.log('📊 Módulo de Reportes de Inventario iniciando...');

        cargarDatos();
        llenarFiltros();
        renderStats();
        renderTabla();

        // === EVENTOS DE FILTROS Y BOTONES PRINCIPALES ===
        const btnFiltrar = document.getElementById('btnFiltrar');
        if (btnFiltrar) btnFiltrar.addEventListener('click', filtrarReportes);

        const btnLimpiar = document.getElementById('btnLimpiarFiltros');
        if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);

        const buscarInput = document.getElementById('buscarReporte');
        if (buscarInput) {
            buscarInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') filtrarReportes();
            });
        }

        const btnExportarCSV = document.getElementById('btnExportarCSV');
        if (btnExportarCSV) btnExportarCSV.addEventListener('click', exportarCSV);

        const btnExportarPDF = document.getElementById('btnExportarPDF');
        if (btnExportarPDF) btnExportarPDF.addEventListener('click', exportarPDF);

        // ✅ BOTÓN REFRESCAR - CORREGIDO
        const btnRefrescar = document.getElementById('btnRefrescar');
        if (btnRefrescar) {
            btnRefrescar.addEventListener('click', function() {
                console.log('🔄 Refrescando datos...');
                sistemasFiltrados = [...sistemas];
                paginaActual = 1;
                renderTabla();
                renderStats();
                alert('🔄 Datos actualizados correctamente');
            });
        }

        const btnAnterior = document.getElementById('btnAnterior');
        if (btnAnterior) btnAnterior.addEventListener('click', function() { cambiarPagina(-1); });

        const btnSiguiente = document.getElementById('btnSiguiente');
        if (btnSiguiente) btnSiguiente.addEventListener('click', function() { cambiarPagina(1); });

        // === CERRAR MODAL DE DETALLE ===
        const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');
        if (btnCerrarDetalle) {
            btnCerrarDetalle.addEventListener('click', function() {
                const modal = document.getElementById('modalDetalle');
                if (modal) modal.style.display = 'none';
            });
        }

        const btnCerrarDetalleFooter = document.getElementById('btnCerrarDetalleFooter');
        if (btnCerrarDetalleFooter) {
            btnCerrarDetalleFooter.addEventListener('click', function() {
                const modal = document.getElementById('modalDetalle');
                if (modal) modal.style.display = 'none';
            });
        }

        const modalDetalle = document.getElementById('modalDetalle');
        if (modalDetalle) {
            modalDetalle.addEventListener('click', function(e) {
                if (e.target === this) this.style.display = 'none';
            });
        }

        // === CERRAR SESIÓN ===
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', cerrarSesion);

        const btnCancelar1 = document.getElementById('btnCancelarCerrarSesion1');
        if (btnCancelar1) btnCancelar1.addEventListener('click', cancelarCerrarSesion);

        const btnCancelar2 = document.getElementById('btnCancelarCerrarSesion2');
        if (btnCancelar2) btnCancelar2.addEventListener('click', cancelarCerrarSesion);

        const btnConfirmar = document.getElementById('btnConfirmarCerrarSesion');
        if (btnConfirmar) btnConfirmar.addEventListener('click', confirmarCerrarSesion);

        const overlay = document.getElementById('logout-confirm-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === this) cancelarCerrarSesion();
            });
        }

        console.log('✅ Módulo inicializado correctamente');
        console.log(`📊 ${sistemas.length} sistemas cargados`);

    } catch (error) {
        console.error('❌ Error en la inicialización:', error);
        alert('⚠️ Error al cargar el módulo.');
    }
});
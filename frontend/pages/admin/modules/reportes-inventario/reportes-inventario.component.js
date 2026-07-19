// ============================================================
// CONFIGURACIÓN API
// ============================================================
const API_BASE = 'http://localhost:8080/api/admin';
const API_REPORTES = 'http://localhost:8080/api/director/reportes';

// ============================================================
// DATOS - SISTEMAS (CONECTADO AL BACKEND)
// ============================================================
let sistemas = [];
let sistemasFiltrados = [];
let paginaActual = 1;
const ITEMS_POR_PAGINA = 5;

// ============================================================
// CATÁLOGOS (CARGADOS DINÁMICAMENTE DESDE EL BACKEND)
// ============================================================
let catalogos = {
    criticidades: [],
    areas: [],
    estados: [],
    tipos: []
};

// ============================================================
// ✅ FUNCIONES DE NORMALIZACIÓN
// ============================================================

function normalizarEstado(estado) {
    if (!estado) return 'Pendiente';
    const map = {
        'BORRADOR': 'Borrador',
        'ENVIADO': 'Enviado',
        'OBSERVADO': 'Observado',
        'SUBSANADO': 'Subsanado',
        'VALIDADO': 'Validado',
        'RECHAZADO': 'Rechazado',
        'CERRADO': 'Cerrado',
        'PENDIENTE': 'Pendiente',
        'EN_REVISION': 'Pendiente',
        'EN_REVISIÓN': 'Pendiente',
        'ACTIVO': 'Validado'
    };
    
    const estadoUpper = estado.toUpperCase();
    return map[estadoUpper] || estado;
}

function normalizarCriticidad(criticidad) {
    if (!criticidad) return 'Baja';
    const map = {
        'BAJO': 'Baja',
        'MEDIO': 'Media',
        'ALTO': 'Alta',
        'CRITICO': 'Crítica'
    };
    return map[criticidad.toUpperCase()] || criticidad;
}

function badgeEstado(estado) {
    const estadoNormalizado = normalizarEstado(estado);
    const map = {
        'Borrador': 'secondary',
        'Enviado': 'info',
        'Observado': 'warning',
        'Subsanado': 'info',
        'Validado': 'success',
        'Rechazado': 'danger',
        'Cerrado': 'secondary',
        'Pendiente': 'warning'
    };
    return map[estadoNormalizado] || 'info';
}

function badgeCriticidad(criticidad) {
    const critNormalizada = normalizarCriticidad(criticidad);
    const map = {
        'Baja': 'success',
        'Media': 'warning',
        'Alta': 'danger',
        'Crítica': 'danger'
    };
    return map[critNormalizada] || 'info';
}

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
// CARGA DE CATÁLOGOS DESDE EL BACKEND
// ============================================================
function cargarCatalogos() {
    console.log('📚 Cargando catálogos desde el backend...');
    
    // Cargar criticidades
    return fetch(`${API_REPORTES}/catalogos/criticidades`)
        .then(res => manejarError(res))
        .then(data => {
            catalogos.criticidades = data || [];
            console.log('📚 Criticidades cargadas:', catalogos.criticidades.length, 'opciones');
        })
        .then(() => {
            // Cargar estados de levantamiento
            return fetch(`${API_REPORTES}/catalogos/estados-validacion`)
                .then(res => manejarError(res))
                .then(data => {
                    catalogos.estados = data || [];
                    console.log('📚 Estados cargados:', catalogos.estados.length, 'opciones');
                });
        })
        .catch(error => {
            console.error('❌ Error al cargar catálogos:', error);
            // Valores por defecto si falla
            catalogos.criticidades = [
                { valor: 'Académico' },
                { valor: 'Financiero' },
                { valor: 'RRHH' },
                { valor: 'Administrativo' },
                { valor: 'Misional' },
                { valor: 'Estratégico' }
            ];
            catalogos.estados = [
                { valor: 'Borrador' },
                { valor: 'Enviado' },
                { valor: 'Observado' },
                { valor: 'Subsanado' },
                { valor: 'Validado' },
                { valor: 'Rechazado' },
                { valor: 'Cerrado' },
                { valor: 'Pendiente' }
            ];
            console.log('📚 Usando catálogos por defecto');
        });
}

// ============================================================
// CARGA DE DATOS DESDE EL BACKEND
// ============================================================
function cargarDatos() {
    // Primero cargar los catálogos, luego los sistemas
    return cargarCatalogos()
        .then(() => {
            return fetch(`${API_BASE}/sistemas`)
                .then(res => manejarError(res))
                .then(data => {
                    console.log('📊 Datos CRUDOS del backend:', data);
                    
                    sistemas = (data || []).map(s => ({
                        id: s.id,
                        codigo: s.codigo || 'N/A',
                        nombre: s.nombre || 'Sin nombre',
                        area: s.area || 'N/A',
                        responsable: s.responsable || 'Sin responsable',
                        estado: s.estado || 'Pendiente',
                        nivelRiesgo: s.criticidad || 'BAJO',
                        criticidadNombre: s.criticidadNombre || s.criticidad || 'No especificada',
                        tipo: s.tipo || 'No especificado',
                        fechaActualizacion: s.fechaActualizacion || 'N/A',
                        tecnologias: s.tecnologias || [],
                        heredado: s.heredado || false,
                        evidencias: s.evidencias || [],
                        _detalleCargado: false
                    }));
                    
                    sistemasFiltrados = [...sistemas];
                    
                    console.log('📊 Sistemas PROCESADOS:', sistemas);
                    console.log(`📊 ${sistemas.length} sistemas cargados desde el backend`);
                    
                    // Renderizar todo
                    renderStats();
                    renderTabla();
                    llenarFiltros();
                });
        })
        .catch(error => {
            console.error('❌ Error al cargar datos:', error);
            sistemas = [];
            sistemasFiltrados = [];
            renderStats();
            renderTabla();
            alert('⚠️ No se pudo conectar con el servidor.');
        });
}

// ============================================================
// CARGA DE DETALLE (tipo, tecnologías, heredado, evidencias)
// ============================================================
function obtenerDetalleSistema(id) {
    const local = sistemas.find(s => s.id === id);
    if (local && local._detalleCargado) {
        return Promise.resolve(local);
    }

    return fetch(`${API_BASE}/sistemas/${id}`)
        .then(res => manejarError(res))
        .then(detalle => {
            if (!detalle) return local || null;
            if (local) {
                local.tipo = detalle.tipo;
                local.tecnologias = detalle.tecnologias || [];
                local.heredado = detalle.heredado || false;
                local.evidencias = detalle.evidencias || [];
                local._detalleCargado = true;
                return local;
            }
            return { ...detalle, _detalleCargado: true };
        })
        .catch(error => {
            console.error('❌ Error al cargar el detalle del sistema:', error);
            alert('⚠️ No se pudo obtener el detalle del sistema desde el servidor.');
            return local || null;
        });
}

// ============================================================
// FUNCIONES DE RENDERIZADO
// ============================================================

function renderStats() {
    try {
        const total = sistemas.length;
        const validados = sistemas.filter(s => normalizarEstado(s.estado) === 'Validado').length;
        const observados = sistemas.filter(s => normalizarEstado(s.estado) === 'Observado').length;
        // ✅ SOLO contar el estado exacto "Pendiente" del catálogo
        const pendientes = sistemas.filter(s => normalizarEstado(s.estado) === 'Pendiente').length;
        // ✅ Enviados (estado "Enviado" del catálogo)
        const enviados = sistemas.filter(s => normalizarEstado(s.estado) === 'Enviado').length;
        // ✅ Borradores (estado "Borrador" del catálogo)
        const borradores = sistemas.filter(s => normalizarEstado(s.estado) === 'Borrador').length;
        // ✅ Cerrados (estado "Cerrado" del catálogo)
        const cerrados = sistemas.filter(s => normalizarEstado(s.estado) === 'Cerrado').length;

        const container = document.getElementById('statsReportes');
        if (!container) return;
        container.innerHTML = `
            <div class="card azul">
                <div class="card-number">${total}</div>
                <div class="card-label">Total Sistemas</div>
            </div>
            <div class="card verde">
                <div class="card-number">${validados}</div>
                <div class="card-label">Validados</div>
            </div>
            <div class="card rojo">
                <div class="card-number">${observados}</div>
                <div class="card-label">Observados</div>
            </div>
            <div class="card amarillo">
                <div class="card-number">${pendientes}</div>
                <div class="card-label">Pendientes</div>
            </div>
        `;
        
        console.log('📊 Estadísticas:', { total, validados, observados, pendientes, enviados, borradores, cerrados });
    } catch (error) {
        console.error('❌ Error al renderizar estadísticas:', error);
    }
}

function renderTabla() {
    try {
        console.log('🔄 Ejecutando renderTabla()...');
        console.log('📊 sistemasFiltrados:', sistemasFiltrados);
        
        const tbody = document.getElementById('tablaSistemas');
        if (!tbody) {
            console.error('❌ No se encontró el elemento tablaSistemas');
            return;
        }

        const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        const fin = inicio + ITEMS_POR_PAGINA;
        const datosPagina = sistemasFiltrados.slice(inicio, fin);

        if (!datosPagina || datosPagina.length === 0) {
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

        let html = '';
        datosPagina.forEach(s => {
            const estadoNormalizado = normalizarEstado(s.estado);
            const criticidadMostrar = s.criticidadNombre || 'No especificada';
            const nivelRiesgo = s.nivelRiesgo || 'BAJO';
            
            html += `
                <tr>
                    <td><strong>${s.codigo || 'N/A'}</strong></td>
                    <td>${s.nombre || 'Sin nombre'}</td>
                    <td>${s.area || 'N/A'}</td>
                    <td>${s.responsable || 'Sin responsable'}</td>
                    <td><span class="badge-estado ${estadoNormalizado.toLowerCase()}">${estadoNormalizado}</span></td>
                    <td><span class="badge-criticidad ${nivelRiesgo.toLowerCase()}">${criticidadMostrar}</span></td>
                    <td>${s.fechaActualizacion || 'N/A'}</td>
                    <td style="text-align:center; white-space:nowrap;">
                        <button class="btn-icon btn-ver" data-id="${s.id}" title="Ver detalle">👁️</button>
                        <button class="btn-icon btn-exportar-sistema" data-id="${s.id}" title="Exportar sistema">📤</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        document.getElementById('sistemaCount').textContent = `Total: ${sistemasFiltrados.length}`;
        actualizarPaginacion();
        asignarDelegacionEventos();
        
        console.log('✅ renderTabla() completado con', datosPagina.length, 'filas');
    } catch (error) {
        console.error('❌ Error al renderizar tabla:', error);
        console.error('❌ Stack trace:', error.stack);
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
// FILTROS - CARGADOS DINÁMICAMENTE DESDE CATÁLOGOS
// ============================================================

function llenarFiltros() {
    console.log('🔄 Llenando filtros con datos de catálogos...');
    
    // 1. Áreas (desde los sistemas)
    const areas = [...new Set(sistemas.map(s => s.area))].filter(a => a && a !== 'N/A').sort();
    const selectArea = document.getElementById('filtroArea');
    if (selectArea) {
        selectArea.innerHTML = '<option value="">Todas</option>';
        areas.forEach(a => selectArea.innerHTML += `<option value="${a}">${a}</option>`);
        console.log('📚 Filtro de áreas actualizado con:', areas.length, 'opciones');
    }

    // 2. Responsables (desde los sistemas)
    const responsables = [...new Set(sistemas.map(s => s.responsable))].filter(r => r && r !== 'Sin responsable').sort();
    const selectResp = document.getElementById('filtroResponsable');
    if (selectResp) {
        selectResp.innerHTML = '<option value="">Todos</option>';
        responsables.forEach(r => selectResp.innerHTML += `<option value="${r}">${r}</option>`);
        console.log('📚 Filtro de responsables actualizado con:', responsables.length, 'opciones');
    }

    // 3. ✅ CRITICIDADES (desde el catálogo del backend)
    const selectCriticidad = document.getElementById('filtroCriticidad');
    if (selectCriticidad) {
        selectCriticidad.innerHTML = '<option value="">Todas</option>';
        catalogos.criticidades.forEach(c => {
            const valor = c.valor || c.nombre || c.codigo;
            if (valor) {
                selectCriticidad.innerHTML += `<option value="${valor}">${valor}</option>`;
            }
        });
        console.log('📚 Filtro de criticidades actualizado con:', catalogos.criticidades.length, 'opciones');
    }

    // 4. ✅ ESTADOS (desde el catálogo del backend)
    const selectEstado = document.getElementById('filtroEstado');
    if (selectEstado) {
        selectEstado.innerHTML = '<option value="">Todos</option>';
        catalogos.estados.forEach(e => {
            const valor = e.valor || e.nombre || e.codigo;
            if (valor) {
                selectEstado.innerHTML += `<option value="${valor}">${valor}</option>`;
            }
        });
        console.log('📚 Filtro de estados actualizado con:', catalogos.estados.length, 'opciones');
    }

}

function filtrarReportes() {
    try {
        const busqueda = document.getElementById('buscarReporte')?.value?.toLowerCase()?.trim() || '';
        const area = document.getElementById('filtroArea')?.value || '';
        const responsable = document.getElementById('filtroResponsable')?.value || '';
        const estado = document.getElementById('filtroEstado')?.value || '';
        const criticidad = document.getElementById('filtroCriticidad')?.value || '';
        const fechaDesde = document.getElementById('filtroFechaDesde')?.value || '';
        const fechaHasta = document.getElementById('filtroFechaHasta')?.value || '';

        sistemasFiltrados = sistemas.filter(s => {
            const matchBusqueda = s.nombre?.toLowerCase().includes(busqueda) ||
                                 s.codigo?.toLowerCase().includes(busqueda) ||
                                 s.responsable?.toLowerCase().includes(busqueda);
            const matchArea = area === '' || s.area === area;
            const matchResponsable = responsable === '' || s.responsable === responsable;
            const matchEstado = estado === '' || normalizarEstado(s.estado) === estado;
            const matchCriticidad = criticidad === '' || s.criticidadNombre === criticidad;
            
            let matchFecha = true;
            if (fechaDesde && s.fechaActualizacion && s.fechaActualizacion !== 'N/A') {
                matchFecha = matchFecha && s.fechaActualizacion >= fechaDesde;
            }
            if (fechaHasta && s.fechaActualizacion && s.fechaActualizacion !== 'N/A') {
                matchFecha = matchFecha && s.fechaActualizacion <= fechaHasta;
            }
            return matchBusqueda && matchArea && matchResponsable && matchEstado && matchCriticidad && matchFecha;
        });

        paginaActual = 1;
        renderTabla();
        console.log('🔍 Filtro aplicado:', sistemasFiltrados.length, 'resultados');
    } catch (error) {
        console.error('❌ Error al filtrar:', error);
    }
}

function limpiarFiltros() {
    const inputs = ['buscarReporte', 'filtroArea', 'filtroResponsable', 'filtroEstado', 'filtroCriticidad', 'filtroFechaDesde', 'filtroFechaHasta'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    sistemasFiltrados = [...sistemas];
    paginaActual = 1;
    renderTabla();
    console.log('🧹 Filtros limpiados');
}

// ============================================================
// VER DETALLE (MODAL MEJORADO)
// ============================================================

function verSistema(id) {
    obtenerDetalleSistema(id).then(s => {
        if (!s) {
            alert('Sistema no encontrado.');
            return;
        }
        pintarDetalleSistema(s);
    });
}

function pintarDetalleSistema(s) {
    const body = document.getElementById('detalleBody');
    if (!body) {
        console.error('❌ No se encontró el elemento detalleBody');
        return;
    }

    let evidenciasHtml = '';
    if (s.evidencias && s.evidencias.length > 0) {
        evidenciasHtml = s.evidencias.map(ev =>
            `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #f3f4f6; padding:6px 0; font-size:13px;">
                <span>📎 ${ev.nombre || 'Sin nombre'}</span>
                <span style="color:#6b7280;">${ev.tipo || 'N/A'} · ${ev.fecha || 'N/A'}</span>
            </div>`
        ).join('');
    } else {
        evidenciasHtml = '<span style="color:#9ca3af;">No hay evidencias registradas</span>';
    }

    const estadoNormalizado = normalizarEstado(s.estado);
    const criticidadMostrar = s.criticidadNombre || s.nivelRiesgo || 'No especificada';

    body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; padding:4px 0;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Código</span>
                <span style="color:#1f2937;">${s.codigo || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Nombre</span>
                <span style="color:#1f2937;">${s.nombre || 'Sin nombre'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Área</span>
                <span style="color:#1f2937;">${s.area || 'N/A'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Responsable</span>
                <span style="color:#1f2937;">${s.responsable || 'Sin responsable'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Estado</span>
                <span style="color:#1f2937;"><span class="badge badge-${badgeEstado(s.estado)}">${estadoNormalizado}</span></span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                <span style="font-weight:600; color:#374151; width:120px;">Criticidad</span>
                <span style="color:#1f2937;"><span class="badge badge-${badgeCriticidad(s.nivelRiesgo)}">${criticidadMostrar}</span></span>
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

    document.getElementById('modalDetalleTitulo').textContent = `📄 Detalle: ${s.nombre || 'Sistema'}`;
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
    obtenerDetalleSistema(id).then(s => {
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
    });
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
            `<tr><td>${ev.nombre || 'Sin nombre'}</td><td>${ev.tipo || 'N/A'}</td><td>${ev.fecha || 'N/A'}</td></tr>`
        ).join('');
    } else {
        evidenciasHtml = '<tr><td colspan="3" style="text-align:center;">No hay evidencias</td></tr>';
    }

    const estadoNormalizado = normalizarEstado(s.estado);
    const badgeEstadoClass = badgeEstado(s.estado);

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
        .badge-secondary { background:#e5e7eb; color:#374151; }
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
            <div class="info-item"><span class="label">Estado</span><span class="value"><span class="badge badge-${badgeEstadoClass}">${estadoNormalizado}</span></span></div>
            <div class="info-item"><span class="label">Criticidad</span><span class="value"><span class="badge badge-${badgeCriticidad(s.nivelRiesgo)}">${s.criticidadNombre || s.nivelRiesgo}</span></span></div>
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
        normalizarEstado(s.estado),
        s.criticidadNombre || s.nivelRiesgo,
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
            normalizarEstado(s.estado),
            s.criticidadNombre || s.nivelRiesgo,
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
        .badge-secondary { background:#e5e7eb; color:#374151; }
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
            <span>✅ Validados: <span class="num">${datos.filter(s => normalizarEstado(s.estado) === 'Validado').length}</span></span>
            <span>🔄 En revisión: <span class="num">${datos.filter(s => normalizarEstado(s.estado) === 'En revisión').length}</span></span>
            <span>👀 Observados: <span class="num">${datos.filter(s => normalizarEstado(s.estado) === 'Observado').length}</span></span>
            <span>📝 Pendientes: <span class="num">${datos.filter(s => normalizarEstado(s.estado) === 'Pendiente').length}</span></span>
        </div>
        <table>
            <thead>
                <tr><th>Código</th><th>Nombre</th><th>Área</th><th>Responsable</th><th>Estado</th><th>Criticidad</th><th>Tipo</th><th>Últ. Actualización</th></tr>
            </thead>
            <tbody>
    `;
    datos.forEach(s => {
        const estadoNormalizado = normalizarEstado(s.estado);
        const badgeClass = badgeEstado(s.estado);
        html += `
            <tr>
                <td>${s.codigo}</td>
                <td><strong>${s.nombre}</strong></td>
                <td>${s.area}</td>
                <td>${s.responsable}</td>
                <td><span class="badge badge-${badgeClass}">${estadoNormalizado}</span></td>
                <td><span class="badge badge-${badgeCriticidad(s.nivelRiesgo)}">${s.criticidadNombre || s.nivelRiesgo}</span></td>
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

        const btnRefrescar = document.getElementById('btnRefrescar');
        if (btnRefrescar) {
            btnRefrescar.addEventListener('click', function() {
                console.log('🔄 Refrescando datos desde el backend...');
                cargarDatos();
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

    } catch (error) {
        console.error('❌ Error en la inicialización:', error);
        alert('⚠️ Error al cargar el módulo.');
    }
});
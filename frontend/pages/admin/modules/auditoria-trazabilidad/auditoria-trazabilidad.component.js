// ============================================================
// AUDITORÍA Y TRAZABILIDAD - MÓDULO PRINCIPAL v2.0
// ============================================================

class AuditoriaModule {
    constructor() {
        this.eventosAuditoria = [];
        this.eventosFiltrados = [];
        this.paginaActual = 1;
        this.itemsPorPagina = 8;
        this.accionesMap = {
            'Creación': 'verde',
            'Edición': 'azul',
            'Eliminación': 'rojo',
            'Aprobación': 'verde',
            'Observación': 'amarillo',
            'Rechazo': 'rojo',
            'Resolución': 'morado',
            'Login': 'cian',
            'Logout': 'rosa'
        };
        this.init();
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    
    init() {
        this.cargarDatosMock();
        this.renderStats();
        this.renderTabla();
        this.setupEventListeners();
        console.log('🔍 Módulo de Auditoría y Trazabilidad v2.0 cargado');
        console.log(`📋 ${this.eventosAuditoria.length} eventos registrados`);
    }

    // ============================================================
    // DATOS MOCK
    // ============================================================
    
    cargarDatosMock() {
        this.eventosAuditoria = [
            { id: 1, fecha: '2026-07-02 10:30:00', usuario: 'admin@ctic.com', accion: 'Creación', entidad: 'Sistema', detalle: 'Nuevo sistema registrado: SYS-008' },
            { id: 2, fecha: '2026-07-02 09:15:00', usuario: 'jperez@unas.edu.pe', accion: 'Aprobación', entidad: 'Validación', detalle: 'Sistema SYS-001 aprobado' },
            { id: 3, fecha: '2026-07-01 16:45:00', usuario: 'mgomez@unas.edu.pe', accion: 'Observación', entidad: 'Sistema', detalle: 'Observación en SYS-002: falta SSL' },
            { id: 4, fecha: '2026-07-01 14:20:00', usuario: 'admin@ctic.com', accion: 'Edición', entidad: 'Usuario', detalle: 'Actualización de usuario: Laura García' },
            { id: 5, fecha: '2026-07-01 11:00:00', usuario: 'lruiz@unas.edu.pe', accion: 'Login', entidad: 'Autenticación', detalle: 'Inicio de sesión exitoso' },
            { id: 6, fecha: '2026-06-30 17:30:00', usuario: 'admin@ctic.com', accion: 'Eliminación', entidad: 'Sistema', detalle: 'Eliminación lógica de SYS-005' },
            { id: 7, fecha: '2026-06-30 15:00:00', usuario: 'jperez@unas.edu.pe', accion: 'Rechazo', entidad: 'Validación', detalle: 'Rechazo de SYS-006 por falta de evidencias' },
            { id: 8, fecha: '2026-06-30 10:30:00', usuario: 'mgomez@unas.edu.pe', accion: 'Creación', entidad: 'Evidencia', detalle: 'Carga de evidencia: manual_erp.pdf' },
            { id: 9, fecha: '2026-06-29 12:45:00', usuario: 'admin@ctic.com', accion: 'Edición', entidad: 'Rol', detalle: 'Actualización de permisos de usuario' },
            { id: 10, fecha: '2026-06-29 09:00:00', usuario: 'lruiz@unas.edu.pe', accion: 'Resolución', entidad: 'Sistema', detalle: 'Resolución N° 001-2026 emitida' },
            { id: 11, fecha: '2026-06-28 16:20:00', usuario: 'jperez@unas.edu.pe', accion: 'Observación', entidad: 'Sistema', detalle: 'Observación en SYS-004: tecnología obsoleta' },
            { id: 12, fecha: '2026-06-28 11:10:00', usuario: 'admin@ctic.com', accion: 'Creación', entidad: 'Sistema', detalle: 'Nuevo sistema registrado: SYS-009' },
            { id: 13, fecha: '2026-06-27 14:30:00', usuario: 'mgomez@unas.edu.pe', accion: 'Edición', entidad: 'Sistema', detalle: 'Actualización de responsable en SYS-003' },
            { id: 14, fecha: '2026-06-27 10:00:00', usuario: 'lruiz@unas.edu.pe', accion: 'Logout', entidad: 'Autenticación', detalle: 'Cierre de sesión' },
            { id: 15, fecha: '2026-06-26 15:45:00', usuario: 'admin@ctic.com', accion: 'Rechazo', entidad: 'Sistema', detalle: 'Rechazo de SYS-007 por incumplimiento' },
            { id: 16, fecha: '2026-06-26 09:30:00', usuario: 'admin@ctic.com', accion: 'Creación', entidad: 'Usuario', detalle: 'Nuevo usuario: Roberto Sánchez' },
            { id: 17, fecha: '2026-06-25 17:00:00', usuario: 'jperez@unas.edu.pe', accion: 'Aprobación', entidad: 'Evidencia', detalle: 'Evidencia aprobada: manual_tecnico.pdf' },
            { id: 18, fecha: '2026-06-25 11:20:00', usuario: 'mgomez@unas.edu.pe', accion: 'Observación', entidad: 'Sistema', detalle: 'Observación en SYS-001: actualizar documentación' },
            { id: 19, fecha: '2026-06-24 13:45:00', usuario: 'admin@ctic.com', accion: 'Edición', entidad: 'Configuración', detalle: 'Actualización de catálogos del sistema' },
            { id: 20, fecha: '2026-06-24 08:30:00', usuario: 'lruiz@unas.edu.pe', accion: 'Creación', entidad: 'Sistema', detalle: 'Nuevo sistema registrado: SYS-010' },
        ];
        this.eventosFiltrados = [...this.eventosAuditoria];
    }

    // ============================================================
    // RENDERIZADO DE ESTADÍSTICAS
    // ============================================================
    
renderStats() {
    const stats = {
        total: this.eventosAuditoria.length,
        creaciones: this.eventosAuditoria.filter(e => e.accion === 'Creación').length,
        ediciones: this.eventosAuditoria.filter(e => e.accion === 'Edición').length,
        eliminaciones: this.eventosAuditoria.filter(e => e.accion === 'Eliminación').length,
        aprobaciones: this.eventosAuditoria.filter(e => e.accion === 'Aprobación').length,
        observaciones: this.eventosAuditoria.filter(e => e.accion === 'Observación').length,
    };

    const statsContainer = document.getElementById("statsAuditoria");

    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="card">
            <div class="card-number">${stats.total}</div>
            <div class="card-label">Total Eventos</div>
        </div>

        <div class="card verde">
            <div class="card-number">${stats.creaciones}</div>
            <div class="card-label">Creaciones</div>
        </div>

        <div class="card azul">
            <div class="card-number">${stats.ediciones}</div>
            <div class="card-label">Ediciones</div>
        </div>

        <div class="card rojo">
            <div class="card-number">${stats.eliminaciones}</div>
            <div class="card-label">Eliminaciones</div>
        </div>

        <div class="card amarillo">
            <div class="card-number">${stats.aprobaciones}</div>
            <div class="card-label">Aprobaciones</div>
        </div>

        <div class="card morado">
            <div class="card-number">${stats.observaciones}</div>
            <div class="card-label">Observaciones</div>
        </div>
    `;
}

    // ============================================================
    // RENDERIZADO DE TABLA
    // ============================================================
    
    renderTabla() {
        const tbody = document.getElementById('tablaAuditoria');
        if (!tbody) return;

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = Math.min(inicio + this.itemsPorPagina, this.eventosFiltrados.length);
        const paginaEventos = this.eventosFiltrados.slice(inicio, fin);

        if (paginaEventos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:3rem;color:var(--text-muted);">
                        <div style="font-size:3rem;margin-bottom:0.5rem;">🔍</div>
                        No hay eventos que coincidan con los filtros
                    </td>
                </tr>
            `;
            this.updateEventCount(0);
            return;
        }

        tbody.innerHTML = paginaEventos.map(e => `
            <tr>
                <td><span style="font-size:0.8rem;color:var(--text-muted);">${this.formatearFecha(e.fecha)}</span></td>
                <td><strong>${e.usuario}</strong></td>
                <td><span class="badge badge-${this.getBadgeClass(e.accion)}">${e.accion}</span></td>
                <td><span class="badge badge-info">${e.entidad}</span></td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e.detalle}">${e.detalle}</td>
            </tr>
        `).join('');

        this.updateEventCount(this.eventosFiltrados.length);
        this.updatePagination();
        this.renderGraficoAcciones();
    }

    // ============================================================
    // GRÁFICO DE ACCIONES
    // ============================================================
    
    renderGraficoAcciones() {
        const container = document.getElementById('chartAcciones');
        if (!container) return;

        const acciones = {};
        this.eventosFiltrados.forEach(e => {
            acciones[e.accion] = (acciones[e.accion] || 0) + 1;
        });

        const maxValue = Math.max(...Object.values(acciones), 1);
        const entries = Object.entries(acciones).sort((a, b) => b[1] - a[1]);

        if (entries.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-muted);">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">📊</div>
                    No hay datos para mostrar
                </div>
            `;
            return;
        }

        container.innerHTML = entries.map(([accion, count]) => {
            const porcentaje = (count / maxValue * 100);
            const color = this.accionesMap[accion] || 'azul';
            return `
                <div class="bar-item">
                    <span class="bar-label">${accion}</span>
                    <div class="bar-track">
                        <div class="bar-fill ${color}" style="width: ${Math.max(porcentaje, 5)}%;">
                            ${count}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // FILTROS
    // ============================================================
    
    filtrarAuditoria() {
        const busqueda = document.getElementById('buscarAuditoria')?.value.toLowerCase().trim() || '';
        const accion = document.getElementById('filtroAccion')?.value || '';
        const fechaInicio = document.getElementById('filtroFechaInicio')?.value || '';
        const fechaFin = document.getElementById('filtroFechaFin')?.value || '';

        this.eventosFiltrados = this.eventosAuditoria.filter(e => {
            const matchBusqueda = busqueda === '' || 
                e.usuario.toLowerCase().includes(busqueda) || 
                e.detalle.toLowerCase().includes(busqueda) ||
                e.entidad.toLowerCase().includes(busqueda);
            
            const matchAccion = accion === '' || e.accion === accion;
            
            let matchFecha = true;
            const fechaEvento = e.fecha.split(' ')[0];
            if (fechaInicio && fechaFin) {
                matchFecha = fechaEvento >= fechaInicio && fechaEvento <= fechaFin;
            } else if (fechaInicio) {
                matchFecha = fechaEvento >= fechaInicio;
            } else if (fechaFin) {
                matchFecha = fechaEvento <= fechaFin;
            }
            
            return matchBusqueda && matchAccion && matchFecha;
        });

        this.paginaActual = 1;
        this.renderTabla();
    }

    limpiarFiltros() {
        const inputs = ['buscarAuditoria', 'filtroAccion', 'filtroFechaInicio', 'filtroFechaFin'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        this.eventosFiltrados = [...this.eventosAuditoria];
        this.paginaActual = 1;
        this.renderTabla();
    }

    // ============================================================
    // PAGINACIÓN
    // ============================================================
    
    cambiarPagina(direccion) {
        const totalPaginas = Math.ceil(this.eventosFiltrados.length / this.itemsPorPagina);
        const nuevaPagina = this.paginaActual + direccion;
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            this.paginaActual = nuevaPagina;
            this.renderTabla();
        }
    }

    updatePagination() {
        const totalPaginas = Math.ceil(this.eventosFiltrados.length / this.itemsPorPagina) || 1;
        const pageInfo = document.getElementById('paginaInfo');
        const btnPrev = document.getElementById('btnAnterior');
        const btnNext = document.getElementById('btnSiguiente');

        if (pageInfo) {
            pageInfo.textContent = `Página ${this.paginaActual} de ${totalPaginas}`;
        }
        if (btnPrev) {
            btnPrev.disabled = this.paginaActual <= 1;
        }
        if (btnNext) {
            btnNext.disabled = this.paginaActual >= totalPaginas;
        }
    }

    // ============================================================
    // UTILIDADES
    // ============================================================
    
    formatearFecha(fechaStr) {
        try {
            const fecha = new Date(fechaStr);
            return fecha.toLocaleString('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch {
            return fechaStr;
        }
    }

    getBadgeClass(accion) {
        return this.accionesMap[accion] || 'gris';
    }

    updateEventCount(total) {
        const countEl = document.getElementById('eventoCount');
        if (countEl) {
            countEl.textContent = `Total: ${total}`;
        }
    }

    // ============================================================
    // EXPORTACIÓN DE DATOS
    // ============================================================
    
    exportarDatos() {
        if (this.eventosFiltrados.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const data = this.eventosFiltrados.map(e => ({
            fecha: e.fecha,
            usuario: e.usuario,
            accion: e.accion,
            entidad: e.entidad,
            detalle: e.detalle
        }));

        const csv = this.convertirACSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    convertirACSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(key => `"${String(obj[key] || '').replace(/"/g, '""')}"`).join(','));
        return [headers.join(','), ...rows].join('\n');
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    
    setupEventListeners() {
        // Filtros
        const searchInput = document.getElementById('buscarAuditoria');
        const actionFilter = document.getElementById('filtroAccion');
        const dateStart = document.getElementById('filtroFechaInicio');
        const dateEnd = document.getElementById('filtroFechaFin');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filtrarAuditoria());
        }
        if (actionFilter) {
            actionFilter.addEventListener('change', () => this.filtrarAuditoria());
        }
        if (dateStart) {
            dateStart.addEventListener('change', () => this.filtrarAuditoria());
        }
        if (dateEnd) {
            dateEnd.addEventListener('change', () => this.filtrarAuditoria());
        }

        // Botones
        const filterBtn = document.querySelector('.btn-verde');
        const clearBtn = document.querySelector('.btn-outline');
        
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.filtrarAuditoria());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.limpiarFiltros());
        }

        // Paginación
        const prevBtn = document.getElementById('btnAnterior');
        const nextBtn = document.getElementById('btnSiguiente');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.cambiarPagina(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.cambiarPagina(1));
        }

        // Exportar (opcional)
        const exportBtn = document.createElement('button');
        exportBtn.textContent = '📥 Exportar CSV';
        exportBtn.className = 'btn-verde';
        exportBtn.style.marginLeft = 'auto';
        exportBtn.addEventListener('click', () => this.exportarDatos());
        
        const tableHeader = document.querySelector('.table-header');
        if (tableHeader) {
            tableHeader.appendChild(exportBtn);
        }

        console.log('✅ Event listeners configurados');
    }
}
// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    // Muestra la pantalla de confirmación antes de cerrar la sesión
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) overlay.classList.add('open');
}

function cancelarCerrarSesion() {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) overlay.classList.remove('open');
}

function confirmarCerrarSesion() {
    // Eliminar datos de sesión (si existen)
    localStorage.clear();
    sessionStorage.clear();

    // Redirigir al login
    window.location.href = "../../../login/html/login.html";
}

document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
});
// ============================================================
// INICIALIZAR AL CARGAR EL DOM
// ============================================================

let auditoriaModule;

document.addEventListener('DOMContentLoaded', function() {
    auditoriaModule = new AuditoriaModule();
});

// Funciones globales para compatibilidad con HTML inline
function filtrarAuditoria() {
    if (auditoriaModule) auditoriaModule.filtrarAuditoria();
}

function limpiarFiltrosAuditoria() {
    if (auditoriaModule) auditoriaModule.limpiarFiltros();
}

function cambiarPagina(direccion) {
    if (auditoriaModule) auditoriaModule.cambiarPagina(direccion);
}

// ============================================================
// EXPORTAR MÓDULO
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuditoriaModule;
}
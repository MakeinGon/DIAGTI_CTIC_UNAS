// ============================================================
// AUDITORÍA - BITÁCORA DE ACCIONES ADMINISTRATIVAS
// Módulo para el usuario Administrador
// ============================================================

class AuditoriaAdmin {
    constructor() {
        this.registros = [];
        this.registrosFiltrados = [];
        this.paginaActual = 1;
        this.itemsPorPagina = 8;
        this.modulos = ['Gestión de Usuarios', 'Roles y Permisos', 'Gestión de Catálogos', 'Evidencias Obligatorias'];
        this.init();
    }

    init() {
        this.cargarDatosMock();
        this.llenarFiltros();
        this.renderStats();
        this.renderTabla();
        this.setupEventListeners();
        console.log('📋 Módulo de Auditoría (Administrador) cargado');
        console.log(`📊 ${this.registros.length} registros de acciones administrativas`);
    }

    // ============================================================
    // DATOS MOCK - ACCIONES DEL ADMINISTRADOR
    // ============================================================

    cargarDatosMock() {
        this.registros = [
            { id: 1, fecha: '2026-07-15 10:30:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Usuarios', accion: 'Creó usuario', detalle: 'Usuario: jperez@unas.edu.pe (Rol: Desarrollo)' },
            { id: 2, fecha: '2026-07-15 11:20:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Usuarios', accion: 'Editó usuario', detalle: 'Usuario: mgomez@unas.edu.pe - Cambio de rol: Desarrollo → Infraestructura' },
            { id: 3, fecha: '2026-07-14 09:15:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Usuarios', accion: 'Eliminó usuario', detalle: 'Usuario: lruiz_old@unas.edu.pe (Desactivado por inactividad)' },
            { id: 4, fecha: '2026-07-14 14:00:00', usuario: 'admin@ctic.com', modulo: 'Roles y Permisos', accion: 'Creó rol', detalle: 'Rol: Auditor (Permisos de solo lectura)' },
            { id: 5, fecha: '2026-07-13 16:30:00', usuario: 'admin@ctic.com', modulo: 'Roles y Permisos', accion: 'Editó rol', detalle: 'Rol: Validador - Añadido permiso para observar evidencias' },
            { id: 6, fecha: '2026-07-13 10:00:00', usuario: 'admin@ctic.com', modulo: 'Roles y Permisos', accion: 'Eliminó rol', detalle: 'Rol: Supervisor (Rol obsoleto, sin usuarios asignados)' },
            { id: 7, fecha: '2026-07-12 15:45:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Catálogos', accion: 'Registró catálogo', detalle: 'Catálogo: Tipos de aplicación (Web, Desktop, Móvil, API, Legacy)' },
            { id: 8, fecha: '2026-07-12 11:30:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Catálogos', accion: 'Actualizó catálogo', detalle: 'Catálogo: Estados de sistema - Añadido estado "En mantenimiento"' },
            { id: 9, fecha: '2026-07-11 13:20:00', usuario: 'admin@ctic.com', modulo: 'Evidencias Obligatorias', accion: 'Registró evidencia obligatoria', detalle: 'Evidencia: Manual de usuario para sistemas críticos' },
            { id: 10, fecha: '2026-07-11 09:00:00', usuario: 'admin@ctic.com', modulo: 'Evidencias Obligatorias', accion: 'Actualizó evidencia obligatoria', detalle: 'Evidencia: Plan de contingencia - Actualizada versión 2026' },
            { id: 11, fecha: '2026-07-10 17:00:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Usuarios', accion: 'Creó usuario', detalle: 'Usuario: atorres@unas.edu.pe (Rol: Auditor)' },
            { id: 12, fecha: '2026-07-10 12:15:00', usuario: 'admin@ctic.com', modulo: 'Roles y Permisos', accion: 'Editó rol', detalle: 'Rol: Administrador - Añadido permiso para gestionar catálogos' },
            { id: 13, fecha: '2026-07-09 16:40:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Catálogos', accion: 'Actualizó catálogo', detalle: 'Catálogo: Niveles de riesgo - Actualizados criterios' },
            { id: 14, fecha: '2026-07-09 10:30:00', usuario: 'admin@ctic.com', modulo: 'Evidencias Obligatorias', accion: 'Registró evidencia obligatoria', detalle: 'Evidencia: Acta de conformidad para sistemas legacy' },
            { id: 15, fecha: '2026-07-08 14:00:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Usuarios', accion: 'Editó usuario', detalle: 'Usuario: jvela@unas.edu.pe - Actualización de datos personales' },
            { id: 16, fecha: '2026-07-08 11:20:00', usuario: 'admin@ctic.com', modulo: 'Roles y Permisos', accion: 'Creó rol', detalle: 'Rol: Desarrollador Senior (Permisos avanzados de desarrollo)' },
            { id: 17, fecha: '2026-07-07 15:00:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Catálogos', accion: 'Registró catálogo', detalle: 'Catálogo: Proveedores tecnológicos (Microsoft, Oracle, AWS, Google)' },
            { id: 18, fecha: '2026-07-07 09:45:00', usuario: 'admin@ctic.com', modulo: 'Evidencias Obligatorias', accion: 'Actualizó evidencia obligatoria', detalle: 'Evidencia: Política de seguridad - Actualizada a versión 2.1' },
            { id: 19, fecha: '2026-07-06 12:30:00', usuario: 'admin@ctic.com', modulo: 'Gestión de Usuarios', accion: 'Eliminó usuario', detalle: 'Usuario: usr_temp@unas.edu.pe (Usuario de prueba eliminado)' },
            { id: 20, fecha: '2026-07-06 10:00:00', usuario: 'admin@ctic.com', modulo: 'Roles y Permisos', accion: 'Editó rol', detalle: 'Rol: Auditor - Añadido permiso para exportar reportes' }
        ];
        this.registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        this.registrosFiltrados = [...this.registros];
    }

    // ============================================================
    // RENDERIZADO DE TARJETAS DE RESUMEN
    // ============================================================

    renderStats() {
        const container = document.getElementById('statsAuditoria');
        if (!container) return;
        const total = this.registros.length;
        const ultimo = this.registros.length > 0 ? this.registros[0] : null;
        const ultimaActualizacion = new Date().toLocaleString('es-PE');
        container.innerHTML = `
            <div class="card azul">
                <div class="card-number">${total}</div>
                <div class="card-label">Total de registros</div>
            </div>
            <div class="card verde">
                <div class="card-number" style="font-size:16px; margin:6px 0 8px;">${ultimo ? ultimo.accion : 'Ninguno'}</div>
                <div class="card-label">Último registro realizado</div>
            </div>
            <div class="card verde">
                <div class="card-number" style="font-size:16px; margin:6px 0 8px;">${ultimaActualizacion}</div>
                <div class="card-label">Última actualización</div>
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
        const fin = Math.min(inicio + this.itemsPorPagina, this.registrosFiltrados.length);
        const paginaRegistros = this.registrosFiltrados.slice(inicio, fin);

        if (paginaRegistros.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:3rem;color:var(--muted);">
                        <div style="font-size:3rem;margin-bottom:0.5rem;">📋</div>
                        No hay registros que coincidan con los filtros
                    </td>
                </tr>
            `;
            this.updateCount(0);
            this.updatePagination();
            return;
        }

        tbody.innerHTML = paginaRegistros.map(r => {
            const badgeClase = this.getBadgeClase(r.accion);
            return `
                <tr>
                    <td style="white-space:nowrap;">${this.formatearFecha(r.fecha)}</td>
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

        this.updateCount(this.registrosFiltrados.length);
        this.updatePagination();
        this.asignarEventosTabla();
    }

    asignarEventosTabla() {
        const tbody = document.getElementById('tablaAuditoria');
        if (!tbody) return;
        tbody.querySelectorAll('.btn-ver').forEach(btn => {
            btn.removeEventListener('click', this.handleVerClick);
            btn.addEventListener('click', this.handleVerClick.bind(this));
        });
        tbody.querySelectorAll('.btn-exportar-registro').forEach(btn => {
            btn.removeEventListener('click', this.handleExportarRegistroClick);
            btn.addEventListener('click', this.handleExportarRegistroClick.bind(this));
        });
    }

    handleVerClick(e) {
        const id = parseInt(e.currentTarget.dataset.id);
        this.verDetalle(id);
    }

    handleExportarRegistroClick(e) {
        const id = parseInt(e.currentTarget.dataset.id);
        this.exportarRegistroIndividual(id);
    }

    // ============================================================
    // FILTROS
    // ============================================================

    llenarFiltros() {
        const selectModulo = document.getElementById('filtroModulo');
        if (!selectModulo) return;
        selectModulo.innerHTML = '<option value="">Todos los módulos</option>';
        this.modulos.forEach(m => {
            selectModulo.innerHTML += `<option value="${m}">${m}</option>`;
        });
    }

    filtrarRegistros() {
        const usuario = document.getElementById('filtroUsuario')?.value?.toLowerCase()?.trim() || '';
        const modulo = document.getElementById('filtroModulo')?.value || '';
        const fechaDesde = document.getElementById('filtroFechaDesde')?.value || '';
        const fechaHasta = document.getElementById('filtroFechaHasta')?.value || '';

        this.registrosFiltrados = this.registros.filter(r => {
            const matchUsuario = usuario === '' || r.usuario.toLowerCase().includes(usuario);
            const matchModulo = modulo === '' || r.modulo === modulo;
            let matchFecha = true;
            const fechaRegistro = r.fecha.split(' ')[0];
            if (fechaDesde && fechaHasta) {
                matchFecha = fechaRegistro >= fechaDesde && fechaRegistro <= fechaHasta;
            } else if (fechaDesde) {
                matchFecha = fechaRegistro >= fechaDesde;
            } else if (fechaHasta) {
                matchFecha = fechaRegistro <= fechaHasta;
            }
            return matchUsuario && matchModulo && matchFecha;
        });

        this.paginaActual = 1;
        this.renderTabla();
    }

    limpiarFiltros() {
        const usuarioInput = document.getElementById('filtroUsuario');
        const moduloSelect = document.getElementById('filtroModulo');
        const fechaDesdeInput = document.getElementById('filtroFechaDesde');
        const fechaHastaInput = document.getElementById('filtroFechaHasta');
        if (usuarioInput) usuarioInput.value = '';
        if (moduloSelect) moduloSelect.value = '';
        if (fechaDesdeInput) fechaDesdeInput.value = '';
        if (fechaHastaInput) fechaHastaInput.value = '';
        this.registrosFiltrados = [...this.registros];
        this.paginaActual = 1;
        this.renderTabla();
    }

    // ============================================================
    // ACCIONES: VER DETALLE (MODAL MEJORADO)
    // ============================================================

    verDetalle(id) {
        const registro = this.registros.find(r => r.id === id);
        if (!registro) {
            alert('Registro no encontrado.');
            return;
        }

        const body = document.getElementById('detalleBody');
        if (!body) return;

        // Contenido con estilos en línea para garantizar visibilidad
        body.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:10px; padding:4px 0;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb; padding:10px 0;">
                    <span style="font-weight:600; color:#374151; width:100px;">Fecha</span>
                    <span style="color:#1f2937;">${this.formatearFecha(registro.fecha)}</span>
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
                    <span style="color:#1f2937;"><span class="badge-accion ${this.getBadgeClase(registro.accion)}">${registro.accion}</span></span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:10px 0;">
                    <span style="font-weight:600; color:#374151; width:100px;">Detalle</span>
                    <span style="color:#1f2937;">${registro.detalle}</span>
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

    exportarRegistroIndividual(id) {
        const registro = this.registros.find(r => r.id === id);
        if (!registro) {
            alert('Registro no encontrado.');
            return;
        }
        const headers = ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Detalle'];
        const row = [
            registro.fecha,
            registro.usuario,
            registro.modulo,
            registro.accion,
            registro.detalle
        ];
        this.descargarCSV([row], headers, `registro_${id}.csv`);
        alert(`📤 Registro #${id} exportado a CSV.`);
    }

    // ============================================================
    // EXPORTAR LISTADO COMPLETO (CSV)
    // ============================================================

    exportarListado() {
        const datos = this.registrosFiltrados.length > 0 ? this.registrosFiltrados : this.registros;
        if (datos.length === 0) {
            alert('No hay registros para exportar.');
            return;
        }
        const headers = ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Detalle'];
        const rows = datos.map(r => [
            r.fecha,
            r.usuario,
            r.modulo,
            r.accion,
            r.detalle
        ]);
        this.descargarCSV(rows, headers, `auditoria_admin_${new Date().toISOString().split('T')[0]}.csv`);
        alert(`📤 Listado exportado a CSV (${datos.length} registros).`);
    }

    descargarCSV(rows, headers, filename) {
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
    // PAGINACIÓN
    // ============================================================

    cambiarPagina(direccion) {
        const totalPaginas = Math.ceil(this.registrosFiltrados.length / this.itemsPorPagina) || 1;
        const nuevaPagina = this.paginaActual + direccion;
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            this.paginaActual = nuevaPagina;
            this.renderTabla();
        }
    }

    updatePagination() {
        const totalPaginas = Math.ceil(this.registrosFiltrados.length / this.itemsPorPagina) || 1;
        const pageInfo = document.getElementById('paginaInfo');
        const btnPrev = document.getElementById('btnAnterior');
        const btnNext = document.getElementById('btnSiguiente');
        if (pageInfo) pageInfo.textContent = `Página ${this.paginaActual} de ${totalPaginas}`;
        if (btnPrev) btnPrev.disabled = this.paginaActual <= 1;
        if (btnNext) btnNext.disabled = this.paginaActual >= totalPaginas;
    }

    updateCount(total) {
        const countEl = document.getElementById('registroCount');
        if (countEl) countEl.textContent = `Total: ${total}`;
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
                hour12: false
            });
        } catch {
            return fechaStr;
        }
    }

    getBadgeClase(accion) {
        if (accion.includes('Creó') || accion.includes('Registró')) return 'creacion';
        if (accion.includes('Editó') || accion.includes('Actualizó')) return 'edicion';
        if (accion.includes('Eliminó')) return 'eliminacion';
        if (accion.includes('Aprobó')) return 'aprobacion';
        if (accion.includes('Observó')) return 'observacion';
        if (accion.includes('Rechazó')) return 'rechazo';
        return 'resolucion';
    }

    refrescar() {
        this.registrosFiltrados = [...this.registros];
        this.paginaActual = 1;
        this.renderTabla();
        this.renderStats();
        alert('🔄 Datos actualizados.');
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    setupEventListeners() {
        const btnFiltrar = document.getElementById('btnFiltrar');
        if (btnFiltrar) btnFiltrar.addEventListener('click', () => this.filtrarRegistros());

        const btnLimpiar = document.getElementById('btnLimpiarFiltros');
        if (btnLimpiar) btnLimpiar.addEventListener('click', () => this.limpiarFiltros());

        const filtroUsuario = document.getElementById('filtroUsuario');
        if (filtroUsuario) {
            filtroUsuario.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') this.filtrarRegistros();
            });
        }

        const btnExportar = document.getElementById('btnExportarListado');
        if (btnExportar) btnExportar.addEventListener('click', () => this.exportarListado());

        const btnRefrescar = document.getElementById('btnRefrescar');
        if (btnRefrescar) btnRefrescar.addEventListener('click', () => this.refrescar());

        const btnAnterior = document.getElementById('btnAnterior');
        if (btnAnterior) btnAnterior.addEventListener('click', () => this.cambiarPagina(-1));

        const btnSiguiente = document.getElementById('btnSiguiente');
        if (btnSiguiente) btnSiguiente.addEventListener('click', () => this.cambiarPagina(1));

        // Cerrar modal detalle
        const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');
        if (btnCerrarDetalle) {
            btnCerrarDetalle.addEventListener('click', () => {
                const modal = document.getElementById('modalDetalle');
                if (modal) modal.style.display = 'none';
            });
        }

        const btnCerrarDetalleFooter = document.getElementById('btnCerrarDetalleFooter');
        if (btnCerrarDetalleFooter) {
            btnCerrarDetalleFooter.addEventListener('click', () => {
                const modal = document.getElementById('modalDetalle');
                if (modal) modal.style.display = 'none';
            });
        }

        const modalDetalle = document.getElementById('modalDetalle');
        if (modalDetalle) {
            modalDetalle.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
            });
        }

        // Cerrar sesión
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', () => this.cerrarSesion());

        const btnCancelar1 = document.getElementById('btnCancelarCerrarSesion1');
        if (btnCancelar1) btnCancelar1.addEventListener('click', () => this.cancelarCerrarSesion());

        const btnCancelar2 = document.getElementById('btnCancelarCerrarSesion2');
        if (btnCancelar2) btnCancelar2.addEventListener('click', () => this.cancelarCerrarSesion());

        const btnConfirmar = document.getElementById('btnConfirmarCerrarSesion');
        if (btnConfirmar) btnConfirmar.addEventListener('click', () => this.confirmarCerrarSesion());

        const overlay = document.getElementById('logout-confirm-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.cancelarCerrarSesion();
            });
        }

        console.log('✅ Todos los event listeners configurados correctamente');
    }

    // ============================================================
    // CERRAR SESIÓN
    // ============================================================

    cerrarSesion() {
        const overlay = document.getElementById('logout-confirm-overlay');
        if (overlay) overlay.classList.add('open');
    }

    cancelarCerrarSesion() {
        const overlay = document.getElementById('logout-confirm-overlay');
        if (overlay) overlay.classList.remove('open');
    }

    confirmarCerrarSesion() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../../../login/html/login.html";
    }
}

// ============================================================
// INICIALIZAR AL CARGAR EL DOM
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    window.auditoriaAdmin = new AuditoriaAdmin();
});
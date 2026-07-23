// ============================================================
// DIAGTI · CTIC UNAS — Dashboard de Infraestructura (API real)
// ============================================================

async function cargarDashboard() {
    try {
        const data = await diagtiInfraDashboard();
        actualizarDashboard(data || {});
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        actualizarDashboard({
            estadisticas: {},
            prioridades: [],
            riesgos: [],
            estados: []
        });
        const list = document.getElementById('priorityList');
        if (list) {
            list.innerHTML = `<div class="empty-state">No se pudo cargar el dashboard: ${error.message}</div>`;
        }
    }
}

function actualizarDashboard(data) {
    const stats = data.estadisticas || {};
    const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.textContent = v ?? 0;
    };
    set('kpiTotal', stats.totalSistemas || 0);
    set('kpiNuevos', stats.nuevos || 0);
    set('kpiBorradores', stats.borradores || 0);
    set('kpiPendientes', stats.pendientesRegistro || 0);
    set('kpiObservados', stats.observados || 0);
    set('kpiValidados', stats.validados || 0);

    const prioridades = data.prioridades || [];
    const priorityList = document.getElementById('priorityList');
    if (priorityList) {
        if (prioridades.length === 0) {
            priorityList.innerHTML = '<div class="empty-state">No hay acciones pendientes.</div>';
        } else {
            priorityList.innerHTML = prioridades.map(p => `
                <div class="priority-item">
                    <div class="priority-main">
                        <span class="priority-status ${esc(p.estado)}">${esc(p.estado)}</span>
                        <div class="priority-text">
                            <strong>${esc(p.codigo)} — ${esc(p.nombre)}</strong>
                            <small>${esc(p.detalle)}</small>
                        </div>
                    </div>
                    <a class="priority-action" href="${esc(p.url)}">${esc(p.accion)}</a>
                </div>
            `).join('');
        }
    }

    const estados = data.estados || [];
    const maxState = Math.max(1, ...estados.map(e => e.cantidad || 0), 1);
    const stateContainer = document.getElementById('stateBars');
    const stateOrder = ['Pendiente de evaluación', 'Nuevo', 'Borrador', 'Enviado', 'Observado', 'Corregido', 'Validado'];
    if (stateContainer) {
        stateContainer.innerHTML = stateOrder.map(nombre => {
            const encontrado = estados.find(e => e.nombre === nombre);
            const cantidad = encontrado ? encontrado.cantidad : 0;
            const porcentaje = (cantidad / maxState) * 100;
            return `
                <div class="bar-row">
                    <span class="bar-label">${nombre}</span>
                    <div class="bar-track">
                        <span class="bar-fill ${nombre.toLowerCase()}" style="width: ${porcentaje}%"></span>
                    </div>
                    <span class="bar-count">${cantidad}</span>
                </div>
            `;
        }).join('');
    }

    const riesgos = data.riesgos || [];
    const riskContainer = document.getElementById('riskSummary');
    const riskOrder = ['Bajo', 'Medio', 'Alto', 'Crítico'];
    if (riskContainer) {
        riskContainer.innerHTML = riskOrder.map(nombre => {
            const encontrado = riesgos.find(r => r.nombre === nombre);
            const cantidad = encontrado ? encontrado.cantidad : 0;
            const clase = encontrado ? (encontrado.clase || nombre.toLowerCase()) : nombre.toLowerCase();
            return `
                <div class="risk-card ${clase}">
                    <span>Riesgo ${nombre.toLowerCase()}</span>
                    <strong>${cantidad}</strong>
                </div>
            `;
        }).join('');
    }
}

function esc(v = '') {
    return String(v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[c]));
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDashboard();
    setInterval(cargarDashboard, 60000);
});

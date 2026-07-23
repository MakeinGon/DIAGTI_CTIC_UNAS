// DIAGTI · Historial Infraestructura — API real (auditoria)

const els = {
    search: document.getElementById('buscar'),
    system: document.getElementById('sistemaFiltro'),
    action: document.getElementById('accion'),
    state: document.getElementById('estado'),
    from: document.getElementById('fechaDesde'),
    to: document.getElementById('fechaHasta'),
    body: document.getElementById('historialBody'),
    empty: document.getElementById('sinResultados'),
    summary: document.getElementById('resumenResultados')
};

let history = [];
let sistemasOptions = [];

function esc(v = '') {
    return String(v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[c]));
}

function badgeClass(s) {
    return ({
        Nuevo: 'neutral', 'Pendiente de evaluación': 'neutral', Borrador: 'neutral', Enviado: 'sent', Observado: 'warning',
        Corregido: 'corrected', Validado: 'success'
    }[s] || 'neutral');
}

function formatDate(v) {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

async function loadData() {
    try {
        const [hist, sistemas] = await Promise.all([
            diagtiInfraHistorial({ q: els.search?.value || '', accion: els.action?.value || '' }),
            diagtiInfraListarSistemas({})
        ]);
        history = hist;
        sistemasOptions = sistemas;
        els.system.innerHTML = '<option value="">Todos los sistemas</option>';
        sistemas.forEach(s => {
            els.system.insertAdjacentHTML('beforeend',
                `<option value="${s.sistemaId}">${esc(s.codigo)} — ${esc(s.nombre)}</option>`);
        });
        render();
    } catch (err) {
        history = [];
        render();
        if (els.summary) els.summary.textContent = err.message || 'Error al cargar historial';
    }
}

function filtered() {
    const q = (els.search.value || '').trim().toLowerCase();
    const from = els.from.value ? new Date(`${els.from.value}T00:00:00`) : null;
    const to = els.to.value ? new Date(`${els.to.value}T23:59:59`) : null;
    return history.filter(x => {
        const text = `${x.code || ''} ${x.name || ''} ${x.action || ''} ${x.detail || ''} ${x.user || ''} ${x.state || ''}`.toLowerCase();
        const d = x.date ? new Date(x.date) : null;
        const okQ = !q || text.includes(q);
        const okSys = !els.system.value || String(x.sistemaId || '') === String(els.system.value)
            || (x.detail || '').includes(els.system.selectedOptions[0]?.textContent?.split('—')[0]?.trim() || '__none__');
        const okAction = !els.action.value || (x.action || '') === els.action.value;
        const okState = !els.state.value || (x.state || '') === els.state.value;
        const okFrom = !from || !d || d >= from;
        const okTo = !to || !d || d <= to;
        return okQ && okSys && okAction && okState && okFrom && okTo;
    });
}

function render() {
    const list = filtered();
    els.body.innerHTML = list.map(x => `
        <tr>
            <td>${formatDate(x.date)}</td>
            <td><strong>${esc(x.code || '—')}</strong><span class="system-name">${esc(x.name || x.section || '')}</span></td>
            <td>${esc(x.action)}</td>
            <td>${esc(x.detail)}</td>
            <td>${esc(x.user)}</td>
            <td><span class="badge ${badgeClass(x.state)}">${esc(x.state || '—')}</span></td>
            <td><button class="btn outline detail-btn" data-id="${esc(x.id)}" type="button">Ver detalle</button></td>
        </tr>
    `).join('');
    els.empty.classList.toggle('hidden', list.length > 0);
    els.summary.textContent = `Mostrando ${list.length} de ${history.length} movimientos.`;
    document.querySelectorAll('.detail-btn').forEach(b => b.onclick = () => openDetail(b.dataset.id));
}

function openDetail(id) {
    const x = history.find(i => String(i.id) === String(id));
    if (!x) return;
    document.getElementById('detalleMovimiento').innerHTML = `
        <dl class="detail-list">
            <dt>Fecha y hora</dt><dd>${formatDate(x.date)}</dd>
            <dt>Acción</dt><dd>${esc(x.action)}</dd>
            <dt>Sección</dt><dd>${esc(x.section || 'Infraestructura')}</dd>
            <dt>Detalle</dt><dd>${esc(x.detail)}</dd>
            <dt>Usuario</dt><dd>${esc(x.user)}</dd>
        </dl>`;
    document.getElementById('verSistemaDetalle').href = x.sistemaId
        ? `mis-sistemas.html?sistemaId=${encodeURIComponent(x.sistemaId)}`
        : 'mis-sistemas.html';
    document.getElementById('modalDetalle').classList.add('show');
}

[els.search, els.system, els.action, els.state, els.from, els.to].forEach(x => {
    if (!x) return;
    x.addEventListener(x.tagName === 'INPUT' ? 'input' : 'change', render);
});
document.getElementById('limpiar').onclick = () => {
    els.search.value = '';
    els.system.value = '';
    els.action.value = '';
    els.state.value = '';
    els.from.value = '';
    els.to.value = '';
    loadData();
};
document.querySelectorAll('[data-close]').forEach(b => {
    b.onclick = () => document.getElementById(b.dataset.close).classList.remove('show');
});
document.querySelectorAll('.modal').forEach(m => {
    m.onclick = e => { if (e.target === m) m.classList.remove('show'); };
});

document.addEventListener('DOMContentLoaded', loadData);

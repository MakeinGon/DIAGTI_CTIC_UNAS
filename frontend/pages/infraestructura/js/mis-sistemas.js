// DIAGTI · Mis Sistemas (Infraestructura) — API real

let sistemasCache = [];
let currentSistema = null;
let subEvidence = [];
let editSub = -1;

const message = document.getElementById('mensaje');

function esc(v = '') {
    return String(v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[c]));
}

function stateClass(s) {
    return {
        Validado: 'success', Observado: 'observed', Borrador: 'neutral',
        Corregido: 'corrected', Enviado: 'sent', Nuevo: 'neutral', Subsanado: 'corrected'
    }[s] || 'neutral';
}

function riskClass(r) {
    return { Bajo: 'low', Medio: 'warning', Alto: 'danger', Crítico: 'danger' }[r] || 'warning';
}

function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

document.querySelectorAll('[data-close]').forEach(b => {
    b.onclick = () => closeModal(b.dataset.close);
});
document.querySelectorAll('.modal').forEach(m => {
    m.onclick = e => { if (e.target === m) closeModal(m.id); };
});

async function cargarSistemas() {
    const q = document.getElementById('buscar')?.value || '';
    const estado = document.getElementById('estado')?.value || '';
    const riesgo = document.getElementById('riesgo')?.value || '';
    try {
        sistemasCache = await diagtiInfraListarSistemas({ q, estado, riesgo });
        renderTabla(sistemasCache);
        if (message) {
            message.className = 'message';
            message.textContent = sistemasCache.length ? '' : 'No hay sistemas registrados.';
        }
    } catch (err) {
        sistemasCache = [];
        renderTabla([]);
        if (message) {
            message.className = 'message error-text';
            message.textContent = err.message || 'Error al cargar sistemas';
        }
    }
}

function renderTabla(list) {
    const tbody = document.querySelector('#tablaSistemas tbody');
    const empty = document.getElementById('sinResultados');
    if (!tbody) return;
    if (!list.length) {
        tbody.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
    }
    if (empty) empty.classList.add('hidden');
    tbody.innerHTML = list.map(s => `
        <tr data-id="${s.sistemaId}" data-code="${esc(s.codigo)}" data-estado="${esc(s.estadoSistemaUi)}" data-name="${esc(s.nombre)}" data-riesgo="${esc(s.nivelRiesgo)}">
            <td>${esc(s.codigo)}</td>
            <td><strong>${esc(s.nombre)}</strong></td>
            <td>${esc(s.plataforma || 'Sin registrar')}</td>
            <td>${esc(s.exposicion || 'Sin registrar')}</td>
            <td><span class="badge ${stateClass(s.estadoSistemaUi)} estado-badge">${esc(s.estadoSistemaUi)}</span></td>
            <td><span class="badge ${riskClass(s.nivelRiesgo)}">${esc(s.nivelRiesgo || 'Medio')}</span></td>
            <td class="actions-cell"></td>
        </tr>
    `).join('');
    tbody.querySelectorAll('tr').forEach(r => renderActions(r));
}

function renderActions(r) {
    const c = r.querySelector('.actions-cell');
    const s = r.dataset.estado;
    const id = r.dataset.id;
    let html = '<button class="btn outline ver" type="button">Ver</button>';
    if (s === 'Nuevo') html += `<a class="btn primary" href="infraestructura.html?sistemaId=${id}">Registrar</a>`;
    if (s === 'Borrador') html += `<a class="btn secondary" href="infraestructura.html?sistemaId=${id}">Completar</a>`;
    if (s === 'Observado') html += '<button class="btn warning-btn observar" type="button">Ver observaciones</button>';
    if (s === 'Corregido' || s === 'Subsanado') {
        html += '<button class="btn secondary revisar" type="button">Revisar subsanación</button>';
    }
    c.innerHTML = html;
    c.querySelector('.ver')?.addEventListener('click', () => showDetail(id));
    c.querySelector('.observar')?.addEventListener('click', () => openObservaciones(id));
    c.querySelector('.revisar')?.addEventListener('click', () => openObservaciones(id, true));
}

async function showDetail(sistemaId) {
    try {
        const d = await diagtiInfraDetalle(sistemaId);
        const obs = (d.observaciones || []).slice(0, 5).map(o =>
            `<li><strong>${esc(o.estadoObservacion || o.estado)}</strong> — ${esc(o.descripcion || '')}</li>`
        ).join('');
        document.getElementById('detalleSistema').innerHTML = `
            <dl>
                <dt>Código</dt><dd>${esc(d.codigo)}</dd>
                <dt>Sistema</dt><dd>${esc(d.nombre)}</dd>
                <dt>Área</dt><dd>${esc(d.area || '—')}</dd>
                <dt>Estado</dt><dd>${esc(d.estadoSistemaUi)}</dd>
                <dt>Validación</dt><dd>${esc(d.estadoValidacion || '—')}</dd>
                <dt>Riesgo</dt><dd>${esc(d.nivelRiesgo || '—')}</dd>
                <dt>Plataforma</dt><dd>${esc(d.evaluacion?.datos?.plataforma || 'Sin registrar')}</dd>
                <dt>Exposición</dt><dd>${esc(d.evaluacion?.datos?.exposicion || 'Sin registrar')}</dd>
            </dl>
            <h4>Observaciones</h4>
            ${obs ? `<ul>${obs}</ul>` : '<p>Sin observaciones.</p>'}
        `;
        openModal('modalVer');
    } catch (err) {
        if (message) {
            message.className = 'message error-text';
            message.textContent = err.message;
        }
    }
}

async function openObservaciones(sistemaId, modoRevision = false) {
    currentSistema = sistemaId;
    try {
        const detalle = await diagtiInfraDetalle(sistemaId);
        const obs = (detalle.observaciones || []).filter(o => {
            const area = (o.area || '').toUpperCase();
            const desc = o.descripcion || '';
            return area.includes('INFRA') || desc.includes('[INFRAESTRUCTURA]') || !modoRevision;
        });
        const pendientes = obs.filter(o => {
            const e = (o.estadoObservacion || o.estado || '').toUpperCase();
            return e === 'PENDIENTE' || e === 'EN_REVISION';
        });
        const first = pendientes[0] || obs[0];
        document.getElementById('codigoSubsanar').value = detalle.codigo || '';
        document.getElementById('tituloSubsanar').textContent = modoRevision
            ? 'Revisar subsanación'
            : 'Observaciones de infraestructura';
        document.getElementById('textoObservacion').textContent = first
            ? first.descripcion
            : 'No hay observaciones registradas para este sistema.';
        document.getElementById('fechaObservacion').textContent = first?.fechaObservacion
            ? `Fecha: ${first.fechaObservacion}`
            : '';

        const form = document.getElementById('formSubsanar');
        let actions = document.getElementById('infraObsActions');
        if (!actions) {
            actions = document.createElement('div');
            actions.id = 'infraObsActions';
            actions.className = 'modal-actions';
            form.appendChild(actions);
        }
        if (modoRevision && first && (first.estadoObservacion || first.estado || '').toUpperCase() === 'EN_REVISION') {
            actions.innerHTML = `
                <button class="btn secondary" type="button" data-close="modalSubsanar">Cancelar</button>
                <button class="btn warning-btn" type="button" id="btnRechazarObs">Rechazar</button>
                <button class="btn primary" type="button" id="btnAprobarObs">Aprobar subsanación</button>
            `;
            document.getElementById('btnAprobarObs').onclick = async () => {
                await diagtiInfraAprobarSubsanacion(first.idObservacion || first.id);
                closeModal('modalSubsanar');
                message.className = 'message success-text';
                message.textContent = 'Subsanación aprobada.';
                cargarSistemas();
            };
            document.getElementById('btnRechazarObs').onclick = async () => {
                const c = prompt('Comentario de rechazo (opcional):') || '';
                await diagtiInfraRechazarSubsanacion(first.idObservacion || first.id, c);
                closeModal('modalSubsanar');
                message.className = 'message success-text';
                message.textContent = 'Subsanación rechazada.';
                cargarSistemas();
            };
        } else {
            actions.innerHTML = `
                <button class="btn secondary" type="button" data-close="modalSubsanar">Cerrar</button>
                <button class="btn primary" type="button" id="btnNuevaObs">Registrar observación</button>
            `;
            document.getElementById('btnNuevaObs').onclick = async () => {
                const texto = document.getElementById('descripcionCorreccion').value.trim();
                if (!texto) {
                    document.getElementById('errorSubsanar').textContent = 'Ingrese la descripción de la observación.';
                    return;
                }
                await diagtiInfraRegistrarObservacion(sistemaId, { descripcion: texto });
                closeModal('modalSubsanar');
                message.className = 'message success-text';
                message.textContent = 'Observación registrada con prefijo [INFRAESTRUCTURA].';
                cargarSistemas();
            };
        }
        document.getElementById('descripcionCorreccion').value = '';
        document.getElementById('errorSubsanar').textContent = '';
        openModal('modalSubsanar');
    } catch (err) {
        if (message) {
            message.className = 'message error-text';
            message.textContent = err.message;
        }
    }
}

document.getElementById('formSubsanar')?.addEventListener('submit', e => e.preventDefault());

['buscar', 'estado', 'riesgo'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => cargarSistemas());
});

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const requestedState = params.get('estado');
    if (requestedState && document.getElementById('estado')) {
        document.getElementById('estado').value = requestedState;
    }
    await cargarSistemas();
    const sistemaId = params.get('sistemaId') || params.get('sistema');
    if (sistemaId) {
        const row = document.querySelector(`tr[data-id="${sistemaId}"]`)
            || document.querySelector(`tr[data-code="${sistemaId}"]`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => showDetail(row.dataset.id), 250);
        }
    }
});

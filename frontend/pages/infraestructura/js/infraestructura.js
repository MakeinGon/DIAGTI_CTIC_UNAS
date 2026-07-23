// DIAGTI · Registro técnico de Infraestructura — API real

const steps = ['infra', 'deploy', 'security', 'evidence'];
const stepNames = { infra: 'Infraestructura', deploy: 'Despliegue', security: 'Seguridad', evidence: 'Evidencias' };

let currentStep = 0;
let currentSystemId = '';
let pendingSystemId = '';
let dirty = false;
let evidences = [];
let editingEvidence = -1;
let sistemasElegibles = [];

const form = document.getElementById('formTecnico');
const systemSelect = document.getElementById('sistema');
const message = document.getElementById('mensaje');
const btnAnterior = document.getElementById('btnAnterior');
const btnContinuar = document.getElementById('btnContinuar');
const btnDraft = document.getElementById('btnGuardarBorrador');
const btnSend = document.getElementById('btnEnviar');

function showModal(id) { document.getElementById(id).classList.add('show'); }
function hideModal(id) { document.getElementById(id).classList.remove('show'); }

function showStep(i) {
    currentStep = Math.max(0, Math.min(steps.length - 1, i));
    document.querySelectorAll('.step-panel').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.step').forEach(x => x.classList.remove('active'));
    document.getElementById(steps[currentStep]).classList.add('active');
    document.querySelector(`.step[data-step="${steps[currentStep]}"]`).classList.add('active');
    btnAnterior.classList.toggle('hidden', currentStep === 0);
    btnContinuar.classList.toggle('hidden', currentStep === steps.length - 1);
    btnDraft.classList.toggle('hidden', currentStep !== steps.length - 1);
    btnSend.classList.toggle('hidden', currentStep !== steps.length - 1);
    message.textContent = '';
}

function formData() {
    const d = {};
    [...form.elements].forEach(el => {
        if (el.name && el.type !== 'file' && el.tagName !== 'BUTTON') d[el.name] = el.value;
    });
    return d;
}

function fillForm(d = {}) {
    form.reset();
    [...form.elements].forEach(el => {
        if (el.name && el.type !== 'file' && d[el.name] !== undefined) el.value = d[el.name];
    });
    evidences = Array.isArray(d.evidences) ? d.evidences : [];
    renderEvidences();
}

function updateStatus(estado) {
    const badge = document.getElementById('estadoRegistro');
    const isDraft = !estado || estado === 'BORRADOR' || estado === 'SIN_REGISTRO' || estado === 'Nuevo';
    badge.textContent = isDraft ? 'Borrador' : (estado === 'ENVIADO' ? 'Enviado' : estado);
    badge.className = `status-badge ${isDraft ? 'draft' : 'new'}`;
    document.getElementById('selectorAyuda').textContent = isDraft
        ? 'Complete los cuatro pasos y guarde el borrador o envíe a validación.'
        : 'Registro técnico cargado desde el servidor.';
}

async function populateSystems() {
    const todos = await diagtiInfraListarSistemas({});
    sistemasElegibles = todos.filter(s => ['Nuevo', 'Borrador'].includes(s.estadoSistemaUi));
    systemSelect.innerHTML = '<option value="">Seleccione un sistema</option>';
    sistemasElegibles.forEach(s => {
        systemSelect.insertAdjacentHTML('beforeend',
            `<option value="${s.sistemaId}">${s.codigo} — ${s.nombre} (${s.estadoSistemaUi})</option>`);
    });
    // También permitir reabrir sistemas ya enviados solo para consulta vía query
    const params = new URLSearchParams(location.search);
    const sid = params.get('sistemaId');
    if (sid && !sistemasElegibles.find(s => String(s.sistemaId) === String(sid))) {
        const extra = todos.find(s => String(s.sistemaId) === String(sid));
        if (extra) {
            systemSelect.insertAdjacentHTML('beforeend',
                `<option value="${extra.sistemaId}">${extra.codigo} — ${extra.nombre} (${extra.estadoSistemaUi})</option>`);
        }
    }
}

async function loadSystem(id) {
    currentSystemId = String(id || '');
    if (!currentSystemId) {
        fillForm({});
        updateStatus('Nuevo');
        showStep(0);
        return;
    }
    try {
        const detalle = await diagtiInfraDetalle(currentSystemId);
        const datos = detalle.evaluacion?.datos || {};
        const mapped = {
            ...datos,
            evidences: (detalle.evidencias || []).map(e => ({
                tipo: e.tipo,
                nombre: e.nombre,
                archivo: e.archivo,
                url: e.url,
                descripcion: e.descripcion
            }))
        };
        if (!mapped.evidences.length && Array.isArray(datos.evidences)) {
            mapped.evidences = datos.evidences;
        }
        fillForm(mapped);
        updateStatus(detalle.evaluacion?.estadoRegistro || detalle.estadoSistemaUi);
        showStep(0);
        dirty = false;
        markCompleted();
        const ui = detalle.estadoSistemaUi;
        if (!['Nuevo', 'Borrador'].includes(ui)) {
            message.className = 'message error';
            message.textContent = 'Este sistema ya inició el flujo. Solo se permite editar sistemas Nuevos o en Borrador.';
            btnDraft.classList.add('hidden');
            btnSend.classList.add('hidden');
        }
    } catch (err) {
        message.className = 'message error';
        message.textContent = err.message;
    }
}

function buildPayload(estadoRegistro) {
    const data = { ...formData(), evidences };
    return {
        estadoRegistro,
        resultado: estadoRegistro === 'ENVIADO' ? 'PENDIENTE' : 'BORRADOR',
        datos: data,
        evidencias: evidences.map(e => ({
            tipo: e.tipo,
            nombre: e.nombre,
            archivo: e.archivo,
            url: e.url,
            descripcion: e.descripcion
        }))
    };
}

async function saveDraft(show = true) {
    if (!currentSystemId) {
        message.className = 'message error';
        message.textContent = 'Seleccione un sistema.';
        return;
    }
    try {
        await diagtiInfraGuardarEvaluacion(currentSystemId, buildPayload('BORRADOR'));
        dirty = false;
        updateStatus('BORRADOR');
        hideModal('modalIncompleto');
        if (show) {
            message.className = 'message success';
            message.textContent = 'Borrador guardado en el servidor.';
        }
    } catch (err) {
        message.className = 'message error';
        message.textContent = err.message;
    }
}

function requiredFields(step) {
    return [...document.querySelectorAll(`#${step} [required]`)];
}

function validateStep(step, mark = true) {
    let ok = true;
    requiredFields(step).forEach(el => {
        const good = el.checkValidity() && String(el.value).trim() !== '';
        if (mark) el.classList.toggle('invalid', !good);
        if (!good) ok = false;
    });
    if (step === 'evidence' && evidences.length === 0) ok = false;
    return ok;
}

function pending() {
    const p = [];
    if (!currentSystemId) p.push('Sistema');
    steps.forEach(s => { if (!validateStep(s, false)) p.push(stepNames[s]); });
    return p;
}

function markCompleted() {
    steps.forEach(s => document.querySelector(`.step[data-step="${s}"]`)
        .classList.toggle('completed', validateStep(s, false)));
}

function requestSystemChange(next) {
    if (!currentSystemId || next === currentSystemId) {
        if (next) loadSystem(next);
        return;
    }
    pendingSystemId = next;
    document.getElementById('textoCambio').textContent = dirty
        ? 'Tiene cambios sin guardar. Si cambia de sistema, perderá la información no guardada.'
        : 'Este registro ya está guardado. ¿Desea abrir otro sistema?';
    showModal('modalCambio');
}

systemSelect.addEventListener('change', e => {
    const next = e.target.value;
    if (!next) { e.target.value = currentSystemId; return; }
    e.target.value = currentSystemId;
    requestSystemChange(next);
});

document.getElementById('btnPermanecer').onclick = () => {
    pendingSystemId = '';
    systemSelect.value = currentSystemId;
    hideModal('modalCambio');
};
document.getElementById('btnCambiar').onclick = () => {
    hideModal('modalCambio');
    systemSelect.value = pendingSystemId;
    loadSystem(pendingSystemId);
    pendingSystemId = '';
};

document.querySelectorAll('.step').forEach(b => b.onclick = () => showStep(steps.indexOf(b.dataset.step)));
btnContinuar.onclick = () => {
    if (!currentSystemId) {
        message.className = 'message error';
        message.textContent = 'Seleccione un sistema antes de continuar.';
        return;
    }
    if (!validateStep(steps[currentStep], true)) {
        message.className = 'message error';
        message.textContent = 'Complete los campos obligatorios antes de continuar.';
        return;
    }
    markCompleted();
    showStep(currentStep + 1);
};
btnAnterior.onclick = () => showStep(currentStep - 1);
document.getElementById('btnCancelar').onclick = () => {
    if (confirm('¿Desea descartar los cambios no guardados?')) loadSystem(currentSystemId);
};
form.addEventListener('input', e => { dirty = true; e.target.classList.remove('invalid'); });
form.addEventListener('change', e => { dirty = true; e.target.classList.remove('invalid'); });

function evidenceInput() {
    return {
        tipo: document.getElementById('evTipo'),
        nombre: document.getElementById('evNombre'),
        archivo: document.getElementById('evArchivo'),
        url: document.getElementById('evUrl'),
        descripcion: document.getElementById('evDescripcion')
    };
}

function clearEvidence() {
    const x = evidenceInput();
    x.tipo.value = '';
    x.nombre.value = '';
    x.archivo.value = '';
    x.url.value = '';
    x.descripcion.value = '';
    editingEvidence = -1;
    document.getElementById('btnAgregarEvidencia').textContent = 'Agregar evidencia';
}

function renderEvidences() {
    const body = document.getElementById('tablaEvidencias');
    document.getElementById('contadorEvidencias').textContent = evidences.length;
    if (!evidences.length) {
        body.innerHTML = '<tr class="empty-row"><td colspan="5">Todavía no se agregaron evidencias.</td></tr>';
        return;
    }
    body.innerHTML = evidences.map((e, i) => `
        <tr>
            <td>${e.tipo}</td><td>${e.nombre}</td><td>${e.archivo || e.url}</td>
            <td>${e.descripcion || '—'}</td>
            <td>
                <button type="button" class="table-btn edit-ev" data-i="${i}">Editar</button>
                <button type="button" class="table-btn delete-ev" data-i="${i}">Eliminar</button>
            </td>
        </tr>`).join('');
    body.querySelectorAll('.edit-ev').forEach(b => b.onclick = () => editEvidence(+b.dataset.i));
    body.querySelectorAll('.delete-ev').forEach(b => b.onclick = () => {
        evidences.splice(+b.dataset.i, 1);
        dirty = true;
        renderEvidences();
        markCompleted();
    });
}

function editEvidence(i) {
    const e = evidences[i];
    const x = evidenceInput();
    x.tipo.value = e.tipo;
    x.nombre.value = e.nombre;
    x.url.value = e.url || '';
    x.descripcion.value = e.descripcion || '';
    x.archivo.value = '';
    editingEvidence = i;
    document.getElementById('btnAgregarEvidencia').textContent = 'Actualizar evidencia';
}

document.getElementById('btnAgregarEvidencia').onclick = () => {
    const x = evidenceInput();
    const file = x.archivo.files[0]?.name || '';
    const err = document.getElementById('errorEvidencia');
    if (!x.tipo.value || !x.nombre.value.trim() || (!file && !x.url.value.trim())) {
        err.textContent = 'Complete tipo, nombre y agregue un archivo o una URL.';
        return;
    }
    const old = editingEvidence >= 0 ? evidences[editingEvidence] : {};
    const ev = {
        tipo: x.tipo.value,
        nombre: x.nombre.value.trim(),
        archivo: file || old.archivo || '',
        url: x.url.value.trim(),
        descripcion: x.descripcion.value.trim()
    };
    if (editingEvidence >= 0) evidences[editingEvidence] = ev;
    else evidences.push(ev);
    err.textContent = '';
    dirty = true;
    clearEvidence();
    renderEvidences();
    markCompleted();
};

btnDraft.onclick = () => saveDraft();
btnSend.onclick = () => {
    const p = pending();
    if (p.length) {
        document.getElementById('listaPendientes').innerHTML = p.map(x => `<li>${x}</li>`).join('');
        showModal('modalIncompleto');
        return;
    }
    showModal('modalEnviar');
};
document.getElementById('btnRegresar').onclick = () => {
    hideModal('modalIncompleto');
    const i = steps.findIndex(s => !validateStep(s, false));
    showStep(i < 0 ? 0 : i);
    validateStep(steps[currentStep], true);
};
document.getElementById('btnBorradorModal').onclick = () => saveDraft();
document.getElementById('btnCancelarEnvio').onclick = () => hideModal('modalEnviar');
document.getElementById('btnConfirmarEnvio').onclick = async () => {
    try {
        await diagtiInfraGuardarEvaluacion(currentSystemId, buildPayload('ENVIADO'));
        dirty = false;
        hideModal('modalEnviar');
        message.className = 'message success';
        message.textContent = 'Registro enviado. Redirigiendo...';
        setTimeout(() => location.href = 'mis-sistemas.html', 900);
    } catch (err) {
        message.className = 'message error';
        message.textContent = err.message;
        hideModal('modalEnviar');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await populateSystems();
        const params = new URLSearchParams(location.search);
        const initial = params.get('sistemaId') || params.get('sistema');
        if (initial) {
            systemSelect.value = initial;
            await loadSystem(initial);
        } else {
            updateStatus('Nuevo');
            showStep(0);
        }
    } catch (err) {
        message.className = 'message error';
        message.textContent = err.message;
    }
});

window.addEventListener('beforeunload', e => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
});

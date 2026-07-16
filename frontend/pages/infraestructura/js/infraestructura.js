const API_BASE = window.DIAGTI_API_BASE || 'http://localhost:8080/api/infraestructura';

const steps = ['infra', 'deploy', 'security', 'evidence'];
const stepNames = { infra: 'Infraestructura', deploy: 'Despliegue', security: 'Seguridad', evidence: 'Evidencias' };

let systemsList = []; // [{codigo, nombre, estado, ...}] cargado desde /api/infraestructura/sistemas
let currentStep = 0, currentSystem = '', pendingSystem = '', dirty = false, evidences = [], editingEvidence = -1;
let lastLoaded = null; // snapshot del último registro cargado desde el servidor (para "Cancelar cambios")

const form = document.getElementById('formTecnico'), systemSelect = document.getElementById('sistema'), message = document.getElementById('mensaje');
const btnAnterior = document.getElementById('btnAnterior'), btnContinuar = document.getElementById('btnContinuar'),
      btnDraft = document.getElementById('btnGuardarBorrador'), btnSend = document.getElementById('btnEnviar');

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
  [...form.elements].forEach(el => { if (el.name && el.type !== 'file' && el.tagName !== 'BUTTON') d[el.name] = el.value; });
  return d;
}
function fillForm(d = {}) {
  form.reset();
  [...form.elements].forEach(el => { if (el.name && el.type !== 'file' && d[el.name] !== undefined && d[el.name] !== null) el.value = d[el.name]; });
  evidences = Array.isArray(d.evidences) ? d.evidences.map(e => ({ tipo: e.tipo, nombre: e.nombre, archivo: e.archivo || '', url: e.url || '', descripcion: e.descripcion || '' })) : [];
  renderEvidences();
}

function estadoDe(codigo) {
  const s = systemsList.find(x => x.codigo === codigo);
  return s ? s.estado : 'Nuevo';
}

function populateSystems() {
  systemSelect.innerHTML = '<option value="">Seleccione un sistema</option>';
  systemsList
    .filter(s => s.estado === 'Nuevo' || s.estado === 'Borrador')
    .forEach(s => systemSelect.insertAdjacentHTML('beforeend', `<option value="${s.codigo}">${s.codigo} — ${s.nombre} (${s.estado})</option>`));
}

function updateStatus(estado) {
  const badge = document.getElementById('estadoRegistro');
  const isDraft = estado === 'Borrador';
  badge.textContent = isDraft ? 'Borrador' : 'Nuevo';
  badge.className = `status-badge ${isDraft ? 'draft' : 'new'}`;
  document.getElementById('selectorAyuda').textContent = isDraft
    ? 'Se cargaron automáticamente los datos guardados como borrador.'
    : 'Nuevo registro técnico. Complete los cuatro pasos.';
}

async function loadSystem(code) {
  currentSystem = code;
  message.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/registro/${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error('No se pudo cargar el registro técnico.');
    const dto = await res.json();
    lastLoaded = dto;
    fillForm(dto);
    showStep(Number.isInteger(dto.ultimoPaso) ? dto.ultimoPaso : 0);
    dirty = false;
    updateStatus(dto.estado);
    markCompleted();
  } catch (err) {
    message.className = 'message error';
    message.textContent = 'No se pudo cargar el registro técnico. Intente nuevamente.';
    console.error(err);
  }
}

async function saveDraft(show = true) {
  if (!currentSystem) { message.className = 'message error'; message.textContent = 'Seleccione un sistema.'; return; }
  const payload = { ...formData(), evidences, ultimoPaso: currentStep };
  try {
    const res = await fetch(`${API_BASE}/registro/${encodeURIComponent(currentSystem)}/borrador`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('No se pudo guardar el borrador.');
    const dto = await res.json();
    lastLoaded = dto;
    actualizarEstadoEnLista(currentSystem, dto.estado, currentStep);
    dirty = false;
    updateStatus(dto.estado);
    hideModal('modalIncompleto');
    if (show) { message.className = 'message success'; message.textContent = 'Borrador guardado. Puede seguir editándolo cuando desee.'; }
  } catch (err) {
    message.className = 'message error';
    message.textContent = 'No se pudo guardar el borrador. Intente nuevamente.';
    console.error(err);
  }
}

function actualizarEstadoEnLista(codigo, estado, ultimoPaso) {
  const s = systemsList.find(x => x.codigo === codigo);
  if (s) { s.estado = estado; s.ultimoPaso = ultimoPaso; }
}

function requiredFields(step) { return [...document.querySelectorAll(`#${step} [required]`)]; }
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
  if (!currentSystem) p.push('Sistema');
  steps.forEach(s => { if (!validateStep(s, false)) p.push(stepNames[s]); });
  return p;
}
function markCompleted() {
  steps.forEach(s => document.querySelector(`.step[data-step="${s}"]`).classList.toggle('completed', validateStep(s, false)));
}
function requestSystemChange(next) {
  if (!currentSystem || next === currentSystem) { if (next) loadSystem(next); return; }
  pendingSystem = next;
  const saved = !dirty;
  document.getElementById('textoCambio').textContent = saved
    ? 'Este registro ya está guardado. ¿Desea abrir otro sistema?'
    : 'Tiene cambios sin guardar. Si cambia de sistema, perderá la información no guardada.';
  showModal('modalCambio');
}

systemSelect.addEventListener('change', e => {
  const next = e.target.value;
  if (!next) { e.target.value = currentSystem; return; }
  e.target.value = currentSystem;
  requestSystemChange(next);
});
document.getElementById('btnPermanecer').onclick = () => { pendingSystem = ''; systemSelect.value = currentSystem; hideModal('modalCambio'); };
document.getElementById('btnCambiar').onclick = () => { hideModal('modalCambio'); systemSelect.value = pendingSystem; loadSystem(pendingSystem); pendingSystem = ''; };
document.querySelectorAll('.step').forEach(b => b.onclick = () => showStep(steps.indexOf(b.dataset.step)));
btnContinuar.onclick = () => {
  if (!currentSystem) { message.className = 'message error'; message.textContent = 'Seleccione un sistema antes de continuar.'; return; }
  if (!validateStep(steps[currentStep], true)) { message.className = 'message error'; message.textContent = 'Complete los campos obligatorios antes de continuar.'; return; }
  markCompleted();
  showStep(currentStep + 1);
};
btnAnterior.onclick = () => showStep(currentStep - 1);
document.getElementById('btnCancelar').onclick = () => {
  if (confirm('¿Desea descartar los cambios no guardados?')) {
    fillForm(lastLoaded || {});
    dirty = false;
    showStep(Number.isInteger(lastLoaded?.ultimoPaso) ? lastLoaded.ultimoPaso : 0);
  }
};
form.addEventListener('input', e => { dirty = true; e.target.classList.remove('invalid'); });
form.addEventListener('change', e => { dirty = true; e.target.classList.remove('invalid'); });

function evidenceInput() {
  return {
    tipo: document.getElementById('evTipo'), nombre: document.getElementById('evNombre'), archivo: document.getElementById('evArchivo'),
    url: document.getElementById('evUrl'), descripcion: document.getElementById('evDescripcion')
  };
}
function clearEvidence() {
  const x = evidenceInput();
  x.tipo.value = ''; x.nombre.value = ''; x.archivo.value = ''; x.url.value = ''; x.descripcion.value = '';
  editingEvidence = -1;
  document.getElementById('btnAgregarEvidencia').textContent = 'Agregar evidencia';
}
function renderEvidences() {
  const body = document.getElementById('tablaEvidencias');
  document.getElementById('contadorEvidencias').textContent = evidences.length;
  if (!evidences.length) { body.innerHTML = '<tr class="empty-row"><td colspan="5">Todavía no se agregaron evidencias.</td></tr>'; return; }
  body.innerHTML = evidences.map((e, i) => `<tr><td>${e.tipo}</td><td>${e.nombre}</td><td>${e.archivo || e.url}</td><td>${e.descripcion || '—'}</td><td><button type="button" class="table-btn edit-ev" data-i="${i}">Editar</button><button type="button" class="table-btn delete-ev" data-i="${i}">Eliminar</button></td></tr>`).join('');
  body.querySelectorAll('.edit-ev').forEach(b => b.onclick = () => editEvidence(+b.dataset.i));
  body.querySelectorAll('.delete-ev').forEach(b => b.onclick = () => { evidences.splice(+b.dataset.i, 1); dirty = true; renderEvidences(); markCompleted(); });
}
function editEvidence(i) {
  const e = evidences[i], x = evidenceInput();
  x.tipo.value = e.tipo; x.nombre.value = e.nombre; x.url.value = e.url || ''; x.descripcion.value = e.descripcion || ''; x.archivo.value = '';
  editingEvidence = i;
  document.getElementById('btnAgregarEvidencia').textContent = 'Actualizar evidencia';
  window.scrollTo({ top: document.getElementById('evidence').offsetTop - 20, behavior: 'smooth' });
}
document.getElementById('btnAgregarEvidencia').onclick = () => {
  const x = evidenceInput(), file = x.archivo.files[0]?.name || '', err = document.getElementById('errorEvidencia');
  if (!x.tipo.value || !x.nombre.value.trim() || (!file && !x.url.value.trim())) {
    err.textContent = 'Complete tipo, nombre y agregue un archivo o una URL.';
    return;
  }
  const old = editingEvidence >= 0 ? evidences[editingEvidence] : {};
  const ev = { tipo: x.tipo.value, nombre: x.nombre.value.trim(), archivo: file || old.archivo || '', url: x.url.value.trim(), descripcion: x.descripcion.value.trim() };
  if (editingEvidence >= 0) evidences[editingEvidence] = ev; else evidences.push(ev);
  err.textContent = ''; dirty = true; clearEvidence(); renderEvidences(); markCompleted();
};
btnDraft.onclick = () => saveDraft();
btnSend.onclick = () => {
  const p = pending();
  if (p.length) { document.getElementById('listaPendientes').innerHTML = p.map(x => `<li>${x}</li>`).join(''); showModal('modalIncompleto'); return; }
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
  const payload = { ...formData(), evidences };
  try {
    const res = await fetch(`${API_BASE}/registro/${encodeURIComponent(currentSystem)}/enviar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      hideModal('modalEnviar');
      if (err.pasosPendientes) {
        document.getElementById('listaPendientes').innerHTML = err.pasosPendientes.map(x => `<li>${x}</li>`).join('');
        showModal('modalIncompleto');
      } else {
        message.className = 'message error';
        message.textContent = err.error || 'No se pudo enviar el registro a validación.';
      }
      return;
    }
    actualizarEstadoEnLista(currentSystem, 'Enviado', 3);
    dirty = false;
    hideModal('modalEnviar');
    message.className = 'message success';
    message.textContent = 'Registro enviado al Validador CTIC. Ya no podrá editarse mientras esté en revisión.';
    setTimeout(() => location.href = 'mis-sistemas.html', 900);
  } catch (err) {
    hideModal('modalEnviar');
    message.className = 'message error';
    message.textContent = 'No se pudo conectar con el servidor. Intente nuevamente.';
    console.error(err);
  }
};

window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

async function init() {
  try {
    const res = await fetch(`${API_BASE}/sistemas`);
    if (!res.ok) throw new Error('No se pudo cargar la lista de sistemas.');
    systemsList = await res.json();
  } catch (err) {
    systemsList = [];
    message.className = 'message error';
    message.textContent = 'No se pudo conectar con el servidor.';
    console.error(err);
  }
  populateSystems();

  const params = new URLSearchParams(location.search), initial = params.get('sistema');
  if (initial && (estadoDe(initial) === 'Nuevo' || estadoDe(initial) === 'Borrador') && systemsList.some(s => s.codigo === initial)) {
    systemSelect.value = initial;
    loadSystem(initial);
  } else {
    updateStatus('Nuevo');
    showStep(0);
    if (initial && systemsList.some(s => s.codigo === initial)) {
      message.className = 'message error';
      message.textContent = 'Este sistema ya inició el flujo de validación. Solo los sistemas Nuevos o en Borrador pueden abrirse aquí.';
    }
  }
}

init();

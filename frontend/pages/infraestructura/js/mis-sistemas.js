const API_BASE = window.DIAGTI_API_BASE || 'http://localhost:8080/api/infraestructura';

const tbody = document.querySelector('#tablaSistemas tbody');
const message = document.getElementById('mensaje');
let rows = [];
let currentRow = null, subEvidence = [], editSub = -1;

function esc(v = '') { return String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])); }
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(b.dataset.close));
document.querySelectorAll('.modal').forEach(m => m.onclick = e => { if (e.target === m) closeModal(m.id); });

function stateClass(s) { return { Validado: 'success', Observado: 'observed', Borrador: 'neutral', Corregido: 'corrected', Enviado: 'sent', Nuevo: 'neutral' }[s] || 'neutral'; }
function riskClass(r) { return { Bajo: 'low', Medio: 'warning', Alto: 'danger', 'Crítico': 'danger' }[r] || 'medium'; }

function rowHtml(s) {
  return `<tr data-code="${s.codigo}" data-estado="${s.estado}" data-name="${esc(s.nombre)}" data-riesgo="${s.riesgo || ''}"${s.observacion ? ` data-observation="${esc(s.observacion)}" data-observation-date="${esc(s.observacionFecha || '')}"` : ''}>
    <td>${s.codigo}</td>
    <td><strong>${esc(s.nombre)}</strong></td>
    <td>${esc(s.plataforma)}</td>
    <td>${esc(s.exposicion)}</td>
    <td><span class="badge ${stateClass(s.estado)} estado-badge">${s.estado}</span></td>
    <td><span class="badge ${riskClass(s.riesgo)}">${s.riesgo || '—'}</span></td>
    <td class="actions-cell"></td>
  </tr>`;
}

function renderActions(r) {
  const c = r.querySelector('.actions-cell'), s = r.dataset.estado, code = r.dataset.code;
  let html = '<button class="btn outline ver">Ver</button>';
  if (s === 'Nuevo') html += `<a class="btn primary" href="infraestructura.html?sistema=${code}">Registrar</a>`;
  if (s === 'Borrador') html += `<a class="btn secondary" href="infraestructura.html?sistema=${code}">Completar</a>`;
  if (s === 'Observado') html += '<button class="btn warning-btn subsanar">Subsanar</button>';
  if (s === 'Corregido') html += '<button class="btn secondary editar-correccion">Editar</button><button class="btn primary enviar">Enviar a validación</button>';
  c.innerHTML = html;
  bindRow(r);
}
function bindRow(r) {
  r.querySelector('.ver')?.addEventListener('click', () => showDetail(r));
  r.querySelector('.subsanar')?.addEventListener('click', () => openCorrection(r, false));
  r.querySelector('.editar-correccion')?.addEventListener('click', () => openCorrection(r, true));
  r.querySelector('.enviar')?.addEventListener('click', () => send(r));
}

function showDetail(r) {
  document.getElementById('detalleSistema').innerHTML = `<dl><dt>Código</dt><dd>${r.dataset.code}</dd><dt>Sistema</dt><dd>${esc(r.dataset.name)}</dd><dt>Plataforma</dt><dd>${r.cells[2].textContent}</dd><dt>Exposición</dt><dd>${r.cells[3].textContent}</dd><dt>Estado</dt><dd>${r.dataset.estado}</dd><dt>Riesgo</dt><dd>${r.dataset.riesgo}</dd></dl>`;
  openModal('modalVer');
}

function openCorrection(r, edit) {
  currentRow = r;
  document.getElementById('codigoSubsanar').value = r.dataset.code;
  document.getElementById('tituloSubsanar').textContent = edit ? 'Editar corrección' : 'Subsanar observación';
  document.getElementById('textoObservacion').textContent = r.dataset.observation || 'Revise y corrija la observación registrada por el Validador CTIC.';
  document.getElementById('fechaObservacion').textContent = 'Fecha: ' + (r.dataset.observationDate || 'Sin fecha');
  document.getElementById('descripcionCorreccion').value = '';
  subEvidence = [];
  renderSub();
  openModal('modalSubsanar');
}

function renderSub() {
  const body = document.getElementById('tablaSubEvidencias');
  document.getElementById('subContador').textContent = subEvidence.length;
  if (!subEvidence.length) { body.innerHTML = '<tr><td colspan="5" class="empty">No hay evidencias agregadas.</td></tr>'; return; }
  body.innerHTML = subEvidence.map((e, i) => `<tr><td>${e.tipo}</td><td>${e.nombre}</td><td>${e.archivo || e.url}</td><td>${e.descripcion || '—'}</td><td><button type="button" class="mini edit-sub" data-i="${i}">Editar</button><button type="button" class="mini delete-sub" data-i="${i}">Eliminar</button></td></tr>`).join('');
  body.querySelectorAll('.edit-sub').forEach(b => b.onclick = () => editSubEvidence(+b.dataset.i));
  body.querySelectorAll('.delete-sub').forEach(b => b.onclick = () => { subEvidence.splice(+b.dataset.i, 1); renderSub(); });
}
function editSubEvidence(i) {
  const e = subEvidence[i];
  document.getElementById('subTipo').value = e.tipo;
  document.getElementById('subNombre').value = e.nombre;
  document.getElementById('subUrl').value = e.url || '';
  document.getElementById('subDescripcion').value = e.descripcion || '';
  document.getElementById('subArchivo').value = '';
  editSub = i;
  document.getElementById('btnAgregarSub').textContent = 'Actualizar evidencia';
}
function clearSub() {
  ['subTipo', 'subNombre', 'subUrl', 'subDescripcion'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('subArchivo').value = '';
  editSub = -1;
  document.getElementById('btnAgregarSub').textContent = 'Agregar evidencia';
}
document.getElementById('btnAgregarSub').onclick = () => {
  const tipo = document.getElementById('subTipo').value;
  const nombre = document.getElementById('subNombre').value.trim();
  const file = document.getElementById('subArchivo').files[0]?.name || '';
  const url = document.getElementById('subUrl').value.trim();
  const desc = document.getElementById('subDescripcion').value.trim();
  const err = document.getElementById('errorSubEvidencia');
  const old = editSub >= 0 ? subEvidence[editSub] : {};
  const archivoFinal = file || old.archivo || '';
  const urlFinal = url || old.url || '';
  if (!tipo || !nombre || (!archivoFinal && !urlFinal)) {
    err.textContent = 'Complete tipo, nombre y agregue archivo o URL.';
    return;
  }
  const estabaEditando = editSub >= 0;
  const item = { tipo, nombre, archivo: archivoFinal, url: urlFinal, descripcion: desc };
  if (estabaEditando) subEvidence[editSub] = item; else subEvidence.push(item);
  err.textContent = estabaEditando ? 'Evidencia actualizada correctamente. Puede agregar otra evidencia.' : 'Evidencia agregada correctamente.';
  err.classList.add('success-inline');
  clearSub();
  renderSub();
  document.getElementById('subTipo').focus();
  setTimeout(() => { err.textContent = ''; err.classList.remove('success-inline'); }, 2500);
};

document.getElementById('formSubsanar').onsubmit = async e => {
  e.preventDefault();
  const desc = document.getElementById('descripcionCorreccion').value.trim();
  const err = document.getElementById('errorSubsanar');
  if (!desc || !subEvidence.length) { err.textContent = 'Ingrese la descripción general y agregue al menos una evidencia.'; return; }

  try {
    const res = await fetch(`${API_BASE}/sistemas/${encodeURIComponent(currentRow.dataset.code)}/subsanar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion: desc, evidencias: subEvidence })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      err.textContent = body.error || 'No se pudo guardar la corrección.';
      return;
    }
    err.textContent = '';
    closeModal('modalSubsanar');
    updateRow(currentRow, 'Corregido');
    message.className = 'message success-text';
    message.textContent = 'Corrección guardada. Puede editarla antes de enviarla nuevamente.';
  } catch (ex) {
    err.textContent = 'No se pudo conectar con el servidor.';
    console.error(ex);
  }
};

async function send(r) {
  if (!confirm('¿Desea enviar la corrección al Validador CTIC? Después no podrá editarla.')) return;
  try {
    const res = await fetch(`${API_BASE}/sistemas/${encodeURIComponent(r.dataset.code)}/reenviar`, { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      message.className = 'message error';
      message.textContent = body.error || 'No se pudo enviar la corrección.';
      return;
    }
    updateRow(r, 'Enviado');
    message.className = 'message success-text';
    message.textContent = 'Sistema enviado correctamente al Validador CTIC.';
  } catch (ex) {
    message.className = 'message error';
    message.textContent = 'No se pudo conectar con el servidor.';
    console.error(ex);
  }
}

function updateRow(r, estado) {
  r.dataset.estado = estado;
  const badge = r.querySelector('.estado-badge');
  badge.textContent = estado;
  badge.className = `badge ${stateClass(estado)} estado-badge`;
  renderActions(r);
}

function filter() {
  const q = document.getElementById('buscar').value.toLowerCase(), st = document.getElementById('estado').value, ri = document.getElementById('riesgo').value;
  let n = 0;
  rows.forEach(r => {
    const ok = r.textContent.toLowerCase().includes(q) && (!st || r.dataset.estado === st) && (!ri || r.dataset.riesgo === ri);
    r.hidden = !ok;
    if (ok) n++;
  });
  document.getElementById('sinResultados').classList.toggle('hidden', n > 0);
}
document.getElementById('buscar').oninput = filter;
document.getElementById('estado').onchange = filter;
document.getElementById('riesgo').onchange = filter;

async function init() {
  try {
    const res = await fetch(`${API_BASE}/sistemas`);
    if (!res.ok) throw new Error('No se pudo cargar la lista de sistemas.');
    const sistemas = await res.json();
    tbody.innerHTML = sistemas.map(rowHtml).join('');
  } catch (err) {
    message.className = 'message error';
    message.textContent = 'No se pudo conectar con el servidor.';
    console.error(err);
    return;
  }

  rows = [...tbody.querySelectorAll('tr')];
  rows.forEach(r => renderActions(r));

  const queryParams = new URLSearchParams(location.search);
  const requestedState = queryParams.get('estado');
  if (requestedState) { document.getElementById('estado').value = requestedState; filter(); }
  const requested = queryParams.get('sistema');
  if (requested) {
    const row = rows.find(r => r.dataset.code === requested);
    if (row) { row.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => showDetail(row), 250); }
  }
}

init();

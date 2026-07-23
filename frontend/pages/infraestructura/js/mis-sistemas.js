// Bandeja compartida del Área de Infraestructura.
// Todos los integrantes del área pueden consultar los sistemas, pero solamente
// el usuario que tomó el registro puede editarlo, subsanarlo o reenviarlo.
const tbody = document.querySelector('#tablaSistemas tbody');
const message = document.getElementById('mensaje');
let sistemas = [];

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
}

function stateClass(state) {
  return ({
    Validado: 'success',
    Observado: 'observed',
    Rechazado: 'observed',
    Borrador: 'neutral',
    Subsanado: 'corrected',
    Corregido: 'corrected',
    Enviado: 'sent',
    Nuevo: 'neutral'
  })[state] || 'neutral';
}

function parseObservations(raw, fallback = '') {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (_) { /* formato anterior */ }
  return fallback ? [{
    seccion: 'Validación de Infraestructura',
    campo: 'Información técnica',
    detalle: fallback,
    evidenciaRequerida: false
  }] : [];
}

function storageKey(type, code) {
  const user = window.DIAGTIFlujo?.sesion?.().username || 'infraestructura';
  return `${type}-${user}-${code}`;
}

function isOwner(system) {
  const user = window.DIAGTIFlujo?.sesion?.().username || '';
  return !system.usuarioInfraestructura
    || String(system.usuarioInfraestructura).toLowerCase() === String(user).toLowerCase();
}

function addHistory(system, action, detail, state) {
  const session = window.DIAGTIFlujo.sesion();
  const historyKey = `diagti-historial-${session.username || 'infraestructura'}`;
  let history = [];
  try { history = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch (_) {}
  history.unshift({
    id: `evt-${Date.now()}`,
    date: new Date().toISOString(),
    code: system.codigo,
    name: system.nombre,
    action,
    detail,
    user: session.nombreCompleto || session.username || 'Infraestructura',
    state,
    section: 'Flujo de validación',
    after: state
  });
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 200)));
}

async function cargar() {
  try {
    const session = window.DIAGTIFlujo.sesion();
    const assigned = await window.DIAGTIFlujo.listarRegistros('INFRAESTRUCTURA', session.username);
    sistemas = assigned.map(item => {
      const development = item.datosDesarrollo || {};
      const infrastructure = item.datosInfraestructura || {};
      const local = localStorage.getItem(storageKey('diagti-estado', item.codigoSistema));
      let state = window.DIAGTIFlujo.estadoPantalla(item.estado || 'NUEVO');
      if (['Subsanado', 'Corregido'].includes(local) && state === 'Observado') state = 'Subsanado';
      localStorage.setItem(storageKey('diagti-estado', item.codigoSistema), state);
      if (item.idRegistro) {
        localStorage.setItem(storageKey('diagti-registro', item.codigoSistema), JSON.stringify({
          estado: state,
          data: infrastructure,
          ultimoPaso: state === 'Borrador' ? 0 : 3,
          updatedAt: item.fechaActualizacion || item.fechaEnvioInfraestructura
        }));
      } else if (state === 'Nuevo') {
        localStorage.removeItem(storageKey('diagti-registro', item.codigoSistema));
      }
      return {
        codigo: item.codigoSistema,
        nombre: item.nombreSistema,
        area: item.areaUsuaria,
        estado: state,
        riesgo: development.criticidad || development.riesgo || 'Sin clasificar',
        plataforma: infrastructure.plataforma || 'Sin registrar',
        exposicion: infrastructure.exposicion || 'Sin registrar',
        datosDesarrollo: development,
        datosInfra: infrastructure,
        usuarioInfraestructura: item.usuarioInfraestructura || '',
        responsableInfraestructura: item.responsableInfraestructura || '',
        observacion: item.comentarioRevision || '',
        observaciones: parseObservations(item.observacionesJson, item.comentarioRevision),
        fechaObservacion: item.fechaRevision || ''
      };
    });
    render();
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">No se pudieron cargar los sistemas enviados por Desarrollo: ${esc(error.message)}</td></tr>`;
  }
}

function acciones(system) {
  let html = `<button class="btn outline ver" data-code="${esc(system.codigo)}">Ver</button>`;
  if (!isOwner(system)) return html;
  if (system.estado === 'Nuevo') {
    html += `<a class="btn primary" href="infraestructura.html?sistema=${encodeURIComponent(system.codigo)}">Registrar</a>`;
  }
  if (system.estado === 'Borrador') {
    html += `<a class="btn secondary" href="infraestructura.html?sistema=${encodeURIComponent(system.codigo)}">Completar</a>`;
  }
  if (['Observado', 'Rechazado'].includes(system.estado)) {
    html += `<a class="btn warning-btn" href="infraestructura.html?sistema=${encodeURIComponent(system.codigo)}&subsanar=1">Subsanar</a>`;
  }
  if (['Subsanado', 'Corregido'].includes(system.estado)) {
    html += `<a class="btn secondary" href="infraestructura.html?sistema=${encodeURIComponent(system.codigo)}&subsanar=1">Editar</a>`;
    html += `<button class="btn primary enviar" data-code="${esc(system.codigo)}">Reenviar a validación</button>`;
  }
  return html;
}

function filtered() {
  const query = document.getElementById('buscar').value.toLowerCase();
  const state = document.getElementById('estado').value;
  const risk = document.getElementById('riesgo').value;
  return sistemas.filter(system =>
    (`${system.codigo} ${system.nombre}`).toLowerCase().includes(query)
    && (!state || system.estado === state)
    && (!risk || system.riesgo === risk)
  );
}

function render() {
  const list = filtered();
  tbody.innerHTML = list.length ? list.map(system => `
    <tr>
      <td>${esc(system.codigo)}</td>
      <td><strong>${esc(system.nombre)}</strong></td>
      <td>${esc(system.plataforma)}</td>
      <td>${esc(system.exposicion)}</td>
      <td><span class="badge ${stateClass(system.estado)} estado-badge">${esc(system.estado)}</span></td>
      <td><span class="badge ${['Alto', 'Crítico'].includes(system.riesgo) ? 'danger' : 'warning'}">${esc(system.riesgo)}</span></td>
      <td>${esc(system.responsableInfraestructura || system.usuarioInfraestructura || 'Sin asignar')}</td>
      <td class="actions-cell">${acciones(system)}</td>
    </tr>`).join('')
    : '<tr><td colspan="8" class="empty">No hay sistemas enviados por Desarrollo.</td></tr>';
  document.getElementById('sinResultados').classList.toggle('hidden', list.length > 0);
  tbody.querySelectorAll('.ver').forEach(button => {
    button.onclick = () => showDetail(button.dataset.code);
  });
  tbody.querySelectorAll('.enviar').forEach(button => {
    button.onclick = () => send(button.dataset.code);
  });
}

function showDetail(code) {
  const system = sistemas.find(item => item.codigo === code);
  if (!system) return;
  const development = system.datosDesarrollo || {};
  const infrastructure = system.datosInfra || {};
  const observations = system.observaciones.length
    ? `<ul>${system.observaciones.map(obs => `<li><strong>${esc(obs.seccion)} / ${esc(obs.campo)}:</strong> ${esc(obs.detalle)}${obs.evidenciaRequerida ? ' (requiere evidencia)' : ''}</li>`).join('')}</ul>`
    : esc(system.observacion || 'Sin respuesta todavía');
  document.getElementById('detalleSistema').innerHTML = `
    <dl>
      <dt>Código</dt><dd>${esc(system.codigo)}</dd>
      <dt>Sistema</dt><dd>${esc(system.nombre)}</dd>
      <dt>Enviado por Desarrollo</dt><dd>${esc(development.responsable_tecnico || development.responsable || 'Desarrollo CTIC')}</dd>
      <dt>Responsable técnico</dt><dd>${esc(system.responsableInfraestructura || system.usuarioInfraestructura || 'Sin asignar')}</dd>
      <dt>Arquitectura</dt><dd>${esc(development.arquitectura || '--')}</dd>
      <dt>Base de datos</dt><dd>${esc(development.motor_bd || '--')}</dd>
      <dt>Plataforma</dt><dd>${esc(infrastructure.plataforma || 'Sin registrar')}</dd>
      <dt>Exposición</dt><dd>${esc(infrastructure.exposicion || 'Sin registrar')}</dd>
      <dt>Estado Infraestructura</dt><dd>${esc(system.estado)}</dd>
      <dt>Respuesta del Validador</dt><dd>${observations}</dd>
    </dl>`;
  document.getElementById('modalVer').classList.add('show');
}

async function send(code) {
  const system = sistemas.find(item => item.codigo === code);
  if (!system || !isOwner(system) || !confirm('¿Desea reenviar la corrección al Validador CTIC?')) return;
  try {
    await window.DIAGTIFlujo.enviar({
      codigoSistema: system.codigo,
      nombreSistema: system.nombre,
      areaOrigen: 'INFRAESTRUCTURA',
      areaUsuaria: system.area || 'CTIC UNAS',
      comentario: 'Observaciones de infraestructura subsanadas',
      datos: system.datosInfra
    });
    localStorage.setItem(storageKey('diagti-estado', code), 'Enviado');
    addHistory(system, 'Reenvío', 'La corrección técnica fue reenviada al Validador.', 'Enviado');
    message.className = 'message success-text';
    message.textContent = 'Corrección reenviada y actualizada en PostgreSQL.';
    await cargar();
  } catch (error) {
    message.className = 'message error-text';
    message.textContent = `No se pudo reenviar: ${error.message}`;
  }
}

document.querySelectorAll('[data-close]').forEach(button => {
  button.onclick = () => document.getElementById(button.dataset.close).classList.remove('show');
});
document.querySelectorAll('.modal').forEach(modal => {
  modal.onclick = event => { if (event.target === modal) modal.classList.remove('show'); };
});
document.getElementById('buscar').oninput = render;
document.getElementById('estado').onchange = render;
document.getElementById('riesgo').onchange = render;
cargar();
window.addEventListener('focus', cargar);
window.setInterval(() => {
  if (!document.hidden && !document.querySelector('.modal.show')) cargar();
}, 15000);

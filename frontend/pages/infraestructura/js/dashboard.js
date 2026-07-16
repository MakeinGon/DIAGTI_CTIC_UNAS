const API_BASE = window.DIAGTI_API_BASE || 'http://localhost:8080/api/infraestructura';

const stateOrder = ['Nuevo', 'Borrador', 'Enviado', 'Observado', 'Corregido', 'Validado'];
const riskOrder = ['Bajo', 'Medio', 'Alto', 'Crítico'];
const actionLabels = { Nuevo: 'Registrar', Borrador: 'Completar', Observado: 'Subsanar', Corregido: 'Revisar y enviar' };
const actionDetails = {
  Nuevo: 'Aún no tiene registro técnico.',
  Borrador: 'El registro está incompleto.',
  Observado: 'Tiene observaciones del Validador CTIC.',
  Corregido: 'La corrección está lista para revisión.'
};

async function cargarDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('No se pudo cargar el dashboard');
    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    document.getElementById('priorityList').innerHTML =
      '<div class="empty-state">No se pudo conectar con el servidor. Intente nuevamente más tarde.</div>';
    console.error(err);
  }
}

function renderDashboard(data) {
  document.getElementById('kpiTotal').textContent = data.total ?? 0;
  document.getElementById('kpiNuevos').textContent = data.nuevos ?? 0;
  document.getElementById('kpiBorradores').textContent = data.borradores ?? 0;
  document.getElementById('kpiPendientes').textContent = data.pendientes ?? 0;
  document.getElementById('kpiObservados').textContent = data.observados ?? 0;
  document.getElementById('kpiValidados').textContent = data.validados ?? 0;

  const prioridades = data.prioridades || [];
  const priorityList = document.getElementById('priorityList');
  priorityList.innerHTML = prioridades.length ? prioridades.map(x => {
    const href = (x.estado === 'Nuevo' || x.estado === 'Borrador')
      ? `infraestructura.html?sistema=${x.codigo}`
      : `mis-sistemas.html?estado=${x.estado}&sistema=${x.codigo}`;
    return `<div class="priority-item"><div class="priority-main"><span class="priority-status ${x.estado}">${x.estado}</span><div class="priority-text"><strong>${x.codigo} — ${x.nombre}</strong><small>${actionDetails[x.estado] || ''}</small></div></div><a class="priority-action" href="${href}">${actionLabels[x.estado] || 'Ver'}</a></div>`;
  }).join('') : '<div class="empty-state">No hay acciones pendientes.</div>';

  const porEstado = data.porEstado || {};
  const maxState = Math.max(1, ...stateOrder.map(s => porEstado[s] || 0));
  document.getElementById('stateBars').innerHTML = stateOrder.map(state => {
    const count = porEstado[state] || 0;
    return `<div class="bar-row"><span class="bar-label">${state}</span><div class="bar-track"><span class="bar-fill ${state}" style="width:${(count / maxState) * 100}%"></span></div><span class="bar-count">${count}</span></div>`;
  }).join('');

  const porRiesgo = data.porRiesgo || {};
  const riskClasses = { Bajo: 'low', Medio: 'medium', Alto: 'high', 'Crítico': 'critical' };
  document.getElementById('riskSummary').innerHTML = riskOrder
    .map(name => `<div class="risk-card ${riskClasses[name]}"><span>Riesgo ${name.toLowerCase()}</span><strong>${porRiesgo[name] || 0}</strong></div>`)
    .join('');
}

cargarDashboard();

const baseHistory = [
  {id:'h1',date:'2026-07-11T09:15:00',code:'SIS-MAT-01',name:'Sistema de Matrícula',action:'Actualización',detail:'Se actualizó la frecuencia de backup de semanal a diaria.',user:'Carlos Rojas',state:'Validado',section:'Infraestructura',before:'Semanal',after:'Diario'},
  {id:'h2',date:'2026-07-10T16:42:00',code:'SIS-DOC-02',name:'Documenta',action:'Evidencia',detail:'Se adjuntó la configuración de Docker Compose.',user:'Carlos Rojas',state:'Corregido',section:'Evidencias',after:'docker-compose-documenta.yml'},
  {id:'h3',date:'2026-07-10T11:20:00',code:'SIS-DOC-02',name:'Documenta',action:'Subsanación',detail:'Se guardó la corrección de la observación y sus evidencias.',user:'Carlos Rojas',state:'Corregido',section:'Subsanación',after:'Corrección pendiente de reenvío'},
  {id:'h4',date:'2026-07-09T15:50:00',code:'SIS-DOC-02',name:'Documenta',action:'Observación',detail:'El Validador CTIC solicitó certificado SSL y política de backup.',user:'Validador CTIC',state:'Observado',section:'Validación',after:'Observación registrada'},
  {id:'h5',date:'2026-07-08T14:05:00',code:'SIS-MAT-01',name:'Sistema de Matrícula',action:'Envío',detail:'El registro técnico fue enviado a validación.',user:'Carlos Rojas',state:'Enviado',section:'Flujo de validación',after:'Enviado'},
  {id:'h6',date:'2026-07-07T17:30:00',code:'SIS-VEN-03',name:'Registro de Ventas',action:'Borrador',detail:'Se guardó el avance del registro técnico.',user:'Carlos Rojas',state:'Borrador',section:'Registro técnico',after:'Borrador'},
  {id:'h7',date:'2026-07-07T10:10:00',code:'SIS-MSA-06',name:'Mesa de Servicios TI',action:'Creación',detail:'El sistema fue asignado al Área de Infraestructura y aún no tiene registro técnico.',user:'Administrador CTIC',state:'Nuevo',section:'Asignación',after:'Nuevo'},
  {id:'h8',date:'2026-07-06T12:00:00',code:'SIS-MAT-01',name:'Sistema de Matrícula',action:'Validación',detail:'El registro técnico fue aprobado por el Validador CTIC.',user:'Validador CTIC',state:'Validado',section:'Validación',after:'Validado'}
];

const systems = {
  'SIS-MAT-01':'Sistema de Matrícula','SIS-DOC-02':'Documenta','SIS-VEN-03':'Registro de Ventas',
  'SIS-BIB-04':'Biblioteca Virtual','SIS-RRH-05':'Control de Personal','SIS-MSA-06':'Mesa de Servicios TI'
};
const els={
  search:document.getElementById('buscar'), system:document.getElementById('sistemaFiltro'), action:document.getElementById('accion'),
  state:document.getElementById('estado'), from:document.getElementById('fechaDesde'), to:document.getElementById('fechaHasta'),
  body:document.getElementById('historialBody'), empty:document.getElementById('sinResultados'), summary:document.getElementById('resumenResultados')
};
function loadHistory(){
  let extra=[]; try{extra=JSON.parse(localStorage.getItem('diagti-historial')||'[]')}catch{}
  const map=new Map(); [...extra,...baseHistory].forEach(x=>map.set(x.id||`${x.date}-${x.code}-${x.action}`,x));
  return [...map.values()].sort((a,b)=>new Date(b.date)-new Date(a.date));
}
let history=loadHistory();
Object.entries(systems).forEach(([code,name])=>els.system.insertAdjacentHTML('beforeend',`<option value="${code}">${code} — ${name}</option>`));
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function badgeClass(s){return ({Nuevo:'neutral',Borrador:'neutral',Enviado:'sent',Observado:'warning',Corregido:'corrected',Validado:'success'}[s]||'neutral')}
function formatDate(v){return new Intl.DateTimeFormat('es-PE',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}
function filtered(){
  const q=els.search.value.trim().toLowerCase(), from=els.from.value?new Date(`${els.from.value}T00:00:00`):null, to=els.to.value?new Date(`${els.to.value}T23:59:59`):null;
  return history.filter(x=>{
    const text=`${x.code} ${x.name} ${x.action} ${x.detail} ${x.user} ${x.state}`.toLowerCase(), d=new Date(x.date);
    return (!q||text.includes(q))&&(!els.system.value||x.code===els.system.value)&&(!els.action.value||x.action===els.action.value)&&(!els.state.value||x.state===els.state.value)&&(!from||d>=from)&&(!to||d<=to);
  });
}
function render(){
  const list=filtered(); els.body.innerHTML=list.map(x=>`<tr><td>${formatDate(x.date)}</td><td><strong>${esc(x.code)}</strong><span class="system-name">${esc(x.name)}</span></td><td>${esc(x.action)}</td><td>${esc(x.detail)}</td><td>${esc(x.user)}</td><td><span class="badge ${badgeClass(x.state)}">${esc(x.state)}</span></td><td><button class="btn outline detail-btn" data-id="${esc(x.id)}" type="button">Ver detalle</button></td></tr>`).join('');
  els.empty.classList.toggle('hidden',list.length>0); els.summary.textContent=`Mostrando ${list.length} de ${history.length} movimientos.`;
  document.querySelectorAll('.detail-btn').forEach(b=>b.onclick=()=>openDetail(b.dataset.id));
}
function openDetail(id){
  const x=history.find(i=>i.id===id); if(!x)return;
  document.getElementById('detalleMovimiento').innerHTML=`<dl class="detail-list"><dt>Fecha y hora</dt><dd>${formatDate(x.date)}</dd><dt>Sistema</dt><dd>${esc(x.code)} — ${esc(x.name)}</dd><dt>Acción</dt><dd>${esc(x.action)}</dd><dt>Sección</dt><dd>${esc(x.section||'Registro técnico')}</dd><dt>Detalle</dt><dd>${esc(x.detail)}</dd><dt>Usuario</dt><dd>${esc(x.user)}</dd><dt>Estado resultante</dt><dd><span class="badge ${badgeClass(x.state)}">${esc(x.state)}</span></dd>${x.before?`<dt>Valor anterior</dt><dd>${esc(x.before)}</dd>`:''}${x.after?`<dt>Valor nuevo</dt><dd>${esc(x.after)}</dd>`:''}</dl>`;
  document.getElementById('verSistemaDetalle').href=`mis-sistemas.html?sistema=${encodeURIComponent(x.code)}`;
  document.getElementById('modalDetalle').classList.add('show');
}
[els.search,els.system,els.action,els.state,els.from,els.to].forEach(x=>x.addEventListener(x.tagName==='INPUT'?'input':'change',render));
document.getElementById('limpiar').onclick=()=>{els.search.value='';els.system.value='';els.action.value='';els.state.value='';els.from.value='';els.to.value='';render()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).classList.remove('show'));
document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>{if(e.target===m)m.classList.remove('show')});
render();

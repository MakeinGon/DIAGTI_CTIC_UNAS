const systems = {};
const els={
  search:document.getElementById('buscar'), system:document.getElementById('sistemaFiltro'), action:document.getElementById('accion'),
  state:document.getElementById('estado'), from:document.getElementById('fechaDesde'), to:document.getElementById('fechaHasta'),
  body:document.getElementById('historialBody'), empty:document.getElementById('sinResultados'), summary:document.getElementById('resumenResultados')
};
function loadHistory(){
  const session=window.DIAGTIFlujo?.sesion?.()||{},historyKey=`diagti-historial-${session.username||'infraestructura'}`;
  let extra=[]; try{extra=JSON.parse(localStorage.getItem(historyKey)||'[]')}catch{}
  const map=new Map(); extra.forEach(x=>map.set(x.id||`${x.date}-${x.code}-${x.action}`,x));
  return [...map.values()].sort((a,b)=>new Date(b.date)-new Date(a.date));
}
let history=loadHistory();
function registrarSistema(code,name){
  if(!code||systems[code])return;
  systems[code]=name||code;
  els.system.insertAdjacentHTML('beforeend',`<option value="${esc(code)}">${esc(code)} — ${esc(systems[code])}</option>`);
}
history.forEach(x=>registrarSistema(x.code,x.name));
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

async function refreshRemoteHistory(){
  try{
    if(!window.DIAGTIFlujo)return;
    const session=window.DIAGTIFlujo.sesion();
    const todas=await window.DIAGTIFlujo.historial('INFRAESTRUCTURA');
    const solicitudes=session.username
      ? todas.filter(s=>!s.usuarioOrigen||String(s.usuarioOrigen).toLowerCase()===String(session.username).toLowerCase())
      : todas;
    const remoto=solicitudes.map(s=>{
      registrarSistema(s.codigoSistema,s.nombreSistema);
      const estado=window.DIAGTIFlujo.estadoPantalla(s.estado);
      const revisado=s.estado!=='PENDIENTE';
      return {
        id:`api-${s.id}`,date:s.fechaRevision||s.fechaEnvio,code:s.codigoSistema,name:s.nombreSistema,
        action:revisado?(s.estado==='VALIDADO'?'Validación':'Observación'):'Envío',
        detail:revisado?(s.comentarioRevision||'Revisión realizada por el Validador CTIC'):(s.comentario||'Información enviada para validación'),
        user:revisado?(s.revisadoPor||'Validador CTIC'):(s.responsable||'Infraestructura'),
        state:estado,section:'Flujo de validación',after:estado
      };
    });
    const map=new Map();[...remoto,...loadHistory()].forEach(x=>map.set(x.id,x));
    history=[...map.values()].sort((a,b)=>new Date(b.date)-new Date(a.date));
    render();
  }catch(error){console.error('No se pudo cargar el historial real:',error)}
}
refreshRemoteHistory();
window.addEventListener('focus',refreshRemoteHistory);
window.setInterval(()=>{if(!document.hidden)refreshRemoteHistory()},15000);

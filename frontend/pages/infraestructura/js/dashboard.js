const systems = [
  {code:'SIS-MAT-01',name:'Sistema de Matrícula',baseState:'Validado',risk:'Medio'},
  {code:'SIS-DOC-02',name:'Documenta',baseState:'Observado',risk:'Alto'},
  {code:'SIS-VEN-03',name:'Registro de Ventas',baseState:'Borrador',risk:'Crítico'},
  {code:'SIS-BIB-04',name:'Biblioteca Virtual',baseState:'Corregido',risk:'Medio'},
  {code:'SIS-RRH-05',name:'Control de Personal',baseState:'Enviado',risk:'Bajo'},
  {code:'SIS-MSA-06',name:'Mesa de Servicios TI',baseState:'Nuevo',risk:'Medio'},
  {code:'SIS-PAG-07',name:'Portal de Pagos',baseState:'Observado',risk:'Alto'},
  {code:'SIS-ADM-08',name:'Gestión Administrativa',baseState:'Observado',risk:'Medio'},
  {code:'SIS-INV-09',name:'Sistema de Investigación',baseState:'Observado',risk:'Alto'},
  {code:'SIS-COM-10',name:'Comedor Universitario',baseState:'Observado',risk:'Medio'}
];

function storedState(system){
  const direct=localStorage.getItem(`diagti-estado-${system.code}`);
  if(direct)return direct;
  try{
    const record=JSON.parse(localStorage.getItem(`diagti-registro-${system.code}`)||'null');
    return record?.estado||system.baseState;
  }catch{return system.baseState}
}

const current=systems.map(s=>({...s,state:storedState(s)}));
const stateOrder=['Nuevo','Borrador','Enviado','Observado','Corregido','Validado'];
const counts=Object.fromEntries(stateOrder.map(s=>[s,current.filter(x=>x.state===s).length]));
const risks=['Bajo','Medio','Alto','Crítico'];
const riskCounts=Object.fromEntries(risks.map(r=>[r,current.filter(x=>x.risk===r).length]));

document.getElementById('kpiTotal').textContent=current.length;
document.getElementById('kpiNuevos').textContent=counts.Nuevo;
document.getElementById('kpiBorradores').textContent=counts.Borrador;
document.getElementById('kpiPendientes').textContent=counts.Nuevo+counts.Borrador;
document.getElementById('kpiObservados').textContent=counts.Observado;
document.getElementById('kpiValidados').textContent=counts.Validado;

const actionLabels={Nuevo:'Registrar',Borrador:'Completar',Observado:'Subsanar',Corregido:'Revisar y enviar'};
const actionDetails={Nuevo:'Aún no tiene registro técnico.',Borrador:'El registro está incompleto.',Observado:'Tiene observaciones del Validador CTIC.',Corregido:'La corrección está lista para revisión.'};
const priorities=current.filter(x=>['Observado','Corregido','Borrador','Nuevo'].includes(x.state))
  .sort((a,b)=>['Observado','Corregido','Borrador','Nuevo'].indexOf(a.state)-['Observado','Corregido','Borrador','Nuevo'].indexOf(b.state));
const priorityList=document.getElementById('priorityList');
priorityList.innerHTML=priorities.length?priorities.slice(0,6).map(x=>{
  const href=(x.state==='Nuevo'||x.state==='Borrador')?`infraestructura.html?sistema=${x.code}`:`mis-sistemas.html?estado=${x.state}&sistema=${x.code}`;
  return `<div class="priority-item"><div class="priority-main"><span class="priority-status ${x.state}">${x.state}</span><div class="priority-text"><strong>${x.code} — ${x.name}</strong><small>${actionDetails[x.state]}</small></div></div><a class="priority-action" href="${href}">${actionLabels[x.state]}</a></div>`;
}).join(''):'<div class="empty-state">No hay acciones pendientes.</div>';

const maxState=Math.max(1,...Object.values(counts));
document.getElementById('stateBars').innerHTML=stateOrder.map(state=>`<div class="bar-row"><span class="bar-label">${state}</span><div class="bar-track"><span class="bar-fill ${state}" style="width:${(counts[state]/maxState)*100}%"></span></div><span class="bar-count">${counts[state]}</span></div>`).join('');

document.getElementById('riskSummary').innerHTML=[
  ['Bajo','low'],['Medio','medium'],['Alto','high'],['Crítico','critical']
].map(([name,cls])=>`<div class="risk-card ${cls}"><span>Riesgo ${name.toLowerCase()}</span><strong>${riskCounts[name]}</strong></div>`).join('');

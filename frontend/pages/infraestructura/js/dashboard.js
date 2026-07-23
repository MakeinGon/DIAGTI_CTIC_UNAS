async function cargarSistemas(){
 const session=window.DIAGTIFlujo.sesion();
 const asignados=await window.DIAGTIFlujo.listarRegistros('INFRAESTRUCTURA',session.username);
 return asignados.map(item=>{
  const dd=item.datosDesarrollo||{},di=item.datosInfraestructura||{};
  let state=window.DIAGTIFlujo.estadoPantalla(item.estado||'NUEVO');
  const local=localStorage.getItem(`diagti-estado-${session.username||'infraestructura'}-${item.codigoSistema}`);
  if(local==='Corregido'&&state==='Observado')state='Corregido';
  return {code:item.codigoSistema,name:item.nombreSistema,state,risk:dd.criticidad||dd.riesgo||'Sin clasificar',platform:di.plataforma||'Sin registrar'};
 })
}

function render(current){
 const stateOrder=['Nuevo','Borrador','Enviado','Observado','Corregido','Validado'];
 const counts=Object.fromEntries(stateOrder.map(s=>[s,current.filter(x=>x.state===s).length]));
 const risks=['Bajo','Medio','Alto','Crítico'];
 const riskCounts=Object.fromEntries(risks.map(r=>[r,current.filter(x=>x.risk===r).length]));
 document.getElementById('kpiTotal').textContent=current.length;document.getElementById('kpiNuevos').textContent=counts.Nuevo;document.getElementById('kpiBorradores').textContent=counts.Borrador;document.getElementById('kpiPendientes').textContent=counts.Nuevo+counts.Borrador;document.getElementById('kpiObservados').textContent=counts.Observado;document.getElementById('kpiValidados').textContent=counts.Validado;
 const labels={Nuevo:'Registrar',Borrador:'Completar',Observado:'Subsanar',Corregido:'Revisar y enviar'},details={Nuevo:'Desarrollo envió el sistema; falta registrar su infraestructura.',Borrador:'El registro técnico está incompleto.',Observado:'El Validador registró una observación.',Corregido:'La corrección está lista para reenviar.'};
 const priorities=current.filter(x=>labels[x.state]).sort((a,b)=>['Observado','Corregido','Borrador','Nuevo'].indexOf(a.state)-['Observado','Corregido','Borrador','Nuevo'].indexOf(b.state));
 document.getElementById('priorityList').innerHTML=priorities.length?priorities.slice(0,6).map(x=>{const href=(x.state==='Nuevo'||x.state==='Borrador')?`infraestructura.html?sistema=${encodeURIComponent(x.code)}`:`mis-sistemas.html?sistema=${encodeURIComponent(x.code)}`;return `<div class="priority-item"><div class="priority-main"><span class="priority-status ${x.state}">${x.state}</span><div class="priority-text"><strong>${x.code} — ${x.name}</strong><small>${details[x.state]}</small></div></div><a class="priority-action" href="${href}">${labels[x.state]}</a></div>`}).join(''):'<div class="empty-state">No hay acciones pendientes.</div>';
 const max=Math.max(1,...Object.values(counts));document.getElementById('stateBars').innerHTML=stateOrder.map(s=>`<div class="bar-row"><span class="bar-label">${s}</span><div class="bar-track"><span class="bar-fill ${s}" style="width:${counts[s]/max*100}%"></span></div><span class="bar-count">${counts[s]}</span></div>`).join('');
 document.getElementById('riskSummary').innerHTML=[['Bajo','low'],['Medio','medium'],['Alto','high'],['Crítico','critical']].map(([r,c])=>`<div class="risk-card ${c}"><span>Riesgo ${r.toLowerCase()}</span><strong>${riskCounts[r]}</strong></div>`).join('');
}

async function refresh(){try{render(await cargarSistemas())}catch(error){console.error(error);document.getElementById('priorityList').innerHTML='<div class="empty-state">No se pudieron cargar los envíos de Desarrollo.</div>'}}
document.addEventListener('DOMContentLoaded',refresh);window.addEventListener('focus',refresh);window.setInterval(()=>{if(!document.hidden)refresh()},15000);

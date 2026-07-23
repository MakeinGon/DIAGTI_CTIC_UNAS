const steps=['infra','deploy','security','evidence'];
const stepNames={infra:'Infraestructura',deploy:'Despliegue',security:'Seguridad',evidence:'Evidencias'};
// Los sistemas asignados a Infraestructura provienen de los envíos reales
// realizados por Desarrollo; ya no se usa una lista fija de demostración.
const systems={};
const defaultStates={};
const sampleDrafts={};
const observationsBySystem={};
const ownersBySystem={};
let correctionMode=false;
const observationFieldNames={
  'Plataforma':'plataforma','Tipo de servidor':'tipoServidor','Sistema operativo':'sistemaOperativo',
  'Versión del sistema operativo':'versionSO','IP privada':'ipPrivada','¿Usa Proxmox?':'proxmox',
  '¿Cuenta con backup?':'backup','Frecuencia de backup':'frecuenciaBackup',
  'Observaciones':'observacionesInfra','Ambiente':'ambiente','Servidor':'servidor',
  'Puerto':'puerto','Dominio o subdominio':'dominio','Servidor web':'servidorWeb',
  'Proxy reverso':'proxy','Docker':'docker','Docker Compose':'compose','Exposición':'exposicion',
  'Mecanismo CI/CD':'cicd','SSL/TLS':'ssl','Método de autenticación':'autenticacion',
  'MFA':'mfa','Generación de logs':'logs','Cifrado de información':'cifrado',
  'Restricción por IP':'restriccionIp','Control de sesiones':'sesiones'
};
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
function usuarioAlmacenamiento(){return window.DIAGTIFlujo?.sesion?.().username||'infraestructura'}
function stateKey(code){return `diagti-estado-${usuarioAlmacenamiento()}-${code}`}
function stateOf(code){const saved=localStorage.getItem(stateKey(code));if(saved)return saved;try{const r=JSON.parse(localStorage.getItem(key(code))||'null');if(r?.estado)return r.estado}catch{}return defaultStates[code]||'Nuevo'}
function populateSystems(includeCode=''){systemSelect.innerHTML='<option value="">Seleccione un sistema</option>';let disponibles=0;Object.entries(systems).forEach(([code,name])=>{const st=stateOf(code);const available=includeCode?code===includeCode:(st==='Nuevo'||st==='Borrador');if(available){systemSelect.insertAdjacentHTML('beforeend',`<option value="${code}">${code} — ${name} (${st})</option>`);disponibles++}});if(!disponibles)systemSelect.insertAdjacentHTML('beforeend','<option value="" disabled>No hay sistemas enviados por Desarrollo pendientes de registro</option>');}
function addHistory(code,action,detail,state,section,after){const session=window.DIAGTIFlujo?.sesion?.()||{},historyKey=`diagti-historial-${session.username||'infraestructura'}`;let h=[];try{h=JSON.parse(localStorage.getItem(historyKey)||'[]')}catch{}h.unshift({id:`evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,date:new Date().toISOString(),code,name:systems[code],action,detail,user:session.nombreCompleto||session.username||'Infraestructura',state,section,after});localStorage.setItem(historyKey,JSON.stringify(h.slice(0,200)))}
let currentStep=0,currentSystem='',pendingSystem='',dirty=false,evidences=[],editingEvidence=-1;
const form=document.getElementById('formTecnico'), systemSelect=document.getElementById('sistema'), message=document.getElementById('mensaje');
const btnAnterior=document.getElementById('btnAnterior'),btnContinuar=document.getElementById('btnContinuar'),btnDraft=document.getElementById('btnGuardarBorrador'),btnSend=document.getElementById('btnEnviar');
function key(code){return `diagti-registro-${usuarioAlmacenamiento()}-${code}`}
function showModal(id){document.getElementById(id).classList.add('show')}
function hideModal(id){document.getElementById(id).classList.remove('show')}
function showStep(i){currentStep=Math.max(0,Math.min(steps.length-1,i));document.querySelectorAll('.step-panel').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.step').forEach(x=>x.classList.remove('active'));document.getElementById(steps[currentStep]).classList.add('active');document.querySelector(`.step[data-step="${steps[currentStep]}"]`).classList.add('active');btnAnterior.classList.toggle('hidden',currentStep===0);btnContinuar.classList.toggle('hidden',currentStep===steps.length-1);btnDraft.classList.toggle('hidden',correctionMode||currentStep!==steps.length-1);btnSend.classList.toggle('hidden',currentStep!==steps.length-1);btnSend.textContent=correctionMode?'Marcar como corregido':'Enviar a validación';message.textContent=''}
function formData(){const d={};[...form.elements].forEach(el=>{if(el.name&&el.type!=='file'&&el.tagName!=='BUTTON')d[el.name]=el.value});return d}
function fillForm(d={}){form.reset();[...form.elements].forEach(el=>{if(el.name&&el.type!=='file'&&d[el.name]!==undefined)el.value=d[el.name]});evidences=Array.isArray(d.evidences)?d.evidences:[];renderEvidences()}
function currentRecord(){if(!currentSystem)return null;try{return JSON.parse(localStorage.getItem(key(currentSystem))||'null')}catch{return null}}
function updateStatus(){const r=currentRecord();const savedState=currentSystem?localStorage.getItem(stateKey(currentSystem)):'';const badge=document.getElementById('estadoRegistro');if(correctionMode){badge.textContent=stateOf(currentSystem)==='Subsanado'?'Subsanado':'Observado';badge.className='status-badge draft';document.getElementById('selectorAyuda').textContent='Corrija los campos observados. Al terminar, marque el registro como corregido y luego reenvíelo desde Mis Sistemas.';return}const isDraft=(r&&r.estado==='Borrador')||savedState==='Borrador'||stateOf(currentSystem)==='Borrador';badge.textContent=isDraft?'Borrador':'Nuevo';badge.className=`status-badge ${isDraft?'draft':'new'}`;document.getElementById('selectorAyuda').textContent=isDraft?'Se cargaron automáticamente los datos guardados como borrador.':'Nuevo registro técnico. Complete los cuatro pasos.'}
function observationStep(observation){const section=String(observation.seccion||'').toLowerCase();if(section.includes('despliegue'))return 'deploy';if(section.includes('seguridad'))return 'security';if(section.includes('evidencia'))return 'evidence';return 'infra'}
function renderObservations(data={}){
  const panel=document.getElementById('observacionesTecnicas'),container=document.getElementById('listaObservacionesTecnicas');
  document.querySelectorAll('.observed-field').forEach(el=>el.classList.remove('observed-field'));
  if(!correctionMode){panel.classList.add('hidden');container.innerHTML='';return}
  const observations=observationsBySystem[currentSystem]||[];
  const previous=Array.isArray(data.subsanacion?.respuestas)?data.subsanacion.respuestas:[];
  panel.classList.remove('hidden');
  container.innerHTML=observations.length?observations.map((obs,index)=>`
    <article class="technical-observation" data-step="${observationStep(obs)}">
      <div><strong>${index+1}. ${escapeHtml(obs.seccion||'Validación de Infraestructura')} / ${escapeHtml(obs.campo||'Campo técnico')}</strong>
      <p>${escapeHtml(obs.detalle||'Revise la información registrada.')}</p>
      ${obs.evidenciaRequerida?'<span class="evidence-required">Requiere evidencia</span>':''}</div>
      <label>Respuesta de la corrección <span class="required">*</span>
        <textarea class="correction-response" data-index="${index}" placeholder="Explique qué corrigió">${escapeHtml(previous[index]?.respuesta||'')}</textarea>
      </label>
    </article>`).join(''):'<p>El validador solicitó revisar el formulario técnico. Verifique los cuatro pasos.</p>';
  observations.forEach(obs=>{
    const name=observationFieldNames[obs.campo];
    const field=name?form.elements.namedItem(name):null;
    if(field)field.closest('label')?.classList.add('observed-field');
  });
  container.querySelectorAll('.technical-observation').forEach(card=>{card.querySelector('strong').onclick=()=>showStep(steps.indexOf(card.dataset.step))});
}
function loadSystem(code){currentSystem=code;let r=currentRecord();if(!r&&sampleDrafts[code])r=sampleDrafts[code];fillForm(r?.data||{});renderObservations(r?.data||{});showStep(Number.isInteger(r?.ultimoPaso)?r.ultimoPaso:0);dirty=false;updateStatus();markCompleted()}
async function saveDraft(show=true){
  if(!currentSystem){message.className='message error';message.textContent='Seleccione un sistema.';return}
  const data={...formData(),evidences};
  const payload={estado:'Borrador',data,ultimoPaso:currentStep,updatedAt:new Date().toLocaleString('es-PE')};
  localStorage.setItem(key(currentSystem),JSON.stringify(payload));
  localStorage.setItem(stateKey(currentSystem),'Borrador');
  try{
    if(!window.DIAGTIFlujo)throw new Error('No se cargó el servicio de persistencia');
    await window.DIAGTIFlujo.guardarBorrador({
      codigoSistema:currentSystem,
      nombreSistema:systems[currentSystem],
      areaOrigen:'INFRAESTRUCTURA',
      areaUsuaria:data.areaUsuaria||'CTIC UNAS',
      comentario:'Avance del registro técnico',
      datos:data
    });
    addHistory(currentSystem,'Borrador','Se guardó el avance del registro técnico.','Borrador','Registro técnico','Borrador');
    dirty=false;
    updateStatus();
    hideModal('modalIncompleto');
    if(show){message.className='message success';message.textContent='Borrador guardado en PostgreSQL. Puede continuar cuando vuelva a ingresar.'}
  }catch(error){
    message.className='message error';
    message.textContent='El borrador quedó en este navegador, pero no se guardó en el servidor: '+error.message;
  }
}
function requiredFields(step){return [...document.querySelectorAll(`#${step} [required]`)]}
function validateStep(step,mark=true){let ok=true;requiredFields(step).forEach(el=>{const good=el.checkValidity()&&String(el.value).trim()!=='';if(mark)el.classList.toggle('invalid',!good);if(!good)ok=false});if(step==='evidence'&&evidences.length===0)ok=false;return ok}
function pending(){const p=[];if(!currentSystem)p.push('Sistema');steps.forEach(s=>{if(!validateStep(s,false))p.push(stepNames[s])});return p}
function markCompleted(){steps.forEach(s=>document.querySelector(`.step[data-step="${s}"]`).classList.toggle('completed',validateStep(s,false)))}
function requestSystemChange(next){if(!currentSystem||next===currentSystem){if(next)loadSystem(next);return}pendingSystem=next;const saved=!dirty;document.getElementById('textoCambio').textContent=saved?'Este registro ya está guardado. ¿Desea abrir otro sistema?':'Tiene cambios sin guardar. Si cambia de sistema, perderá la información no guardada.';showModal('modalCambio')}
systemSelect.addEventListener('change',e=>{const next=e.target.value;if(!next){e.target.value=currentSystem;return}e.target.value=currentSystem;requestSystemChange(next)});
document.getElementById('btnPermanecer').onclick=()=>{pendingSystem='';systemSelect.value=currentSystem;hideModal('modalCambio')};
document.getElementById('btnCambiar').onclick=()=>{hideModal('modalCambio');systemSelect.value=pendingSystem;loadSystem(pendingSystem);pendingSystem=''};
document.querySelectorAll('.step').forEach(b=>b.onclick=()=>showStep(steps.indexOf(b.dataset.step)));
btnContinuar.onclick=()=>{if(!currentSystem){message.className='message error';message.textContent='Seleccione un sistema antes de continuar.';return}if(!validateStep(steps[currentStep],true)){message.className='message error';message.textContent='Complete los campos obligatorios antes de continuar.';return}markCompleted();showStep(currentStep+1)};
btnAnterior.onclick=()=>showStep(currentStep-1);
document.getElementById('btnCancelar').onclick=()=>{if(confirm('¿Desea descartar los cambios no guardados?')){const r=currentRecord();fillForm(r?.data||{});dirty=false;showStep(Number.isInteger(r?.ultimoPaso)?r.ultimoPaso:0)}};
form.addEventListener('input',e=>{dirty=true;e.target.classList.remove('invalid')});form.addEventListener('change',e=>{dirty=true;e.target.classList.remove('invalid')});
function evidenceInput(){return {tipo:document.getElementById('evTipo'),nombre:document.getElementById('evNombre'),archivo:document.getElementById('evArchivo'),url:document.getElementById('evUrl'),descripcion:document.getElementById('evDescripcion')}}
function clearEvidence(){const x=evidenceInput();x.tipo.value='';x.nombre.value='';x.archivo.value='';x.url.value='';x.descripcion.value='';editingEvidence=-1;document.getElementById('btnAgregarEvidencia').textContent='Agregar evidencia'}
function renderEvidences(){const body=document.getElementById('tablaEvidencias');document.getElementById('contadorEvidencias').textContent=evidences.length;if(!evidences.length){body.innerHTML='<tr class="empty-row"><td colspan="5">Todavía no se agregaron evidencias.</td></tr>';return}body.innerHTML=evidences.map((e,i)=>`<tr><td>${e.tipo}</td><td>${e.nombre}</td><td>${e.archivo||e.url}</td><td>${e.descripcion||'—'}</td><td><button type="button" class="table-btn edit-ev" data-i="${i}">Editar</button><button type="button" class="table-btn delete-ev" data-i="${i}">Eliminar</button></td></tr>`).join('');body.querySelectorAll('.edit-ev').forEach(b=>b.onclick=()=>editEvidence(+b.dataset.i));body.querySelectorAll('.delete-ev').forEach(b=>b.onclick=()=>{evidences.splice(+b.dataset.i,1);dirty=true;renderEvidences();markCompleted()})}
function editEvidence(i){const e=evidences[i],x=evidenceInput();x.tipo.value=e.tipo;x.nombre.value=e.nombre;x.url.value=e.url||'';x.descripcion.value=e.descripcion||'';x.archivo.value='';editingEvidence=i;document.getElementById('btnAgregarEvidencia').textContent='Actualizar evidencia';window.scrollTo({top:document.getElementById('evidence').offsetTop-20,behavior:'smooth'})}
document.getElementById('btnAgregarEvidencia').onclick=()=>{const x=evidenceInput(),file=x.archivo.files[0]?.name||'',err=document.getElementById('errorEvidencia');if(!x.tipo.value||!x.nombre.value.trim()||(!file&&!x.url.value.trim())){err.textContent='Complete tipo, nombre y agregue un archivo o una URL.';return}const old=editingEvidence>=0?evidences[editingEvidence]:{};const ev={tipo:x.tipo.value,nombre:x.nombre.value.trim(),archivo:file||old.archivo||'',url:x.url.value.trim(),descripcion:x.descripcion.value.trim()};if(editingEvidence>=0)evidences[editingEvidence]=ev;else evidences.push(ev);err.textContent='';dirty=true;clearEvidence();renderEvidences();markCompleted()};
btnDraft.onclick=()=>saveDraft();
function correctionResponses(){
  return [...document.querySelectorAll('.correction-response')].map((field,index)=>({
    observacion:observationsBySystem[currentSystem]?.[index]||{},
    respuesta:field.value.trim()
  }));
}
async function saveCorrection(){
  const responses=correctionResponses();
  if(responses.some(item=>!item.respuesta)){
    message.className='message error';
    message.textContent='Explique la corrección realizada para cada observación del validador.';
    document.getElementById('observacionesTecnicas').scrollIntoView({behavior:'smooth'});
    return;
  }
  const data={...formData(),evidences,subsanacion:{estado:'SUBSANADO',fecha:new Date().toISOString(),respuestas:responses}};
  btnSend.disabled=true;
  btnSend.textContent='Guardando...';
  try{
    await window.DIAGTIFlujo.guardarCorreccion({
      codigoSistema:currentSystem,
      nombreSistema:systems[currentSystem],
      areaOrigen:'INFRAESTRUCTURA',
      areaUsuaria:data.areaUsuaria||'CTIC UNAS',
      comentario:'Observaciones técnicas corregidas',
      datos:data
    });
    const payload={estado:'Subsanado',data,ultimoPaso:3,updatedAt:new Date().toLocaleString('es-PE')};
    localStorage.setItem(key(currentSystem),JSON.stringify(payload));
    localStorage.setItem(stateKey(currentSystem),'Subsanado');
    addHistory(currentSystem,'Subsanación','Se corrigieron los campos observados del formulario técnico.','Subsanado','Flujo de validación','Subsanado');
    dirty=false;
    message.className='message success';
    message.textContent='Corrección guardada en PostgreSQL. Ahora puede reenviarla desde Mis Sistemas.';
    setTimeout(()=>location.href='mis-sistemas.html',1000);
  }catch(error){
    message.className='message error';
    message.textContent='No se pudo guardar la corrección: '+error.message;
  }finally{
    btnSend.disabled=false;
    btnSend.textContent='Marcar como corregido';
  }
}
btnSend.onclick=()=>{const p=pending();if(p.length){document.getElementById('listaPendientes').innerHTML=p.map(x=>`<li>${x}</li>`).join('');showModal('modalIncompleto');return}if(correctionMode){if(confirm('¿Confirma que corrigió todas las observaciones técnicas?'))saveCorrection();return}showModal('modalEnviar')};
document.getElementById('btnRegresar').onclick=()=>{hideModal('modalIncompleto');const i=steps.findIndex(s=>!validateStep(s,false));showStep(i<0?0:i);validateStep(steps[currentStep],true)};
document.getElementById('btnBorradorModal').onclick=()=>saveDraft();
document.getElementById('btnCancelarEnvio').onclick=()=>hideModal('modalEnviar');
document.getElementById('btnConfirmarEnvio').onclick=async()=>{
  const button=document.getElementById('btnConfirmarEnvio');
  const data={...formData(),evidences};
  button.disabled=true;
  button.textContent='Enviando...';
  try{
    const session=JSON.parse(localStorage.getItem('diagti_session')||'{}');
    const envio={
        codigoSistema:currentSystem,
        nombreSistema:systems[currentSystem],
        areaOrigen:'INFRAESTRUCTURA',
        areaUsuaria:data.areaUsuaria||'CTIC UNAS',
        responsable:session.nombreCompleto||session.username||'Área de Infraestructura',
        comentario:'Registro técnico enviado para validación',
        datos:data
      };
    if(window.DIAGTIFlujo)await window.DIAGTIFlujo.enviar(envio);
    else{
      envio.usuarioOrigen=session.username||session.nombreCompleto||'Infraestructura';
      const response=await fetch('/api/flujo-validacion/solicitudes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(envio)});
      if(!response.ok)throw new Error(await response.text()||`Error ${response.status}`);
    }
    const payload={estado:'Enviado',data,ultimoPaso:3,updatedAt:new Date().toLocaleString('es-PE')};
    localStorage.setItem(key(currentSystem),JSON.stringify(payload));
    localStorage.setItem(stateKey(currentSystem),'Enviado');
    addHistory(currentSystem,'Envío','El registro técnico fue enviado al Validador CTIC.','Enviado','Flujo de validación','Enviado');
    dirty=false;
    hideModal('modalEnviar');
    message.className='message success';
    message.textContent='Registro guardado en PostgreSQL y enviado al Validador CTIC.';
    setTimeout(()=>location.href='mis-sistemas.html',900);
  }catch(error){
    message.className='message error';
    message.textContent='No se pudo enviar al Validador: '+error.message;
    hideModal('modalEnviar');
  }finally{
    button.disabled=false;
    button.textContent='Enviar';
  }
};
async function syncFromBackend(){
  if(!window.DIAGTIFlujo)return;
  try{
    const session=window.DIAGTIFlujo.sesion();
    const asignados=await window.DIAGTIFlujo.listarRegistros('INFRAESTRUCTURA',session.username);
    Object.keys(systems).forEach(code=>delete systems[code]);
    asignados.forEach(s=>{
      systems[s.codigoSistema]=s.nombreSistema;
      ownersBySystem[s.codigoSistema]=s.usuarioInfraestructura||'';
      try{
        const parsed=JSON.parse(s.observacionesJson||'[]');
        observationsBySystem[s.codigoSistema]=Array.isArray(parsed)?parsed:[];
      }catch(_){
        observationsBySystem[s.codigoSistema]=s.comentarioRevision?[{seccion:'Infraestructura tecnológica',campo:'General',detalle:s.comentarioRevision,evidenciaRequerida:false}]:[];
      }
      localStorage.setItem(`diagti-desarrollo-${s.codigoSistema}`,JSON.stringify({
        datos:s.datosDesarrollo||{},
        fechaEnvio:s.fechaEnvioDesarrollo
      }));
      const estadoServidor=window.DIAGTIFlujo.estadoPantalla(s.estado||'NUEVO');
      const estadoLocal=localStorage.getItem(stateKey(s.codigoSistema));
      const conservarCorreccion=['Subsanado','Corregido'].includes(estadoLocal)&&estadoServidor==='Observado';
      const estado=conservarCorreccion?estadoLocal:estadoServidor;
      localStorage.setItem(stateKey(s.codigoSistema),estado);
      if(s.idRegistro){
        localStorage.setItem(key(s.codigoSistema),JSON.stringify({
          estado,
          data:s.datosInfraestructura||{},
          ultimoPaso:estado==='Borrador'?0:3,
          updatedAt:s.fechaActualizacion||s.fechaEnvioInfraestructura
        }));
      }else if(estadoServidor==='Nuevo'){
        // El servidor confirmó un ciclo nuevo de Desarrollo. Se elimina el
        // formulario técnico anterior para empezar el registro desde cero.
        localStorage.removeItem(key(s.codigoSistema));
        localStorage.removeItem(`subsanacion-${usuarioAlmacenamiento()}-${s.codigoSistema}`);
      }
    });
  }catch(error){
    message.className='message error';
    message.textContent='No se pudieron actualizar los estados: '+error.message;
  }
}

async function init(){
  await syncFromBackend();
  const params=new URLSearchParams(location.search),initial=params.get('sistema');
  correctionMode=params.get('subsanar')==='1';
  if(correctionMode)document.getElementById('btnBorradorModal').classList.add('hidden');
  populateSystems(correctionMode?initial:'');
  const state=stateOf(initial);
  const user=window.DIAGTIFlujo?.sesion?.().username||'';
  const owner=ownersBySystem[initial]||'';
  const allowedInitial=!correctionMode&&['Nuevo','Borrador'].includes(state);
  const allowedCorrection=correctionMode&&['Observado','Rechazado','Subsanado','Corregido'].includes(state);
  const isOwner=!owner||String(owner).toLowerCase()===String(user).toLowerCase();
  if(initial&&systems[initial]&&(allowedInitial||allowedCorrection)&&isOwner){
    systemSelect.value=initial;
    loadSystem(initial);
  }else{
    updateStatus();showStep(0);
    if(initial&&systems[initial]&&!isOwner){message.className='message error';message.textContent=`Este registro está asignado a ${owner}. Puede consultarlo desde Mis Sistemas, pero sólo el responsable puede modificarlo.`}
    else if(initial&&systems[initial]){message.className='message error';message.textContent=correctionMode?'El sistema no tiene una observación técnica pendiente de subsanación.':'Este sistema ya inició el flujo de validación. Solo los sistemas Nuevos o en Borrador pueden abrirse aquí.'}
  }
}
init();
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});

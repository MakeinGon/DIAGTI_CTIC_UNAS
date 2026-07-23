const KEY='diagti_funcional_sistemas';
const base=[
 {id:'SYS-001',codigo:'SYS-001',nombre:'Sistema Académico',area:'Académica',estado:'Nuevo'},
 {id:'SYS-002',codigo:'SYS-002',nombre:'Trámite Documentario',area:'Administración',estado:'Nuevo'},
 {id:'SYS-003',codigo:'SYS-003',nombre:'Sistema de Biblioteca',area:'Biblioteca',estado:'Nuevo'},
 {id:'SYS-004',codigo:'SYS-004',nombre:'Recursos Humanos',area:'Recursos Humanos',estado:'Nuevo'},
 {id:'SYS-005',codigo:'SYS-005',nombre:'Sistema Financiero',area:'Finanzas',estado:'Nuevo'}
];

function locales(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||base}catch{return base}}
function guardar(lista){localStorage.setItem(KEY,JSON.stringify(lista))}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function qs(id){return document.getElementById(id)}
function salir(){localStorage.removeItem('diagti_session');location.href='../login/html/login.html'}
window.salir=salir;

async function sync(){
 if(!window.DIAGTIFlujo)return locales();
 return window.DIAGTIFlujo.sincronizarColeccion(KEY,'FUNCIONAL',locales());
}

function acciones(s){
 const ver=`<a class="btn outline" href="ver-sistema.html?codigo=${encodeURIComponent(s.codigo)}">Ver</a>`;
 if(['Enviado','Validado'].includes(s.estado))return ver;
 const texto=s.estado==='Observado'?'Subsanar':'Confirmar';
 return `${ver} <a class="btn primary" href="confirmar-informacion.html?codigo=${encodeURIComponent(s.codigo)}">${texto}</a>`;
}

async function dashboard(){
 const lista=await sync();
 const count=e=>lista.filter(s=>s.estado===e).length;
 qs('total').textContent=lista.length;qs('borrador').textContent=count('Borrador')+count('Nuevo');qs('enviado').textContent=count('Enviado');qs('observado').textContent=count('Observado');
 qs('actividad').innerHTML=lista.map(s=>`<tr><td><strong>${esc(s.codigo)}</strong></td><td>${esc(s.nombre)}</td><td><span class="badge ${esc(s.estado)}">${esc(s.estado)}</span></td><td>${acciones(s)}</td></tr>`).join('');
}

async function misSistemas(){
 const lista=await sync(),body=qs('body'),buscar=qs('buscar'),estado=qs('estado');
 function render(){const q=buscar.value.toLowerCase();const filtrados=lista.filter(s=>(`${s.codigo} ${s.nombre} ${s.area}`).toLowerCase().includes(q)&&(!estado.value||s.estado===estado.value));body.innerHTML=filtrados.length?filtrados.map(s=>`<tr><td><strong>${esc(s.codigo)}</strong></td><td>${esc(s.nombre)}</td><td>${esc(s.area||'--')}</td><td><span class="badge ${esc(s.estado)}">${esc(s.estado)}</span></td><td>${acciones(s)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">No hay sistemas.</td></tr>'}
 buscar.oninput=render;estado.onchange=render;render();
}

async function verSistema(){
 const codigo=new URLSearchParams(location.search).get('codigo'),lista=await sync(),s=lista.find(x=>x.codigo===codigo);
 if(!s){qs('detalle').innerHTML='<p class="empty">Sistema no encontrado.</p>';return}
 qs('titulo').textContent=s.nombre;
 qs('detalle').innerHTML=`<dl class="detail"><dt>Código</dt><dd>${esc(s.codigo)}</dd><dt>Área usuaria</dt><dd>${esc(s.area||'--')}</dd><dt>Estado funcional</dt><dd><span class="badge ${esc(s.estado)}">${esc(s.estado)}</span></dd><dt>Proceso</dt><dd>${esc(s.proceso||'--')}</dd><dt>Objetivo</dt><dd>${esc(s.objetivo||'--')}</dd><dt>Usuarios</dt><dd>${esc(s.usuarios||'--')}</dd><dt>Alcance</dt><dd>${esc(s.alcance||'--')}</dd><dt>Respuesta del Validador</dt><dd>${esc(s.respuesta_validacion||'Sin respuesta todavía')}</dd><dt>Revisado por</dt><dd>${esc(s.revisado_por||'--')}</dd></dl>`;
 qs('editar').href=`confirmar-informacion.html?codigo=${encodeURIComponent(s.codigo)}`;
 qs('editar').style.display=['Enviado','Validado'].includes(s.estado)?'none':'inline-block';
}

async function confirmar(){
 const codigo=new URLSearchParams(location.search).get('codigo'),lista=await sync(),s=lista.find(x=>x.codigo===codigo);
 if(!s){qs('form').innerHTML='<p class="empty">Sistema no encontrado.</p>';return}
 qs('nombre').textContent=`${s.codigo} — ${s.nombre}`;
 ['area','responsable_funcional','proceso','objetivo','usuarios','alcance','criticidad_funcional','observaciones_funcionales'].forEach(id=>{if(qs(id))qs(id).value=s[id]||''});
 if(s.estado==='Observado')qs('respuesta').innerHTML=`<div class="notice error"><strong>Observación del Validador:</strong><br>${esc(s.respuesta_validacion||'Revise la información enviada.')}</div>`;
 qs('guardar').onclick=()=>{const actualizado=recoger(s);actualizado.estado='Borrador';reemplazar(lista,actualizado);mostrar('Borrador guardado correctamente.','success')};
 qs('form').onsubmit=async e=>{e.preventDefault();const actualizado=recoger(s);if(!actualizado.area||!actualizado.responsable_funcional||!actualizado.proceso||!actualizado.objetivo||!actualizado.usuarios||!actualizado.alcance){mostrar('Complete todos los campos obligatorios.','error');return}try{qs('enviar').disabled=true;await window.DIAGTIFlujo.enviar({codigoSistema:actualizado.codigo,nombreSistema:actualizado.nombre,areaOrigen:'FUNCIONAL',areaUsuaria:actualizado.area,responsable:actualizado.responsable_funcional,comentario:s.estado==='Observado'?'Información funcional subsanada':'Información funcional confirmada',datos:actualizado});actualizado.estado='Enviado';actualizado.observaciones_validador=[];reemplazar(lista,actualizado);mostrar('Información guardada en PostgreSQL y enviada al Validador.','success');setTimeout(()=>location.href='mis-sistemas.html',900)}catch(error){mostrar('No se envió; puede reintentar: '+error.message,'error')}finally{qs('enviar').disabled=false}};
}

function recoger(s){const r={...s};['area','responsable_funcional','proceso','objetivo','usuarios','alcance','criticidad_funcional','observaciones_funcionales'].forEach(id=>r[id]=qs(id)?.value.trim()||'');return r}
function reemplazar(lista,s){const i=lista.findIndex(x=>x.codigo===s.codigo);if(i>=0)lista[i]=s;else lista.push(s);guardar(lista)}
function mostrar(texto,tipo){qs('mensaje').className=`notice ${tipo}`;qs('mensaje').textContent=texto;qs('mensaje').hidden=false}

async function historial(){
 try{const items=await window.DIAGTIFlujo.historial('FUNCIONAL');qs('body').innerHTML=items.length?items.map(s=>`<tr><td>${esc((s.fechaRevision||s.fechaEnvio||'').replace('T',' ').slice(0,16))}</td><td>${esc(s.codigoSistema)} — ${esc(s.nombreSistema)}</td><td><span class="badge ${esc(window.DIAGTIFlujo.estadoPantalla(s.estado))}">${esc(window.DIAGTIFlujo.estadoPantalla(s.estado))}</span></td><td>${esc(s.comentarioRevision||s.comentario||'--')}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">No hay movimientos.</td></tr>'}catch(error){qs('body').innerHTML=`<tr><td colspan="4" class="empty">No se pudo cargar: ${esc(error.message)}</td></tr>`}
}

const paginas={dashboard,misSistemas,verSistema,confirmar,historial};
document.addEventListener('DOMContentLoaded',()=>{const fn=paginas[document.body.dataset.page];if(fn)fn();window.addEventListener('focus',()=>{if(fn&&document.body.dataset.page!=='confirmar')fn()});window.setInterval(()=>{if(fn&&!document.hidden&&document.body.dataset.page!=='confirmar')fn()},15000)});

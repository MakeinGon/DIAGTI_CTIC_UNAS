// ============================================================
// Modal: abrir / cerrar
// ============================================================
function abrirModal(id){ document.getElementById(id).classList.add('open'); }
function cerrarModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(ov){
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.classList.remove('open'); });
});

// ============================================================
// Cerrar sesión
// ============================================================
function cerrarSesion() {
    // Muestra la pantalla de confirmación antes de cerrar la sesión
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) overlay.classList.add('open');
}

function cancelarCerrarSesion() {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) overlay.classList.remove('open');
}

function confirmarCerrarSesion() {
    // Eliminar datos de sesión (si existen)
    localStorage.clear();
    sessionStorage.clear();

    // Redirigir al login
    window.location.href = "../../../login/html/login.html";
}

document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('logout-confirm-overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) cancelarCerrarSesion();
        });
    }
});

// ============================================================
// Confirmación genérica (usada para eliminar usuarios, etc.)
// ============================================================
let accionConfirmada = null;

function pedirConfirmacion(mensaje, callback, textoBoton){
  document.getElementById('confirmar-mensaje').textContent = mensaje;
  document.getElementById('confirmar-btn-aceptar').textContent = textoBoton || 'Eliminar';
  accionConfirmada = callback;
  abrirModal('modal-confirmar');
}

document.getElementById('confirmar-btn-aceptar').addEventListener('click', function(){
  if(typeof accionConfirmada === 'function'){ accionConfirmada(); }
  accionConfirmada = null;
  cerrarModal('modal-confirmar');
});

// ============================================================
// Mensajes de error de formulario
// ============================================================
function mostrarErrorFormulario(id, mensaje){
  const el = document.getElementById(id);
  if(el){ el.textContent = mensaje; el.style.display = 'block'; }
}
function ocultarErrorFormulario(id){
  const el = document.getElementById(id);
  if(el){ el.style.display = 'none'; }
}

// ============================================================
// Toggle de estado activo/inactivo (delegado, funciona también
// con filas agregadas dinámicamente)
// ============================================================
document.addEventListener('click', function(e){
  const btn = e.target.closest('.toggle');
  if(!btn) return;
  btn.classList.toggle('on');
  btn.title = btn.classList.contains('on') ? 'Activo' : 'Inactivo';
  filtrarUsuarios();
  actualizarContadoresUsuarios();
});

// ============================================================
// Filtro de la tabla de usuarios (búsqueda + selects)
// ============================================================
function filtrarUsuarios(){
  const texto = (document.getElementById('filtro-busqueda').value || '').trim().toLowerCase();
  const rol = document.getElementById('filtro-rol').value;
  const estado = document.getElementById('filtro-estado').value;
  const origen = document.getElementById('filtro-origen').value;

  let visibles = 0;
  document.querySelectorAll('#tabla-usuarios-body tr').forEach(function(fila){
    if(fila.id === 'fila-usuarios-vacia') return;
    const nombre = (fila.querySelector('.nm') ? fila.querySelector('.nm').textContent : '').toLowerCase();
    const correo = (fila.querySelector('.em') ? fila.querySelector('.em').textContent : '').toLowerCase();
    const dni = fila.children[1].textContent.trim().toLowerCase();
    const rolTexto = fila.children[3].textContent.trim();
    const origenTexto = fila.children[4].textContent.trim();
    const toggle = fila.querySelector('.toggle');
    const estadoTexto = toggle && toggle.classList.contains('on') ? 'Activo' : 'Inactivo';

    let visible = true;
    if(texto && !(nombre.includes(texto) || correo.includes(texto) || dni.includes(texto))) visible = false;
    if(rol !== 'Todos los roles' && rolTexto !== rol) visible = false;
    if(estado !== 'Todos los estados' && estadoTexto !== estado) visible = false;
    if(origen !== 'Todo origen' && origenTexto !== origen) visible = false;

    fila.style.display = visible ? '' : 'none';
    if(visible) visibles++;
  });

  const filaVacia = document.getElementById('fila-usuarios-vacia');
  if(visibles === 0){
    if(!filaVacia){
      const tr = document.createElement('tr');
      tr.id = 'fila-usuarios-vacia';
      tr.innerHTML = '<td colspan="8" class="empty">No se encontraron usuarios con los filtros aplicados.</td>';
      document.getElementById('tabla-usuarios-body').appendChild(tr);
    }
  } else if(filaVacia){
    filaVacia.remove();
  }
}

// ============================================================
// Alta / edición de usuarios
// ============================================================
let usuarioEditando = null;

const BADGE_POR_ROL = {
  'Administrador CTIC':'crit',
  'Área de Desarrollo':'brand',
  'Área de Infraestructura':'med',
  'Responsable Funcional':'info',
  'Validador Técnico':'high',
  'Auditor':'gray',
  'Directivo':'crit'
};

function limpiarFormularioUsuario(){
  document.getElementById('input-usuario-dni').value = '';
  document.getElementById('input-usuario-nombre').value = '';
  document.getElementById('input-usuario-correo').value = '';
  document.getElementById('select-usuario-area').selectedIndex = 0;
  document.getElementById('select-usuario-rol').selectedIndex = 0;
  document.getElementById('select-usuario-origen').selectedIndex = 0;
  document.getElementById('select-usuario-estado').selectedIndex = 0;
  ocultarErrorFormulario('usuario-form-error');
}

function abrirNuevoUsuario(){
  usuarioEditando = null;
  document.getElementById('usuario-modal-titulo').textContent = 'Nuevo usuario';
  document.getElementById('usuario-btn-guardar').textContent = 'Guardar usuario';
  limpiarFormularioUsuario();
  abrirModal('modal-usuario');
}

function editarUsuario(fila){
  usuarioEditando = fila;
  document.getElementById('usuario-modal-titulo').textContent = 'Editar usuario';
  document.getElementById('usuario-btn-guardar').textContent = 'Guardar cambios';
  ocultarErrorFormulario('usuario-form-error');

  document.getElementById('input-usuario-dni').value = fila.children[1].textContent.trim();
  document.getElementById('input-usuario-nombre').value = fila.querySelector('.nm').textContent.trim();
  document.getElementById('input-usuario-correo').value = fila.querySelector('.em').textContent.trim();
  document.getElementById('select-usuario-area').value = fila.children[2].textContent.trim();
  document.getElementById('select-usuario-rol').value = fila.children[3].textContent.trim();
  document.getElementById('select-usuario-origen').value = fila.children[4].textContent.trim();
  const activo = fila.querySelector('.toggle').classList.contains('on');
  document.getElementById('select-usuario-estado').value = activo ? 'Activo' : 'Inactivo';

  abrirModal('modal-usuario');
}

// ============================================================
// Expresiones regulares de validación
// ============================================================
const RE_DNI = /^\d{8}$/;
const RE_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/; // al menos nombre + apellido, solo letras
const RE_CORREO_INSTITUCIONAL = /^[A-Za-z0-9._%+-]+@unas\.edu\.pe$/i;

function guardarUsuario(){
  const dni = document.getElementById('input-usuario-dni').value.trim();
  const nombre = document.getElementById('input-usuario-nombre').value.trim().replace(/\s+/g, ' ');
  const correo = document.getElementById('input-usuario-correo').value.trim();
  const area = document.getElementById('select-usuario-area').value;
  const rol = document.getElementById('select-usuario-rol').value;
  const origen = document.getElementById('select-usuario-origen').value;
  const estado = document.getElementById('select-usuario-estado').value;

  if(!dni || !nombre || !correo){
    mostrarErrorFormulario('usuario-form-error', 'Completa DNI, nombre completo y correo institucional.');
    return;
  }
  if(!RE_DNI.test(dni)){
    mostrarErrorFormulario('usuario-form-error', 'El DNI debe tener exactamente 8 dígitos numéricos.');
    return;
  }
  if(!RE_NOMBRE.test(nombre)){
    mostrarErrorFormulario('usuario-form-error', 'Ingresa nombre y apellido usando solo letras (sin números ni símbolos).');
    return;
  }
  if(!RE_CORREO_INSTITUCIONAL.test(correo)){
    mostrarErrorFormulario('usuario-form-error', 'Ingresa un correo institucional válido, con el formato usuario@unas.edu.pe.');
    return;
  }

  // DNI duplicado: solo si es un usuario nuevo, o si al editar se cambió el DNI
  const dniDuplicado = Array.from(document.querySelectorAll('#tabla-usuarios-body tr')).some(function(fila){
    if(fila.id === 'fila-usuarios-vacia') return false;
    if(usuarioEditando && fila === usuarioEditando) return false;
    return fila.children[1].textContent.trim() === dni;
  });
  if(dniDuplicado){
    mostrarErrorFormulario('usuario-form-error', 'Ya existe un usuario registrado con ese DNI.');
    return;
  }

  ocultarErrorFormulario('usuario-form-error');

  const iniciales = nombre.split(' ').filter(Boolean).slice(0, 2).map(function(p){ return p[0].toUpperCase(); }).join('');
  const badgeRol = BADGE_POR_ROL[rol] || 'gray';
  const badgeOrigen = origen === 'LDAP' ? 'info' : 'gray';
  const activo = estado === 'Activo';
  const ultimoAcceso = usuarioEditando ? usuarioEditando.children[5].textContent : 'Recién agregado';

  const filaHTML =
    '<td><div class="cell-user"><div class="av">' + iniciales + '</div><div><div class="nm">' + nombre + '</div><div class="em">' + correo + '</div></div></div></td>' +
    '<td>' + dni + '</td>' +
    '<td>' + area + '</td>' +
    '<td><span class="badge ' + badgeRol + '">' + rol + '</span></td>' +
    '<td><span class="badge ' + badgeOrigen + '">' + origen + '</span></td>' +
    '<td>' + ultimoAcceso + '</td>' +
    '<td><button class="toggle' + (activo ? ' on' : '') + '" title="' + (activo ? 'Activo' : 'Inactivo') + '"></button></td>' +
    '<td><div class="row-actions"><button class="btn ghost sm" onclick="editarUsuario(this.closest(\'tr\'))">Editar</button><button class="btn danger sm" onclick="eliminarUsuario(this.closest(\'tr\'))">Eliminar</button></div></td>';

  if(usuarioEditando){
    usuarioEditando.innerHTML = filaHTML;
  } else {
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = filaHTML;
    document.getElementById('tabla-usuarios-body').appendChild(nuevaFila);
  }

  cerrarModal('modal-usuario');
  filtrarUsuarios();
  actualizarContadoresUsuarios();
}

function eliminarUsuario(fila){
  const nombre = fila.querySelector('.nm').textContent.trim();
  pedirConfirmacion(
    '¿Eliminar al usuario "' + nombre + '"? Esta acción no se puede deshacer.',
    function(){
      fila.remove();
      filtrarUsuarios();
      actualizarContadoresUsuarios();
    }
  );
}

// ============================================================
// Estadísticas del panel (tarjetas superiores)
// ============================================================
function actualizarContadoresUsuarios(){
  const filas = document.querySelectorAll('#tabla-usuarios-body tr:not(#fila-usuarios-vacia)');
  const total = filas.length;
  let activos = 0, ldap = 0;
  filas.forEach(function(fila){
    const toggle = fila.querySelector('.toggle');
    if(toggle && toggle.classList.contains('on')) activos++;
    if(fila.children[4] && fila.children[4].textContent.trim() === 'LDAP') ldap++;
  });
  document.getElementById('stat-total-usuarios').textContent = total;
  document.getElementById('stat-activos-usuarios').textContent = activos;
  document.getElementById('stat-inactivos-usuarios').textContent = total - activos;
  document.getElementById('stat-ldap-usuarios').textContent = ldap;
}

// Inicializar contadores al cargar la página
actualizarContadoresUsuarios();

// ============================================================
// Saneo en vivo: el campo DNI solo admite dígitos (máx. 8)
// ============================================================
const inputDni = document.getElementById('input-usuario-dni');
if(inputDni){
  inputDni.setAttribute('maxlength', '8');
  inputDni.setAttribute('inputmode', 'numeric');
  inputDni.addEventListener('input', function(){
    this.value = this.value.replace(/\D/g, '').slice(0, 8);
  });
}

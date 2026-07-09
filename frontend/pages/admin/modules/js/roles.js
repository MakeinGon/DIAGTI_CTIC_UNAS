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
function confirmarCerrarSesion(){
  cerrarModal('modal-logout');
  // TODO: reemplazar esta línea por la lógica real de logout:
  // invalidar el token/sesión en el backend, limpiar datos locales y
  // redirigir a la pantalla de login, por ejemplo:
  // window.location.href = '/login';
  window.location.reload();
}

// ============================================================
// Confirmación genérica (usada para eliminar roles, etc.)
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
// Selector de rol: muestra la vista estática correspondiente
// ============================================================
function mostrarRol(rolKey, el){
  document.querySelectorAll('.role-view').forEach(function(v){ v.classList.remove('active'); });
  const vista = document.getElementById('role-' + rolKey);
  if(vista) vista.classList.add('active');
  document.querySelectorAll('#lista-roles .list-item').forEach(function(i){ i.classList.remove('active'); });
  if(el) el.classList.add('active');
}

// ============================================================
// Matriz de permisos: marcar / desmarcar cada casilla al hacer
// clic (delegado: también funciona en matrices creadas después)
// ============================================================
document.addEventListener('click', function(e){
  const box = e.target.closest('.perm-box');
  if(box) box.classList.toggle('on');
});

// ============================================================
// "Guardar cambios" de la matriz de permisos: los checks ya se
// guardan al vuelo (delegación de arriba); este botón solo da
// una confirmación visual al usuario.
// ============================================================
function guardarPermisos(btn){
  const textoOriginal = btn.textContent;
  btn.textContent = '✓ Guardado';
  btn.disabled = true;
  setTimeout(function(){
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }, 1200);
}

// ============================================================
// Alta / edición / eliminación de roles
// ============================================================
let rolEditando = null;

const MODULOS_SISTEMA = [
  'Dashboard ejecutivo', 'Inventario de sistemas', 'Registro de sistemas',
  'Validación técnica', 'Evidencias técnicas', 'Auditoría y trazabilidad',
  'Reportes', 'Usuarios y roles', 'Catálogos'
];

// Roles predefinidos disponibles como base al crear uno nuevo
const ROL_BASE_A_ID = {
  'Validador Técnico': 'role-validador',
  'Auditor': 'role-auditor',
  'Área de Desarrollo': 'role-desarrollo'
};

function construirFilasMatriz(){
  return MODULOS_SISTEMA.map(function(mod){
    const celdas = '<td><span class="perm-box"></span></td>'.repeat(6);
    return '<tr><td>' + mod + '</td>' + celdas + '</tr>';
  }).join('');
}

function limpiarFormularioRol(){
  document.getElementById('input-rol-nombre').value = '';
  document.getElementById('textarea-rol-desc').value = '';
  document.getElementById('select-rol-base').selectedIndex = 0;
  ocultarErrorFormulario('rol-form-error');
}

function abrirNuevoRol(){
  rolEditando = null;
  document.getElementById('rol-modal-titulo').textContent = 'Nuevo rol';
  document.getElementById('rol-btn-guardar').textContent = 'Crear rol';
  document.getElementById('select-rol-base').style.display = '';
  document.getElementById('select-rol-base').previousElementSibling.style.display = '';
  limpiarFormularioRol();
  abrirModal('modal-rol');
}

function editarRol(btn){
  const vista = btn.closest('.role-view');
  rolEditando = vista;
  document.getElementById('rol-modal-titulo').textContent = 'Editar rol';
  document.getElementById('rol-btn-guardar').textContent = 'Guardar cambios';
  ocultarErrorFormulario('rol-form-error');

  document.getElementById('input-rol-nombre').value = vista.querySelector('.role-header h3').textContent.trim();
  document.getElementById('textarea-rol-desc').value = vista.querySelector('.role-header p').textContent.trim();
  // Al editar un rol existente no aplica lo de "basarlo en otro rol"
  document.getElementById('select-rol-base').selectedIndex = 0;
  document.getElementById('select-rol-base').style.display = 'none';
  document.getElementById('select-rol-base').previousElementSibling.style.display = 'none';

  abrirModal('modal-rol');
}

// ============================================================
// Expresión regular de validación para el nombre del rol
// ============================================================
const RE_NOMBRE_ROL = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.-]{2,59}$/;

function guardarRol(){
  const nombre = document.getElementById('input-rol-nombre').value.trim().replace(/\s+/g, ' ');
  const desc = document.getElementById('textarea-rol-desc').value.trim();
  const base = document.getElementById('select-rol-base').value;

  if(!nombre){
    mostrarErrorFormulario('rol-form-error', 'Ingresa el nombre del rol.');
    return;
  }
  if(!RE_NOMBRE_ROL.test(nombre)){
    mostrarErrorFormulario('rol-form-error', 'El nombre del rol debe tener al menos 3 caracteres y solo puede contener letras, números, espacios, puntos y guiones.');
    return;
  }

  const keyEnEdicion = rolEditando ? rolEditando.id.replace('role-', '') : null;
  const nombreDuplicado = Array.from(document.querySelectorAll('.list-item')).some(function(item){
    if(keyEnEdicion && item.getAttribute('data-role') === keyEnEdicion) return false;
    const texto = item.querySelector('.n');
    return texto && texto.textContent.trim().toLowerCase() === nombre.toLowerCase();
  });
  if(nombreDuplicado){
    mostrarErrorFormulario('rol-form-error', 'Ya existe un rol con ese nombre.');
    return;
  }

  ocultarErrorFormulario('rol-form-error');

  if(rolEditando){
    // --- Editar rol existente: solo actualiza nombre y descripción ---
    rolEditando.querySelector('.role-header h3').textContent = nombre;
    rolEditando.querySelector('.role-header p').textContent = desc || 'Sin descripción registrada.';
    const key = rolEditando.id.replace('role-', '');
    const itemLista = document.querySelector('.list-item[data-role="' + key + '"] .n');
    if(itemLista) itemLista.textContent = nombre;
  } else {
    // --- Crear rol nuevo ---
    const key = 'custom' + Date.now();

    const nuevoItem = document.createElement('div');
    nuevoItem.className = 'list-item';
    nuevoItem.setAttribute('data-role', key);
    nuevoItem.setAttribute('onclick', "mostrarRol('" + key + "', this)");
    nuevoItem.innerHTML = '<div><div class="n">' + nombre + '</div><div class="c">' + (desc || 'Rol personalizado') + '</div></div><span class="count-pill">0</span>';
    document.getElementById('lista-roles').appendChild(nuevoItem);

    let filasMatriz;
    if(base && base !== 'Ninguno — permisos en blanco' && ROL_BASE_A_ID[base]){
      const vistaBase = document.getElementById(ROL_BASE_A_ID[base]);
      filasMatriz = vistaBase.querySelector('table.matrix tbody').innerHTML;
    } else {
      filasMatriz = construirFilasMatriz();
    }

    const nuevaVista = document.createElement('div');
    nuevaVista.className = 'role-view';
    nuevaVista.id = 'role-' + key;
    nuevaVista.innerHTML =
      '<div class="role-header">' +
        '<div><h3>' + nombre + '</h3><p>' + (desc || 'Sin descripción registrada.') + '</p></div>' +
        '<div class="role-actions">' +
          '<button class="btn ghost sm" onclick="editarRol(this)">Editar rol</button>' +
          '<button class="btn btn-verde sm" onclick="guardarPermisos(this)">Guardar cambios</button>' +
          '<button class="btn danger sm" onclick="eliminarRol(this)">Eliminar rol</button>' +
        '</div>' +
      '</div>' +
      '<div class="matrix-wrap">' +
        '<table class="matrix">' +
          '<thead><tr><th>Módulo</th><th>Ver</th><th>Crear</th><th>Editar</th><th>Eliminar</th><th>Validar</th><th>Exportar</th></tr></thead>' +
          '<tbody>' + filasMatriz + '</tbody>' +
        '</table>' +
      '</div>' +
      '<p class="field-hint" style="margin-top:12px">Matriz de permisos del rol seleccionado (haz clic en las casillas para editar).</p>';

    document.getElementById('panel-roles').appendChild(nuevaVista);
    mostrarRol(key, nuevoItem);
  }

  actualizarContadorRoles();
  cerrarModal('modal-rol');
}

function eliminarRol(btn){
  const vista = btn.closest('.role-view');
  const key = vista.id.replace('role-', '');
  const nombre = vista.querySelector('.role-header h3').textContent.trim();

  pedirConfirmacion(
    '¿Eliminar el rol "' + nombre + '"? Los usuarios que lo tengan asignado quedarán sin rol. Esta acción no se puede deshacer.',
    function(){
      const item = document.querySelector('.list-item[data-role="' + key + '"]');
      const eraActiva = vista.classList.contains('active');
      vista.remove();
      if(item) item.remove();
      actualizarContadorRoles();

      if(eraActiva){
        const primero = document.querySelector('#lista-roles .list-item');
        if(primero){
          primero.click();
        } else {
          document.getElementById('panel-roles').innerHTML = '<p class="empty">No hay roles registrados. Crea uno nuevo con el botón "+ Nuevo rol".</p>';
        }
      }
    }
  );
}

function actualizarContadorRoles(){
  const total = document.querySelectorAll('#lista-roles .list-item').length;
  const stat = document.getElementById('stat-total-roles');
  if(stat) stat.textContent = total;
}

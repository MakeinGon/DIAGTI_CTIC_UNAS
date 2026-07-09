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
// Confirmación genérica (usada para eliminar ítems, etc.)
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
// Selector de catálogo: muestra la vista estática correspondiente
// ============================================================
function mostrarCatalogo(catKey, el){
  document.querySelectorAll('.cat-view').forEach(function(v){ v.classList.remove('active'); });
  const vista = document.getElementById('cat-' + catKey);
  if(vista) vista.classList.add('active');
  document.querySelectorAll('#lista-catalogos .list-item').forEach(function(i){ i.classList.remove('active'); });
  if(el) el.classList.add('active');
}

// ============================================================
// Mapeo entre el nombre visible del catálogo (select del modal)
// y el id de su contenedor .cat-view
// ============================================================
const CATALOGO_NOMBRE_A_ID = {
  'Áreas usuarias': 'cat-areas',
  'Tipos de aplicativo': 'cat-tipos',
  'Estados de levantamiento': 'cat-estados',
  'Criticidades': 'cat-criticidad',
  'Tecnologías': 'cat-tecnologias',
  'Motores de base de datos': 'cat-motores',
  'Tipos de evidencia': 'cat-evidencias',
  'Formas de adquisición': 'cat-adquisicion',
  'Niveles de riesgo': 'cat-riesgo'
};
const CATALOGO_ID_A_NOMBRE = Object.fromEntries(
  Object.entries(CATALOGO_NOMBRE_A_ID).map(function(par){ return [par[1], par[0]]; })
);

// ============================================================
// Alta / edición / eliminación de ítems de catálogo
// ============================================================
let itemEditando = null; // <tr> que se está editando, o null si es nuevo

function limpiarFormularioItem(){
  document.getElementById('input-item-codigo').value = '';
  document.getElementById('input-item-nombre').value = '';
  document.getElementById('textarea-item-desc').value = '';
  document.getElementById('select-item-estado').selectedIndex = 0;
  ocultarErrorFormulario('item-form-error');
}

function abrirNuevoItem(catViewId){
  itemEditando = null;
  document.getElementById('item-modal-titulo').textContent = 'Nuevo ítem de catálogo';
  document.getElementById('item-btn-guardar').textContent = 'Guardar ítem';
  limpiarFormularioItem();
  const nombreCatalogo = CATALOGO_ID_A_NOMBRE[catViewId];
  if(nombreCatalogo) document.getElementById('select-item-catalogo').value = nombreCatalogo;
  document.getElementById('select-item-catalogo').disabled = false;
  abrirModal('modal-item');
}

function editarItem(fila){
  itemEditando = fila;
  document.getElementById('item-modal-titulo').textContent = 'Editar ítem de catálogo';
  document.getElementById('item-btn-guardar').textContent = 'Guardar cambios';
  ocultarErrorFormulario('item-form-error');

  const catViewId = fila.closest('.cat-view').id;
  const nombreCatalogo = CATALOGO_ID_A_NOMBRE[catViewId];
  if(nombreCatalogo) document.getElementById('select-item-catalogo').value = nombreCatalogo;
  // El catálogo de un ítem existente no se reasigna desde aquí
  document.getElementById('select-item-catalogo').disabled = true;

  document.getElementById('input-item-codigo').value = fila.children[0].textContent.trim();
  document.getElementById('input-item-nombre').value = fila.children[1].textContent.trim();
  document.getElementById('textarea-item-desc').value = fila.children[2].textContent.trim();
  const activo = fila.children[3].textContent.trim() === 'Activo';
  document.getElementById('select-item-estado').value = activo ? 'Activo' : 'Inactivo';

  abrirModal('modal-item');
}

// ============================================================
// Expresión regular de validación para el código del ítem
// ============================================================
const RE_CODIGO_ITEM = /^[A-Za-z]{2,4}-\d{2,4}$/; // ej. AR-07, TE-08, BD-05

function guardarItem(){
  const catalogoNombre = document.getElementById('select-item-catalogo').value;
  let codigo = document.getElementById('input-item-codigo').value.trim();
  const nombre = document.getElementById('input-item-nombre').value.trim().replace(/\s+/g, ' ');
  const desc = document.getElementById('textarea-item-desc').value.trim();
  const estado = document.getElementById('select-item-estado').value;

  if(!codigo || !nombre){
    mostrarErrorFormulario('item-form-error', 'Completa el código y el nombre del ítem.');
    return;
  }
  if(!RE_CODIGO_ITEM.test(codigo)){
    mostrarErrorFormulario('item-form-error', 'El código debe tener el formato AA-00 (2 a 4 letras, un guion y 2 a 4 números), por ejemplo AR-07.');
    return;
  }
  if(nombre.length < 2){
    mostrarErrorFormulario('item-form-error', 'El nombre del ítem debe tener al menos 2 caracteres.');
    return;
  }
  codigo = codigo.toUpperCase();

  const catViewId = CATALOGO_NOMBRE_A_ID[catalogoNombre];
  const tbody = document.getElementById(catViewId).querySelector('table tbody');

  const codigoDuplicado = Array.from(tbody.querySelectorAll('tr')).some(function(fila){
    if(itemEditando && fila === itemEditando) return false;
    return fila.children[0] && fila.children[0].textContent.trim().toUpperCase() === codigo;
  });
  if(codigoDuplicado){
    mostrarErrorFormulario('item-form-error', 'Ya existe un ítem con ese código en este catálogo.');
    return;
  }

  ocultarErrorFormulario('item-form-error');

  const badgeClase = estado === 'Activo' ? 'low' : 'gray';
  const filaHTML =
    '<td>' + codigo + '</td>' +
    '<td><b>' + nombre + '</b></td>' +
    '<td>' + (desc || '—') + '</td>' +
    '<td><span class="badge ' + badgeClase + '">' + estado + '</span></td>' +
    '<td><div class="row-actions"><button class="btn ghost sm" onclick="editarItem(this.closest(\'tr\'))">Editar</button><button class="btn danger sm" onclick="eliminarItem(this.closest(\'tr\'))">Eliminar</button></div></td>';

  if(itemEditando){
    itemEditando.innerHTML = filaHTML;
  } else {
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = filaHTML;
    tbody.appendChild(nuevaFila);
  }

  cerrarModal('modal-item');
  actualizarContadorCatalogo(catViewId);
}

function eliminarItem(fila){
  const nombre = fila.children[1].textContent.trim();
  const catViewId = fila.closest('.cat-view').id;

  pedirConfirmacion(
    '¿Eliminar el ítem "' + nombre + '" de este catálogo? Esta acción no se puede deshacer.',
    function(){
      fila.remove();
      actualizarContadorCatalogo(catViewId);
    }
  );
}

function actualizarContadorCatalogo(catViewId){
  const total = document.querySelectorAll('#' + catViewId + ' table tbody tr').length;
  const dataCat = catViewId.replace('cat-', '');
  const pill = document.querySelector('.list-item[data-cat="' + dataCat + '"] .count-pill');
  if(pill) pill.textContent = total;
}

// ============================================================
// Saneo en vivo: el código de ítem se normaliza a mayúsculas
// y no admite espacios mientras se escribe
// ============================================================
const inputItemCodigo = document.getElementById('input-item-codigo');
if(inputItemCodigo){
  inputItemCodigo.setAttribute('maxlength', '9');
  inputItemCodigo.addEventListener('input', function(){
    this.value = this.value.toUpperCase().replace(/\s+/g, '');
  });
}


// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    // Eliminar datos de sesión (si existen)
    localStorage.clear();
    sessionStorage.clear();

    // Redirigir al login
    window.location.href = "../../../login/html/login.html";
}
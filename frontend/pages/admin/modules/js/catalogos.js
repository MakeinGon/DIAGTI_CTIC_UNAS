// Selector de catálogo: muestra la vista estática correspondiente
function mostrarCatalogo(catKey, el){
  document.querySelectorAll('.cat-view').forEach(function(v){ v.classList.remove('active'); });
  document.getElementById('cat-' + catKey).classList.add('active');
  document.querySelectorAll('#lista-catalogos .list-item').forEach(function(i){ i.classList.remove('active'); });
  el.classList.add('active');
}

// Modal: abrir / cerrar
function abrirModal(id){ document.getElementById(id).classList.add('open'); }
function cerrarModal(id){ document.getElementById(id).classList.remove('open'); }

// Cerrar sesión: aquí se debe invalidar la sesión/token real y redirigir al login
function confirmarCerrarSesion(){
  cerrarModal('modal-logout');
  // TODO: reemplazar esta línea por la lógica real de logout:
  // invalidar el token/sesión en el backend, limpiar datos locales y
  // redirigir a la pantalla de login, por ejemplo:
  // window.location.href = '/login';
  window.location.reload();
}
document.querySelectorAll('.modal-overlay').forEach(function(ov){
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.classList.remove('open'); });
});

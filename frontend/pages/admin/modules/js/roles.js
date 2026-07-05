// Selector de rol: muestra la vista estática correspondiente
function mostrarRol(rolKey, el){
  document.querySelectorAll('.role-view').forEach(function(v){ v.classList.remove('active'); });
  document.getElementById('role-' + rolKey).classList.add('active');
  document.querySelectorAll('#lista-roles .list-item').forEach(function(i){ i.classList.remove('active'); });
  el.classList.add('active');
}

// Modal: abrir / cerrar
function abrirModal(id){ document.getElementById(id).classList.add('open'); }
function cerrarModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(ov){
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.classList.remove('open'); });
});

// Matriz de permisos: marcar / desmarcar cada casilla al hacer clic
document.querySelectorAll('.perm-box').forEach(function(box){
  box.addEventListener('click', function(){
    box.classList.toggle('on');
  });
});

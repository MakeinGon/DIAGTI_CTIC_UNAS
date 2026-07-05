// Modal: abrir / cerrar
function abrirModal(id){ document.getElementById(id).classList.add('open'); }
function cerrarModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(ov){
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.classList.remove('open'); });
});

// Toggle visual de estado (demo)
document.querySelectorAll('.toggle').forEach(function(t){
  t.addEventListener('click', function(){ t.classList.toggle('on'); });
});

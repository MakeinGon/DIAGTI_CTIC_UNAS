// Abrir modal
function abrirModalValidacion() {
    document.getElementById('modalValidacion').classList.add('open');
}

// Cerrar modal
function cerrarModal(id) {
    document.getElementById(id).classList.remove('open');
}

// Confirmar envío
function confirmarEnvio() {
    cerrarModal('modalValidacion');
    setTimeout(() => {
        alert('¡Operación Exitosa!\n\nEl sistema cambió su estado a: PENDIENTE DE VALIDACIÓN.\n\nSe envió la notificación al evaluador del CTIC.');
    }, 300);
}

// Cerrar con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        const modal = document.getElementById('modalValidacion');
        if (modal) modal.classList.remove('open');
    }
});
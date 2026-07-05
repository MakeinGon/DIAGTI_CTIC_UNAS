// Funciones básicas para modales
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
}

// Cerrar modal con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('open');
        });
    }
});

// Marcar automáticamente la página activa en el menú
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
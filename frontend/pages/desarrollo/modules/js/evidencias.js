// Eliminar fila de evidencia
function eliminarFilaEvidencia(button) {
    if (confirm("¿Eliminar este archivo?")) {
        const row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }
}

// Simulación de subida (puedes mejorarlo después)
document.getElementById('fileInput').addEventListener('change', function() {
    if (this.files.length > 0) {
        alert('✅ ' + this.files.length + ' archivo(s) seleccionado(s) correctamente');
        // Aquí podrías agregar lógica para añadir filas a la tabla
    }
});

// Cerrar modales con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('open');
        });
    }
});
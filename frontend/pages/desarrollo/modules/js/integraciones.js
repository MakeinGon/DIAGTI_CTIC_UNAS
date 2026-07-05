// Agregar nueva fila
function agregarFilaIntegracion() {
    const table = document.getElementById("tablaIntegraciones").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td><input type="text" class="input-table" placeholder="Nombre del sistema o API..."></td>
        <td>
            <select class="select-table">
                <option selected>REST API (HTTP)</option>
                <option>SOAP / Web Service</option>
                <option>Conexión directa a BD</option>
                <option>FTP / Archivo Plano</option>
            </select>
        </td>
        <td>
            <select class="select-table">
                <option selected>GET (JSON)</option>
                <option>POST (JSON)</option>
                <option>PUT / PATCH (JSON)</option>
                <option>XML Payload</option>
            </select>
        </td>
        <td>
            <select class="select-table">
                <option selected>Tiempo Real (Síncrono)</option>
                <option>Asíncrono (Batch Diario)</option>
                <option>A Demanda</option>
            </select>
        </td>
        <td class="text-center">
            <button class="btn-delete" onclick="eliminarFilaIntegracion(this)">🗑</button>
        </td>
    `;
}

// Eliminar fila
function eliminarFilaIntegracion(button) {
    if (confirm("¿Eliminar esta fila de integración?")) {
        const row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }
}

// Cerrar modales con Escape (por si usas modales en otros módulos)
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('open');
        });
    }
});
// ============================================================
// DIAGTI · CTIC UNAS — Registrar Sistema
// ============================================================

// ============================================================
// CERRAR SESIÓN
// ============================================================
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../../../login/html/login.html";
    }
}

// ============================================================
// CAMBIAR PESTAÑA
// ============================================================
function cambiarTab(tabId) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(function (content) {
        content.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });

    // Mostrar el contenido seleccionado
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');

    // Activar el botón correspondiente
    const btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

// ============================================================
// AGREGAR INTEGRACIÓN
// ============================================================
function agregarIntegracion() {
    const destino = document.getElementById('integracion-destino').value.trim();
    const protocolo = document.getElementById('integracion-protocolo').value;
    const metodo = document.getElementById('integracion-metodo').value.trim();
    const responsable = document.getElementById('integracion-responsable').value.trim();

    if (!destino || !protocolo || !metodo || !responsable) {
        alert('Completa todos los campos de la integración.');
        return;
    }

    const tabla = document.getElementById('tabla-integraciones').querySelector('tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${destino}</td>
        <td>${protocolo}</td>
        <td>${metodo}</td>
        <td>${responsable}</td>
        <td><button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">Eliminar</button></td>
    `;
    tabla.appendChild(row);

    // Limpiar campos
    document.getElementById('integracion-destino').value = '';
    document.getElementById('integracion-metodo').value = '';
    document.getElementById('integracion-responsable').value = '';
}

// ============================================================
// SUBIR EVIDENCIA
// ============================================================
function subirEvidencia(tipo) {
    const input = document.getElementById('evidencia-' + tipo);
    if (!input) return;

    const file = input.files[0];
    if (!file) {
        alert('Selecciona un archivo para ' + tipo);
        return;
    }

    const lista = document.getElementById('lista-evidencias');
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
    item.innerHTML = `
        <span><strong>${tipo}:</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
        <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Eliminar</button>
    `;
    lista.appendChild(item);

    // Resetear input
    input.value = '';
}

// ============================================================
// AGREGAR URL EVIDENCIA
// ============================================================
function agregarUrlEvidencia() {
    const url = document.getElementById('evidencia-url').value.trim();
    const desc = document.getElementById('evidencia-url-desc').value.trim();

    if (!url) {
        alert('Ingresa una URL válida.');
        return;
    }

    const lista = document.getElementById('lista-urls');
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f8fafa;border-radius:6px;margin-bottom:6px;';
    item.innerHTML = `
        <span><strong>${desc || 'URL'}:</strong> <a href="${url}" target="_blank" style="color:var(--color-azul-ctic);">${url}</a></span>
        <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Eliminar</button>
    `;
    lista.appendChild(item);

    document.getElementById('evidencia-url').value = '';
    document.getElementById('evidencia-url-desc').value = '';
}

// ============================================================
// GUARDAR BORRADOR
// ============================================================
function guardarBorrador() {
    alert('✅ Sistema guardado como BORRADOR correctamente.');
    window.location.href = 'mis-sistemas.html';
}

// ============================================================
// ENVIAR VALIDACIÓN
// ============================================================
function enviarValidacion() {
    if (confirm('¿Estás seguro de enviar este sistema a validación?')) {
        alert('✅ Sistema enviado a validación correctamente.');
        window.location.href = 'mis-sistemas.html';
    }
}

// ============================================================
// CANCELAR
// ============================================================
function cancelarRegistro() {
    if (confirm('¿Estás seguro de cancelar el registro? Los datos no guardados se perderán.')) {
        window.location.href = 'mis-sistemas.html';
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'registrar-sistema.html') {
            item.classList.add('active');
        }
    });

    // Activar primera pestaña por defecto
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        const tabId = firstTab.getAttribute('data-tab');
        cambiarTab(tabId);
    }
});

// ============================================================
// BOTONES NAVEGACIÓN LATERAL (SIGUIENTE / ATRÁS)
// ============================================================
function siguientePantalla() {
    const pantallaActual = document.querySelector('.tab-content.active');
    if (pantallaActual) {
        const pantallaSiguiente = pantallaActual.nextElementSibling;
        
        // Validamos que exista y que sea un bloque de contenido con clase tab-content
        if (pantallaSiguiente && pantallaSiguiente.classList.contains('tab-content')) {
            // Reutilizamos tu función original pasándole el ID de la siguiente pantalla
            cambiarTab(pantallaSiguiente.id);
        }
    }
}

function anteriorPantalla() {
    const pantallaActual = document.querySelector('.tab-content.active');
    if (pantallaActual) {
        const pantallaAnterior = pantallaActual.previousElementSibling;
        
        // Validamos que exista y que sea un bloque de contenido con clase tab-content
        if (pantallaAnterior && pantallaAnterior.classList.contains('tab-content')) {
            // Reutilizamos tu función original pasándole el ID de la pantalla anterior
            cambiarTab(pantallaAnterior.id);
        }
    }
}
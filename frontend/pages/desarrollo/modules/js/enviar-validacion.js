// ============================================================
// DIAGTI · CTIC UNAS — Enviar Validación
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
// DATOS MOCK
// ============================================================
const sistemasParaValidar = [
    { id: 'SIS001', codigo: 'SIS001', nombre: 'Sistema Académico', estado: 'Borrador', completitud: 100, area: 'Dirección Académica', riesgo: 'Medio' },
    { id: 'SIS002', codigo: 'SIS002', nombre: 'Sistema Biblioteca', estado: 'Borrador', completitud: 82, area: 'Biblioteca', riesgo: 'Alto' },
    { id: 'SIS003', codigo: 'SIS003', nombre: 'Sistema Finanzas', estado: 'Borrador', completitud: 95, area: 'Economía y Finanzas', riesgo: 'Crítico' },
    { id: 'SIS004', codigo: 'SIS004', nombre: 'Sistema RRHH', estado: 'Borrador', completitud: 60, area: 'Recursos Humanos', riesgo: 'Bajo' }
];

let sistemaSeleccionado = null;

// ============================================================
// RENDERIZAR TABLA
// ============================================================
function renderizarTabla() {
    const container = document.getElementById('tabla-validacion');
    if (!container) return;

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Sistema</th>
                    <th>Estado</th>
                    <th>Completitud</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    sistemasParaValidar.forEach(s => {
        const completitudClase = s.completitud === 100 ? 'status-success' :
            s.completitud >= 80 ? 'status-warning' : 'status-danger';
        const puedeEnviar = s.completitud === 100;
        const accionTexto = puedeEnviar ? '📤 Enviar' : '📝 Completar';
        const accionClase = puedeEnviar ? 'btn-verde' : 'btn-secondary';

        html += `
            <tr onclick="seleccionarSistema('${s.id}')" style="cursor:pointer;">
                <td><strong>${s.codigo}</strong></td>
                <td>${s.nombre}</td>
                <td><span class="badge status-secondary">${s.estado}</span></td>
                <td><span class="badge ${completitudClase}">${s.completitud}%</span></td>
                <td>
                    <button class="btn ${accionClase} btn-sm" onclick="event.stopPropagation(); ejecutarAccion('${s.id}')" ${!puedeEnviar ? 'disabled' : ''}>
                        ${accionTexto}
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// ============================================================
// SELECCIONAR SISTEMA (muestra resumen)
// ============================================================
function seleccionarSistema(id) {
    const sistema = sistemasParaValidar.find(s => s.id === id);
    if (!sistema) return;

    sistemaSeleccionado = sistema;

    const resumen = document.getElementById('resumen-seleccion');
    resumen.classList.add('visible');

    document.getElementById('resumen-codigo').textContent = sistema.codigo;
    document.getElementById('resumen-nombre').textContent = sistema.nombre;
    document.getElementById('resumen-area').textContent = sistema.area;
    document.getElementById('resumen-completitud').textContent = sistema.completitud + '%';
    document.getElementById('resumen-riesgo').textContent = sistema.riesgo;

    // Habilitar botón de envío si está 100%
    const btnEnviar = document.getElementById('btn-enviar-validacion');
    btnEnviar.disabled = sistema.completitud !== 100;
}

// ============================================================
// EJECUTAR ACCIÓN (Enviar o Completar)
// ============================================================
function ejecutarAccion(id) {
    const sistema = sistemasParaValidar.find(s => s.id === id);
    if (!sistema) return;

    if (sistema.completitud === 100) {
        // Enviar a validación
        if (confirm(`¿Enviar "${sistema.nombre}" a validación?`)) {
            alert(`✅ Sistema "${sistema.nombre}" enviado a validación correctamente.`);
            // Cambiar estado
            sistema.estado = 'Enviado';
            renderizarTabla();
            // Limpiar selección
            sistemaSeleccionado = null;
            document.getElementById('resumen-seleccion').classList.remove('visible');
        }
    } else {
        // Redirigir a editar para completar
        alert(`⚠️ El sistema "${sistema.nombre}" está al ${sistema.completitud}%. Debes completarlo primero.`);
        window.location.href = 'editar-sistema.html?id=' + sistema.id;
    }
}

// ============================================================
// ENVIAR VALIDACIÓN (desde el resumen)
// ============================================================
function enviarValidacion() {
    if (!sistemaSeleccionado) {
        alert('Selecciona un sistema primero.');
        return;
    }

    if (sistemaSeleccionado.completitud !== 100) {
        alert(`⚠️ El sistema está al ${sistemaSeleccionado.completitud}%. Debe estar al 100% para enviar.`);
        return;
    }

    if (confirm(`¿Enviar "${sistemaSeleccionado.nombre}" a validación?`)) {
        alert(`✅ Sistema "${sistemaSeleccionado.nombre}" enviado a validación correctamente.`);
        sistemaSeleccionado.estado = 'Enviado';
        renderizarTabla();
        document.getElementById('resumen-seleccion').classList.remove('visible');
        sistemaSeleccionado = null;
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    renderizarTabla();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'enviar-validacion.html') {
            item.classList.add('active');
        }
    });
});
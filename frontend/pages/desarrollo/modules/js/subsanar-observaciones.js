// ============================================================
// DIAGTI · CTIC UNAS — Subsanar Observaciones
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
const sistemasObservados = [
    {
        id: 'SIS002',
        codigo: 'SIS002',
        nombre: 'Sistema Biblioteca',
        estado: 'Observado',
        fecha: '05/07/2026',
        observaciones: [
            'Debe indicar versión PostgreSQL.',
            'Debe adjuntar contrato.',
            'Debe indicar repositorio Git.'
        ],
        datos: {
            motor: 'MySQL',
            version_bd: '5.7',
            contrato: false,
            repositorio: ''
        }
    }
];

let sistemaActual = null;

// ============================================================
// RENDERIZAR LISTA DE SISTEMAS OBSERVADOS
// ============================================================
function renderizarLista() {
    const container = document.getElementById('lista-observados');
    if (!container) return;

    if (sistemasObservados.length === 0) {
        container.innerHTML = '<div class="empty" style="text-align:center;padding:40px;color:var(--muted);">✅ No hay sistemas con observaciones pendientes</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Sistema</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
    `;

    sistemasObservados.forEach(s => {
        html += `
            <tr onclick="seleccionarSistema('${s.id}')">
                <td><strong>${s.nombre}</strong></td>
                <td><span class="badge status-danger">${s.estado}</span></td>
                <td>${s.fecha}</td>
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
// SELECCIONAR SISTEMA
// ============================================================
function seleccionarSistema(id) {
    const sistema = sistemasObservados.find(s => s.id === id);
    if (!sistema) return;

    sistemaActual = sistema;

    // Mostrar detalle
    const detalle = document.getElementById('detalle-subsanacion');
    detalle.classList.add('visible');

    // Mostrar observaciones
    const obsContainer = document.getElementById('observaciones-lista');
    obsContainer.innerHTML = sistema.observaciones.map(o => `<li>${o}</li>`).join('');

    // Cargar datos en las pestañas correspondientes
    // Base de Datos
    document.getElementById('subsanar-motor').value = sistema.datos.motor || '';
    document.getElementById('subsanar-version-bd').value = sistema.datos.version_bd || '';

    // Evidencias - Contrato
    const contratoCheck = document.getElementById('subsanar-contrato');
    contratoCheck.checked = sistema.datos.contrato || false;

    // Repositorio Git
    document.getElementById('subsanar-repositorio').value = sistema.datos.repositorio || '';

    // Activar primera pestaña
    cambiarTabSubsanar('tab-subsanar-bd');
}

// ============================================================
// CAMBIAR PESTAÑA (subsanación)
// ============================================================
function cambiarTabSubsanar(tabId) {
    document.querySelectorAll('#detalle-subsanacion .tab-content').forEach(function (c) {
        c.classList.remove('active');
    });
    document.querySelectorAll('#detalle-subsanacion .tab-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
    const btn = document.querySelector('#detalle-subsanacion .tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

// ============================================================
// GUARDAR SUBSANACIÓN
// ============================================================
function guardarSubsanacion() {
    if (!sistemaActual) {
        alert('Selecciona un sistema primero.');
        return;
    }

    // Recoger datos
    const motor = document.getElementById('subsanar-motor').value;
    const versionBD = document.getElementById('subsanar-version-bd').value;
    const contrato = document.getElementById('subsanar-contrato').checked;
    const repositorio = document.getElementById('subsanar-repositorio').value.trim();

    // Validaciones básicas
    if (!motor) {
        alert('⚠️ Debes indicar el motor de base de datos (versión PostgreSQL).');
        return;
    }
    if (!contrato) {
        alert('⚠️ Debes adjuntar el contrato (marca la casilla).');
        return;
    }
    if (!repositorio) {
        alert('⚠️ Debes indicar el repositorio Git.');
        return;
    }

    // Guardar
    sistemaActual.datos.motor = motor;
    sistemaActual.datos.version_bd = versionBD;
    sistemaActual.datos.contrato = contrato;
    sistemaActual.datos.repositorio = repositorio;

    // Cambiar estado
    sistemaActual.estado = 'Subsanado';

    alert('✅ Observaciones subsanadas correctamente. El sistema está listo para reenviar.');

    // Volver a la lista
    document.getElementById('detalle-subsanacion').classList.remove('visible');
    sistemaActual = null;
    renderizarLista();
}

// ============================================================
// REENVIAR VALIDACIÓN
// ============================================================
function reenviarValidacion() {
    if (!sistemaActual) {
        alert('Selecciona un sistema primero.');
        return;
    }

    if (sistemaActual.estado !== 'Subsanado') {
        alert('⚠️ Primero debes guardar las correcciones.');
        return;
    }

    if (confirm(`¿Reenviar "${sistemaActual.nombre}" a validación?`)) {
        alert(`✅ Sistema "${sistemaActual.nombre}" reenviado a validación.`);
        // Eliminar de la lista
        const index = sistemasObservados.findIndex(s => s.id === sistemaActual.id);
        if (index !== -1) sistemasObservados.splice(index, 1);
        document.getElementById('detalle-subsanacion').classList.remove('visible');
        sistemaActual = null;
        renderizarLista();
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    renderizarLista();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'subsanar-observaciones.html') {
            item.classList.add('active');
        }
    });
});
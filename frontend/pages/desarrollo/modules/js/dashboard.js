// ============================================================
// DIAGTI · CTIC UNAS — Dashboard Desarrollo
// ============================================================

const SISTEMAS_KEY = 'diagti_sistemas';

function getSistemas() {
    const data = localStorage.getItem(SISTEMAS_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

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
// CONTADORES POR ESTADO
// ============================================================
function contarPorEstado() {
    const sistemas = getSistemas();
    const total = sistemas.length;
    const borrador = sistemas.filter(s => s.estado === 'Borrador').length;
    const enviado = sistemas.filter(s => s.estado === 'Enviado').length;
    const observado = sistemas.filter(s => s.estado === 'Observado').length;
    const validado = sistemas.filter(s => s.estado === 'Validado').length;
    return { total, borrador, enviado, observado, validado };
}

// ============================================================
// RENDERIZAR ACTIVIDAD RECIENTE
// ============================================================
function renderizarActividadReciente() {
    const container = document.getElementById('actividad-reciente');
    if (!container) return;

    const sistemas = getSistemas();
    // Simular actividades basadas en los sistemas
    const actividades = sistemas.map(s => {
        let accion = 'Registrar sistema';
        if (s.estado === 'Validado') accion = 'Validar sistema';
        else if (s.estado === 'Observado') accion = 'Observar sistema';
        else if (s.estado === 'Enviado') accion = 'Enviar a validación';
        else if (s.estado === 'Subsanado') accion = 'Corregir observaciones';
        return {
            sistema: s.nombre,
            accion: accion,
            fecha: s.fecha || new Date().toLocaleDateString('es-PE')
        };
    });

    // Ordenar por fecha (más reciente primero)
    actividades.sort((a, b) => {
        const da = a.fecha.split('/').reverse().join('');
        const db = b.fecha.split('/').reverse().join('');
        return db - da;
    });

    const recientes = actividades.slice(0, 5);

    if (recientes.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">No hay actividad reciente</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Sistema</th>
                    <th>Acción</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
    `;

    recientes.forEach(a => {
        html += `
            <tr>
                <td><strong>${a.sistema}</strong></td>
                <td>${a.accion}</td>
                <td>${a.fecha}</td>
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
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Actualizar contadores
    const stats = contarPorEstado();
    document.getElementById('total-sistemas').textContent = stats.total;
    document.getElementById('total-borrador').textContent = stats.borrador;
    document.getElementById('total-enviado').textContent = stats.enviado;
    document.getElementById('total-observado').textContent = stats.observado;
    document.getElementById('total-validado').textContent = stats.validado;

    // Renderizar actividad reciente
    renderizarActividadReciente();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'dashboard.html') {
            item.classList.add('active');
        }
    });
});
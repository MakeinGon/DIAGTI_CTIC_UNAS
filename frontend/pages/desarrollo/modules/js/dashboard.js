// ============================================================
// DIAGTI · CTIC UNAS — Dashboard Desarrollo
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
const sistemasMock = [
    { id: 'SIS001', nombre: 'Sistema Académico', estado: 'Validado', fecha: '08/07/2026', accion: 'Actualizado' },
    { id: 'SIS002', nombre: 'Sistema Biblioteca', estado: 'Observado', fecha: '05/07/2026', accion: 'Observado' },
    { id: 'SIS003', nombre: 'Sistema Finanzas', estado: 'Enviado', fecha: '03/07/2026', accion: 'Enviado' },
    { id: 'SIS004', nombre: 'Sistema RRHH', estado: 'Borrador', fecha: '01/07/2026', accion: 'Creado' },
    { id: 'SIS005', nombre: 'Portal Web UNAS', estado: 'Validado', fecha: '28/06/2026', accion: 'Actualizado' }
];

// ============================================================
// CONTADORES POR ESTADO
// ============================================================
function contarPorEstado() {
    const total = sistemasMock.length;
    const borrador = sistemasMock.filter(s => s.estado === 'Borrador').length;
    const enviado = sistemasMock.filter(s => s.estado === 'Enviado').length;
    const observado = sistemasMock.filter(s => s.estado === 'Observado').length;
    const validado = sistemasMock.filter(s => s.estado === 'Validado').length;
    return { total, borrador, enviado, observado, validado };
}

// ============================================================
// RENDERIZAR ACTIVIDAD RECIENTE
// ============================================================
function renderizarActividadReciente() {
    const container = document.getElementById('actividad-reciente');
    if (!container) return;

    // Tomar los 5 más recientes (simulamos orden por fecha)
    const recientes = [...sistemasMock].sort((a, b) => {
        const da = a.fecha.split('/').reverse().join('');
        const db = b.fecha.split('/').reverse().join('');
        return db - da;
    });

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

    recientes.forEach(s => {
        html += `
            <tr>
                <td><strong>${s.nombre}</strong></td>
                <td><span class="badge ${s.estado === 'Validado' ? 'low' : s.estado === 'Observado' ? 'high' : s.estado === 'Enviado' ? 'info' : 'gray'}">${s.accion}</span></td>
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
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
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
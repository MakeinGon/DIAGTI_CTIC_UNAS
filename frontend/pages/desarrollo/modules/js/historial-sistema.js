// ============================================================
// DIAGTI · CTIC UNAS — Historial del Sistema
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
const historialData = {
    sistema: {
        codigo: 'SIS001',
        nombre: 'Sistema Académico',
        estado_actual: 'Validado',
        area: 'Dirección Académica',
        responsable_tecnico: 'Ing. María Gómez'
    },
    trazabilidad: [
        { fecha: '01/07/2026', usuario: 'Luis', accion: 'Creó sistema', estado: 'Borrador' },
        { fecha: '03/07/2026', usuario: 'Luis', accion: 'Actualizó arquitectura', estado: 'Borrador' },
        { fecha: '05/07/2026', usuario: 'CTIC', accion: 'Observó registro', estado: 'Observado' },
        { fecha: '06/07/2026', usuario: 'Luis', accion: 'Subsanó observaciones', estado: 'Subsanado' },
        { fecha: '07/07/2026', usuario: 'CTIC', accion: 'Validó sistema', estado: 'Validado' }
    ]
};

// ============================================================
// RENDERIZAR INFORMACIÓN DEL SISTEMA
// ============================================================
function renderizarInfoSistema() {
    const s = historialData.sistema;
    document.getElementById('hist-codigo').textContent = s.codigo;
    document.getElementById('hist-nombre').textContent = s.nombre;
    document.getElementById('hist-area').textContent = s.area;
    document.getElementById('hist-responsable').textContent = s.responsable_tecnico;

    const estadoClase = s.estado_actual === 'Validado' ? 'status-success' :
        s.estado_actual === 'Observado' ? 'status-danger' :
            s.estado_actual === 'Enviado' ? 'status-info' : 'status-secondary';
    document.getElementById('hist-estado').innerHTML = `<span class="badge ${estadoClase}">${s.estado_actual}</span>`;
}

// ============================================================
// RENDERIZAR TRAZABILIDAD
// ============================================================
function renderizarTrazabilidad() {
    const container = document.getElementById('historial-timeline');
    if (!container) return;

    let html = '';
    historialData.trazabilidad.forEach(item => {
        const estadoClase = item.estado === 'Validado' ? 'status-success' :
            item.estado === 'Observado' ? 'status-danger' :
                item.estado === 'Enviado' ? 'status-info' :
                    item.estado === 'Subsanado' ? 'status-warning' : 'status-secondary';

        html += `
            <div class="timeline-item">
                <span class="fecha">${item.fecha}</span>
                <span class="usuario">${item.usuario}</span>
                <span class="accion">${item.accion}</span>
                <span class="estado"><span class="badge ${estadoClase}">${item.estado}</span></span>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    renderizarInfoSistema();
    renderizarTrazabilidad();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'historial-sistema.html') {
            item.classList.add('active');
        }
    });
});
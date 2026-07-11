// ============================================================
// DIAGTI · CTIC UNAS — Mis Sistemas
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
    { id: 'SIS001', codigo: 'SIS001', nombre: 'Sistema Académico', tipo: 'Web', estado: 'Validado', riesgo: 'Medio', fecha: '08/07/2026', area: 'Dirección Académica', criticidad: 'Académico' },
    { id: 'SIS002', codigo: 'SIS002', nombre: 'Sistema Biblioteca', tipo: 'Web', estado: 'Observado', riesgo: 'Alto', fecha: '05/07/2026', area: 'Biblioteca', criticidad: 'Académico' },
    { id: 'SIS003', codigo: 'SIS003', nombre: 'Sistema Finanzas', tipo: 'Desktop', estado: 'Enviado', riesgo: 'Crítico', fecha: '03/07/2026', area: 'Economía y Finanzas', criticidad: 'Financiero' },
    { id: 'SIS004', codigo: 'SIS004', nombre: 'Sistema RRHH', tipo: 'API', estado: 'Borrador', riesgo: 'Bajo', fecha: '01/07/2026', area: 'Recursos Humanos', criticidad: 'RRHH' },
    { id: 'SIS005', codigo: 'SIS005', nombre: 'Portal Web UNAS', tipo: 'Web', estado: 'Validado', riesgo: 'Bajo', fecha: '28/06/2026', area: 'Comunicaciones', criticidad: 'Académico' }
];

// ============================================================
// RENDERIZAR TABLA
// ============================================================
function renderizarTabla(sistemas) {
    const container = document.getElementById('tabla-sistemas');
    if (!container) return;

    if (sistemas.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron sistemas</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Sistema</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Riesgo</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    sistemas.forEach(s => {
        const estadoClase = s.estado === 'Validado' ? 'status-success' :
            s.estado === 'Observado' ? 'status-danger' :
                s.estado === 'Enviado' ? 'status-info' : 'status-secondary';

        const riesgoClase = s.riesgo === 'Crítico' ? 'status-danger' :
            s.riesgo === 'Alto' ? 'status-warning' :
                s.riesgo === 'Medio' ? 'status-info' : 'status-success';

        html += `
            <tr>
                <td><strong>${s.codigo}</strong></td>
                <td>${s.nombre}</td>
                <td>${s.tipo}</td>
                <td><span class="badge ${estadoClase}">${s.estado}</span></td>
                <td><span class="badge ${riesgoClase}">${s.riesgo}</span></td>
                <td>${s.fecha}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-ghost btn-sm" onclick="verSistema('${s.id}')">👁 Ver</button>
                        <button class="btn btn-ghost btn-sm" onclick="editarSistema('${s.id}')">✏ Editar</button>
                        <button class="btn btn-verde btn-sm" onclick="enviarValidacion('${s.id}')">📤 Enviar</button>
                        <button class="btn btn-azul btn-sm" onclick="verHistorial('${s.id}')">🕓 Historial</button>
                    </div>
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
// FILTRAR Y BUSCAR
// ============================================================
function filtrarSistemas() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const estado = document.getElementById('filter-estado').value;
    const area = document.getElementById('filter-area').value;
    const tipo = document.getElementById('filter-tipo').value;
    const criticidad = document.getElementById('filter-criticidad').value;

    let filtrados = sistemasMock.filter(s => {
        // Búsqueda por código o nombre
        const matchSearch = s.codigo.toLowerCase().includes(search) || s.nombre.toLowerCase().includes(search);
        if (!matchSearch) return false;

        // Filtros
        if (estado && s.estado !== estado) return false;
        if (area && s.area !== area) return false;
        if (tipo && s.tipo !== tipo) return false;
        if (criticidad && s.criticidad !== criticidad) return false;

        return true;
    });

    renderizarTabla(filtrados);
}

// ============================================================
// ACCIONES
// ============================================================
function verSistema(id) {
    window.location.href = 'editar-sistema.html?id=' + id + '&mode=view';
}

function editarSistema(id) {
    window.location.href = 'editar-sistema.html?id=' + id;
}

function enviarValidacion(id) {
    window.location.href = 'enviar-validacion.html?action=send&id=' + id;
}

function verHistorial(id) {
    window.location.href = 'historial-sistema.html?id=' + id;
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Renderizar todos los sistemas
    renderizarTabla(sistemasMock);

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'mis-sistemas.html') {
            item.classList.add('active');
        }
    });

    // Event listeners para filtros
    document.getElementById('search-input').addEventListener('input', filtrarSistemas);
    document.getElementById('filter-estado').addEventListener('change', filtrarSistemas);
    document.getElementById('filter-area').addEventListener('change', filtrarSistemas);
    document.getElementById('filter-tipo').addEventListener('change', filtrarSistemas);
    document.getElementById('filter-criticidad').addEventListener('change', filtrarSistemas);
});
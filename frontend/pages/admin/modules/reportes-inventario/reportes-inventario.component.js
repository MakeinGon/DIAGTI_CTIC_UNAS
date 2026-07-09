// ============================================================
// DATOS MOCK - SISTEMAS (RF-27, RF-28, RF-29)
// ============================================================
const sistemas = [
    { id: 1, codigo: 'SYS-001', nombre: 'Sistema Académico', area: 'Registro', responsable: 'Juan Pérez', riesgo: 'Alto', estado: 'Validado', tecnologias: ['PHP', 'MySQL', 'Laravel'] },
    { id: 2, codigo: 'SYS-002', nombre: 'Sistema Financiero', area: 'Finanzas', responsable: 'María Gómez', riesgo: 'Crítico', estado: 'Pendiente', tecnologias: ['Java', 'PostgreSQL', 'Spring Boot'] },
    { id: 3, codigo: 'SYS-003', nombre: 'Portal Web', area: 'Comunicaciones', responsable: 'Carlos Ruiz', riesgo: 'Medio', estado: 'Validado', tecnologias: ['Python', 'Django', 'PostgreSQL'] },
    { id: 4, codigo: 'SYS-004', nombre: 'Sistema Legacy', area: 'Infraestructura', responsable: 'Ana Torres', riesgo: 'Bajo', estado: 'Observado', tecnologias: ['COBOL', 'DB2', 'Mainframe'] },
    { id: 5, codigo: 'SYS-005', nombre: 'Sistema de Inventario', area: 'Logística', responsable: 'Luis Martínez', riesgo: 'Alto', estado: 'Rechazado', tecnologias: ['C#', 'SQL Server', '.NET'] },
    { id: 6, codigo: 'SYS-006', nombre: 'CRM', area: 'Ventas', responsable: 'Laura García', riesgo: 'Medio', estado: 'Validado', tecnologias: ['JavaScript', 'MongoDB', 'Node.js'] },
    { id: 7, codigo: 'SYS-007', nombre: 'ERP', area: 'Administración', responsable: 'Roberto Díaz', riesgo: 'Crítico', estado: 'En revisión', tecnologias: ['Oracle', 'Java', 'PL/SQL'] },
    { id: 8, codigo: 'SYS-008', nombre: 'Sistema de Recursos Humanos', area: 'Administración', responsable: 'Patricia López', riesgo: 'Alto', estado: 'Validado', tecnologias: ['PHP', 'MySQL', 'CodeIgniter'] },
];

let sistemasFiltrados = [...sistemas];

// ============================================================
// FUNCIONES DE RENDERIZADO
// ============================================================

function badgeEstado(estado) {
    const map = {
        'Validado': 'success',
        'Pendiente': 'warning',
        'Observado': 'warning',
        'Rechazado': 'danger',
        'En revisión': 'info'
    };
    return map[estado] || 'info';
}

function badgeRiesgo(riesgo) {
    const map = {
        'Bajo': 'success',
        'Medio': 'warning',
        'Alto': 'danger',
        'Crítico': 'danger'
    };
    return map[riesgo] || 'info';
}

function renderStats() {
    const stats = {
        'Total Sistemas': sistemas.length,
        'Críticos': sistemas.filter(s => s.riesgo === 'Crítico').length,
        'Alto Riesgo': sistemas.filter(s => s.riesgo === 'Alto').length,
        'Validados': sistemas.filter(s => s.estado === 'Validado').length,
        'Pendientes': sistemas.filter(s => s.estado === 'Pendiente' || s.estado === 'Observado').length,
        'Legacy': sistemas.filter(s => s.tecnologias.some(t => ['COBOL', 'Mainframe', 'DB2'].includes(t))).length,
    };
    const container = document.getElementById('statsReportes');
    container.innerHTML = '';
    for (const [key, value] of Object.entries(stats)) {
        container.innerHTML += `
            <div class="card">
                <h2>${value}</h2>
                <span>${key}</span>
            </div>
        `;
    }
}

function renderTabla() {
    const tbody = document.getElementById('tablaSistemas');
    if (sistemasFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:3rem;color:var(--text-muted);">
                    <div style="font-size:3rem;margin-bottom:0.5rem;">🔍</div>
                    No hay sistemas que coincidan con los filtros
                </td>
            </tr>
        `;
        document.getElementById('sistemaCount').textContent = 'Total: 0';
        return;
    }

    tbody.innerHTML = sistemasFiltrados.map(s => `
        <tr>
            <td><strong>${s.codigo}</strong></td>
            <td>${s.nombre}</td>
            <td>${s.area}</td>
            <td>${s.responsable}</td>
            <td><span class="badge badge-${badgeRiesgo(s.riesgo)}">${s.riesgo}</span></td>
            <td><span class="badge badge-${badgeEstado(s.estado)}">${s.estado}</span></td>
            <td>
                <button class="btn-outline" style="padding:0.2rem 0.6rem;font-size:0.8rem;" onclick="verSistema(${s.id})">👁️</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('sistemaCount').textContent = `Total: ${sistemasFiltrados.length}`;
    renderGraficos();
}

// ============================================================
// GRÁFICOS
// ============================================================

function renderGraficos() {
    // Riesgo
    const riesgoData = {};
    sistemasFiltrados.forEach(s => {
        riesgoData[s.riesgo] = (riesgoData[s.riesgo] || 0) + 1;
    });
    renderBarras('chartRiesgo', riesgoData, { 'Bajo': 'verde', 'Medio': 'amarillo', 'Alto': 'rojo', 'Crítico': 'rojo' });

    // Área
    const areaData = {};
    sistemasFiltrados.forEach(s => {
        areaData[s.area] = (areaData[s.area] || 0) + 1;
    });
    renderBarras('chartArea', areaData, {});

    // Estado
    const estadoData = {};
    sistemasFiltrados.forEach(s => {
        estadoData[s.estado] = (estadoData[s.estado] || 0) + 1;
    });
    renderBarras('chartEstado', estadoData, { 'Validado': 'verde', 'Pendiente': 'amarillo', 'Observado': 'amarillo', 'Rechazado': 'rojo', 'En revisión': 'azul' });

    // Tecnologías
    const tecData = {};
    sistemasFiltrados.forEach(s => {
        s.tecnologias.forEach(t => {
            tecData[t] = (tecData[t] || 0) + 1;
        });
    });
    const sortedTec = Object.fromEntries(Object.entries(tecData).sort((a, b) => b[1] - a[1]).slice(0, 6));
    renderBarras('chartTecnologias', sortedTec, {});
}

function renderBarras(containerId, data, colores) {
    const container = document.getElementById(containerId);
    const maxValue = Math.max(...Object.values(data), 1);
    const colorKeys = Object.keys(colores);
    
    container.innerHTML = Object.entries(data).map(([key, value], index) => {
        const porcentaje = (value / maxValue * 100);
        const colorClass = colores[key] || ['azul', 'verde', 'rojo', 'amarillo', 'morado', 'rosa', 'cian', 'naranja'][index % 8];
        return `
            <div class="bar-item">
                <span class="bar-label">${key}</span>
                <div class="bar-track">
                    <div class="bar-fill ${colorClass}" style="width: ${porcentaje}%;">
                        ${value}
                    </div>
                </div>
            </div>
        `;
    }).join('') || '<div style="text-align:center;padding:1rem;color:var(--text-muted);">No hay datos</div>';
}

// ============================================================
// FILTROS
// ============================================================

function filtrarReportes() {
    const busqueda = document.getElementById('buscarReporte').value.toLowerCase().trim();
    const area = document.getElementById('filtroArea').value;
    const riesgo = document.getElementById('filtroRiesgo').value;

    sistemasFiltrados = sistemas.filter(s => {
        const matchBusqueda = s.nombre.toLowerCase().includes(busqueda) || 
                             s.codigo.toLowerCase().includes(busqueda) ||
                             s.responsable.toLowerCase().includes(busqueda);
        const matchArea = area === '' || s.area === area;
        const matchRiesgo = riesgo === '' || s.riesgo === riesgo;
        return matchBusqueda && matchArea && matchRiesgo;
    });

    renderTabla();
}

function limpiarFiltrosReportes() {
    document.getElementById('buscarReporte').value = '';
    document.getElementById('filtroArea').value = '';
    document.getElementById('filtroRiesgo').value = '';
    sistemasFiltrados = [...sistemas];
    renderTabla();
}

// ============================================================
// ACCIONES
// ============================================================

function verSistema(id) {
    const s = sistemas.find(s => s.id === id);
    alert(`📋 ${s.nombre}\nCódigo: ${s.codigo}\nÁrea: ${s.area}\nResponsable: ${s.responsable}\nRiesgo: ${s.riesgo}\nEstado: ${s.estado}\nTecnologías: ${s.tecnologias.join(', ')}`);
}

function exportarPDF() {
    alert('📄 Exportando PDF... (simulación)');
}

function exportarExcel() {
    alert('📊 Exportando Excel... (simulación)');
}

function reporteRiesgo() {
    const criticos = sistemas.filter(s => s.riesgo === 'Crítico' || s.riesgo === 'Alto');
    alert(`⚠️ Reporte de Riesgo\nSistemas con riesgo Alto o Crítico: ${criticos.length}\n\n${criticos.map(s => `- ${s.nombre} (${s.riesgo})`).join('\n')}`);
}

function reporteObsolescencia() {
    const obsoletos = sistemas.filter(s => s.tecnologias.some(t => ['COBOL', 'Mainframe', 'DB2', 'PL/SQL'].includes(t)));
    alert(`🕰️ Reporte de Obsolescencia\nSistemas con tecnologías obsoletas: ${obsoletos.length}\n\n${obsoletos.map(s => `- ${s.nombre}: ${s.tecnologias.filter(t => ['COBOL', 'Mainframe', 'DB2', 'PL/SQL'].includes(t)).join(', ')}`).join('\n')}`);
}

function reporteLegacy() {
    const legacy = sistemas.filter(s => s.tecnologias.some(t => ['COBOL', 'Mainframe'].includes(t)));
    alert(`🏚️ Reporte Legacy\nSistemas Legacy identificados: ${legacy.length}\n\n${legacy.map(s => `- ${s.nombre} (${s.codigo})`).join('\n')}`);
}
// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    // Eliminar datos de sesión (si existen)
    localStorage.clear();
    sessionStorage.clear();

    // Redirigir al login
   window.location.href = "../../../login/html/login.html";
}
// ============================================================
// INICIALIZAR
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Módulo de Reportes e Inventario cargado');
    console.log(`📋 ${sistemas.length} sistemas registrados`);
    renderStats();
    renderTabla();
});
// ============================================================
// DATOS MOCK - EVIDENCIAS OBLIGATORIAS (RF-14, RF-15)
// ============================================================
let evidencias = [
    { id: 1, sistema: 'Sistema Académico', tipo: 'PDF', archivo: 'manual_tecnico.pdf', estado: 'Completa', subidoPor: 'Carlos Ruiz', fecha: '2026-06-15', obligatoria: true },
    { id: 2, sistema: 'Sistema Financiero', tipo: 'URL', archivo: 'https://docs.google.com/...', estado: 'Pendiente', subidoPor: 'María Gómez', fecha: '2026-06-20', obligatoria: true },
    { id: 3, sistema: 'Portal Web', tipo: 'DOCX', archivo: 'contrato_servicio.docx', estado: 'Completa', subidoPor: 'Luis Martínez', fecha: '2026-06-25', obligatoria: false },
    { id: 4, sistema: 'Sistema Legacy', tipo: 'PDF', archivo: 'informe_obsolescencia.pdf', estado: 'Vencida', subidoPor: 'Ana Torres', fecha: '2025-12-01', obligatoria: true },
    { id: 5, sistema: 'CRM', tipo: 'Imagen', archivo: 'captura_pantalla.png', estado: 'Completa', subidoPor: 'Laura García', fecha: '2026-06-28', obligatoria: false },
    { id: 6, sistema: 'ERP', tipo: 'PDF', archivo: 'manual_usuario_erp.pdf', estado: 'Pendiente', subidoPor: 'Roberto Díaz', fecha: '2026-07-01', obligatoria: true },
    { id: 7, sistema: 'Sistema Académico', tipo: 'URL', archivo: 'https://repositorio.ctic/...', estado: 'Completa', subidoPor: 'Carlos Ruiz', fecha: '2026-07-02', obligatoria: true },
    { id: 8, sistema: 'Sistema Financiero', tipo: 'DOC', archivo: 'política_seguridad.doc', estado: 'Vencida', subidoPor: 'María Gómez', fecha: '2026-01-15', obligatoria: true },
];

let evidenciasFiltradas = [...evidencias];

// Sistema para el modal
const sistemas = ['Sistema Académico', 'Sistema Financiero', 'Portal Web', 'Sistema Legacy', 'CRM', 'ERP', 'Sistema de Inventario', 'Sistema de Recursos Humanos'];

// ============================================================
// FUNCIONES DE RENDERIZADO
// ============================================================

function badgeEstado(estado) {
    const map = {
        'Completa': 'completa',
        'Pendiente': 'pendiente',
        'Vencida': 'vencida'
    };
    return map[estado] || 'pendiente';
}

function renderStats() {
    const stats = {
        'Total': evidencias.length,
        'Completas': evidencias.filter(e => e.estado === 'Completa').length,
        'Pendientes': evidencias.filter(e => e.estado === 'Pendiente').length,
        'Vencidas': evidencias.filter(e => e.estado === 'Vencida').length,
        'Obligatorias': evidencias.filter(e => e.obligatoria).length,
    };
    const container = document.getElementById('statsEvidencias');
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
    const tbody = document.getElementById('tablaEvidencias');
    if (evidenciasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:3rem;color:var(--text-muted);">
                    <div style="font-size:3rem;margin-bottom:0.5rem;">📎</div>
                    No hay evidencias registradas que coincidan con los filtros
                </td>
            </tr>
        `;
        document.getElementById('evidenciaCount').textContent = 'Total: 0';
        return;
    }

    tbody.innerHTML = evidenciasFiltradas.map(e => `
        <tr>
            <td><strong>${e.sistema}</strong> ${e.obligatoria ? '<span class="badge-obligatoria">Obligatoria</span>' : ''}</td>
            <td><span class="badge badge-info">${e.tipo}</span></td>
            <td><a href="#" onclick="verArchivo('${e.archivo}')" style="color:var(--primary);text-decoration:none;">${e.archivo}</a></td>
            <td><span class="badge-${badgeEstado(e.estado)}">${e.estado}</span></td>
            <td>${e.subidoPor}</td>
            <td>${e.fecha}</td>
            <td>
                <button class="btn-outline" style="padding:0.2rem 0.6rem;font-size:0.8rem;" onclick="editarEvidencia(${e.id})">✏️</button>
                <button class="btn-danger" style="padding:0.2rem 0.6rem;font-size:0.8rem;" onclick="eliminarEvidencia(${e.id})">🗑️</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('evidenciaCount').textContent = `Total: ${evidenciasFiltradas.length}`;
}

// ============================================================
// FILTROS
// ============================================================

function filtrarEvidencias() {
    const busqueda = document.getElementById('buscarEvidencia').value.toLowerCase().trim();
    const tipo = document.getElementById('filtroTipo').value;
    const estado = document.getElementById('filtroEstado').value;

    evidenciasFiltradas = evidencias.filter(e => {
        const matchBusqueda = e.sistema.toLowerCase().includes(busqueda) || 
                             e.archivo.toLowerCase().includes(busqueda) ||
                             e.subidoPor.toLowerCase().includes(busqueda);
        const matchTipo = tipo === '' || e.tipo === tipo;
        const matchEstado = estado === '' || e.estado === estado;
        return matchBusqueda && matchTipo && matchEstado;
    });

    renderTabla();
}

// ============================================================
// CRUD
// ============================================================

function nuevaEvidencia() {
    // Llenar select de sistemas
    const select = document.getElementById('sistemaSelect');
    select.innerHTML = '<option value="">Seleccionar sistema...</option>';
    sistemas.forEach(s => {
        select.innerHTML += `<option value="${s}">${s}</option>`;
    });
    // Limpiar campos
    document.getElementById('tipoEvidenciaSelect').value = 'PDF';
    document.getElementById('archivoInput').value = '';
    document.getElementById('descripcionInput').value = '';
    document.getElementById('obligatoriaCheck').checked = true;
    // Mostrar modal
    document.getElementById('modalEvidencia').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalEvidencia').style.display = 'none';
}

function guardarEvidencia() {
    const sistema = document.getElementById('sistemaSelect').value;
    const tipo = document.getElementById('tipoEvidenciaSelect').value;
    const archivo = document.getElementById('archivoInput').value.trim();
    const descripcion = document.getElementById('descripcionInput').value.trim();
    const obligatoria = document.getElementById('obligatoriaCheck').checked;

    if (!sistema || !archivo) {
        alert('⚠️ Por favor, complete todos los campos obligatorios.');
        return;
    }

    const nueva = {
        id: evidencias.length + 1,
        sistema: sistema,
        tipo: tipo,
        archivo: archivo,
        estado: 'Pendiente',
        subidoPor: 'Usuario Actual',
        fecha: new Date().toISOString().split('T')[0],
        obligatoria: obligatoria,
        descripcion: descripcion
    };

    evidencias.push(nueva);
    evidenciasFiltradas = [...evidencias];
    cerrarModal();
    renderStats();
    renderTabla();
    alert('✅ Evidencia registrada correctamente');
}

function editarEvidencia(id) {
    const ev = evidencias.find(e => e.id === id);
    if (!ev) return;
    // Simular edición
    const nuevoArchivo = prompt('Editar archivo/URL:', ev.archivo);
    if (nuevoArchivo) ev.archivo = nuevoArchivo;
    const nuevoEstado = prompt('Cambiar estado (Completa/Pendiente/Vencida):', ev.estado);
    if (nuevoEstado && ['Completa', 'Pendiente', 'Vencida'].includes(nuevoEstado)) {
        ev.estado = nuevoEstado;
    }
    evidenciasFiltradas = [...evidencias];
    renderTabla();
    alert('✅ Evidencia actualizada');
}

function eliminarEvidencia(id) {
    if (!confirm('¿Eliminar esta evidencia permanentemente?')) return;
    evidencias = evidencias.filter(e => e.id !== id);
    evidenciasFiltradas = [...evidencias];
    renderStats();
    renderTabla();
    alert('🗑️ Evidencia eliminada');
}

function verArchivo(archivo) {
    alert(`📎 Abriendo: ${archivo}\n(Simulación de visualización)`);
}

function exportarEvidencias() {
    alert('📊 Exportando evidencias a Excel... (simulación)');
}
// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    // Limpiar almacenamiento
    localStorage.clear();
    sessionStorage.clear();

    // Ir al login
    window.location.href = "../../../login/html/login.html";
}
// ============================================================
// INICIALIZAR
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📎 Módulo de Evidencias Obligatorias cargado');
    console.log(`📊 ${evidencias.length} evidencias registradas`);
    renderStats();
    renderTabla();
});
// ============================================================
// DIAGTI · CTIC UNAS — Mis Sistemas
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL = 'http://localhost:8080/api/desarrollador/mis-sistemas';

// ============================================================
// OBTENER USUARIO ACTUAL
// ============================================================

function obtenerUsuarioActual() {
    return localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'desarrollador1';
}

// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../../../login/modules/html/login.html";
    }
}

// ============================================================
// FUNCIÓN PARA CONSUMIR API
// ============================================================

async function consumirAPI(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        console.log(`📡 GET ${API_URL}${endpoint}`);
        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error en API:', error);
        throw error;
    }
}

// ============================================================
// ESTADO GLOBAL
// ============================================================

let sistemasData = [];

// ============================================================
// CARGAR SISTEMAS DESDE EL BACKEND
// ============================================================

async function cargarSistemas() {
    try {
        console.log('🔄 Cargando sistemas desde el backend...');
        
        // Construir parámetros de filtro
        const search = document.getElementById('search-input')?.value || '';
        const estado = document.getElementById('filter-estado')?.value || '';
        const area = document.getElementById('filter-area')?.value || '';
        const tipo = document.getElementById('filter-tipo')?.value || '';
        const criticidad = document.getElementById('filter-criticidad')?.value || '';

        const params = new URLSearchParams();
        if (search) params.append('busqueda', search);
        if (estado) params.append('estado', estado);
        if (area) params.append('area', area);
        if (tipo) params.append('tipo', tipo);
        if (criticidad) params.append('criticidad', criticidad);

        const url = `?${params.toString()}`;
        const data = await consumirAPI(url, 'GET');
        
        console.log('✅ Sistemas recibidos:', data);
        sistemasData = data || [];
        
        renderizarTabla(sistemasData);
    } catch (error) {
        console.error('❌ Error cargando sistemas:', error.message);
        // ✅ Mostrar error en lugar de datos mock
        const container = document.getElementById('tabla-sistemas');
        if (container) {
            container.innerHTML = `
                <div style="padding:40px;text-align:center;color:#dc2626;">
                    <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
                    <p style="font-weight:500;font-size:16px;">Error al cargar los sistemas</p>
                    <p style="font-size:14px;color:#6b7280;">${error.message || 'Verifica que el backend esté corriendo en http://localhost:8080'}</p>
                    <button onclick="cargarSistemas()" class="btn btn-azul" style="margin-top:12px;padding:10px 20px;background:#1a56db;color:white;border:none;border-radius:8px;cursor:pointer;">🔄 Reintentar</button>
                </div>
            `;
        }
    }
}

// ============================================================
// RENDERIZAR TABLA
// ============================================================

function renderizarTabla(sistemas) {
    const container = document.getElementById('tabla-sistemas');
    if (!container) return;

    console.log('📊 Renderizando', sistemas.length, 'sistemas');

    if (!sistemas || sistemas.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding:40px;text-align:center;color:#6b7280;">
                <div style="font-size:48px;margin-bottom:12px;">📭</div>
                <p style="font-weight:500;font-size:16px;">No se encontraron sistemas</p>
                <p style="font-size:14px;">Ajusta los filtros o crea un nuevo sistema</p>
                <a href="registrar-sistema.html" class="btn btn-verde" style="margin-top:12px;display:inline-block;padding:10px 20px;background:#059669;color:white;border-radius:8px;text-decoration:none;">➕ Registrar Nuevo Sistema</a>
            </div>
        `;
        return;
    }

    let html = `
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
                <tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb;">
                    <th style="padding:12px;text-align:left;">Código</th>
                    <th style="padding:12px;text-align:left;">Sistema</th>
                    <th style="padding:12px;text-align:left;">Tipo</th>
                    <th style="padding:12px;text-align:left;">Estado</th>
                    <th style="padding:12px;text-align:left;">Riesgo</th>
                    <th style="padding:12px;text-align:left;">Fecha</th>
                    <th style="padding:12px;text-align:left;">Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    sistemas.forEach(s => {
        const estadoClase = obtenerClaseEstado(s.estado);
        const riesgoClase = obtenerClaseRiesgo(s.nivelRiesgo);
        const fechaFormateada = s.fechaActualizacion ? new Date(s.fechaActualizacion).toLocaleDateString('es-ES') : '-';

        html += `
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px;"><strong>${s.codigo || '-'}</strong></td>
                <td style="padding:12px;">
                    ${s.nombre || '-'}
                    ${s.esLegacy ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:10px;margin-left:6px;">Legacy</span>' : ''}
                </td>
                <td style="padding:12px;">${s.tipoAplicativo || '-'}</td>
                <td style="padding:12px;"><span style="padding:2px 12px;border-radius:12px;font-size:12px;${estadoClase}">${s.estado || 'BORRADOR'}</span></td>
                <td style="padding:12px;"><span style="padding:2px 12px;border-radius:12px;font-size:12px;${riesgoClase}">${s.nivelRiesgo || '-'}</span></td>
                <td style="padding:12px;">${fechaFormateada}</td>
                <td style="padding:12px;">
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button class="btn btn-ghost btn-sm" onclick="verSistema(${s.id})" style="padding:4px 8px;border:1px solid #e5e7eb;border-radius:4px;background:white;cursor:pointer;">👁 Ver</button>
                        ${s.puedeEditar !== false ? `<button class="btn btn-ghost btn-sm" onclick="editarSistema(${s.id})" style="padding:4px 8px;border:1px solid #e5e7eb;border-radius:4px;background:white;cursor:pointer;">✏ Editar</button>` : ''}
                        ${s.puedeEnviar !== false ? `<button class="btn btn-verde btn-sm" onclick="enviarValidacion(${s.id})" style="padding:4px 8px;border:none;border-radius:4px;background:#059669;color:white;cursor:pointer;">📤 Enviar</button>` : ''}
                        <button class="btn btn-azul btn-sm" onclick="verHistorial(${s.id})" style="padding:4px 8px;border:none;border-radius:4px;background:#1a56db;color:white;cursor:pointer;">🕓 Historial</button>
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
// FUNCIONES DE UTILIDAD PARA ESTILOS
// ============================================================

function obtenerClaseEstado(estado) {
    const mapa = {
        'VALIDADO': 'background:#dcfce7;color:#166534;',
        'APROBADO': 'background:#dcfce7;color:#166534;',
        'OBSERVADO': 'background:#fee2e2;color:#991b1b;',
        'RECHAZADO': 'background:#fee2e2;color:#991b1b;',
        'ENVIADO': 'background:#dbeafe;color:#1e40af;',
        'BORRADOR': 'background:#f3f4f6;color:#4b5563;',
        'SUBSANADO': 'background:#fef3c7;color:#92400e;'
    };
    return mapa[estado] || 'background:#f3f4f6;color:#4b5563;';
}

function obtenerClaseRiesgo(riesgo) {
    const mapa = {
        'CRITICO': 'background:#fee2e2;color:#991b1b;',
        'ALTO': 'background:#fee2e2;color:#991b1b;',
        'MEDIO': 'background:#fef3c7;color:#92400e;',
        'BAJO': 'background:#dcfce7;color:#166534;'
    };
    return mapa[riesgo] || 'background:#f3f4f6;color:#4b5563;';
}

// ============================================================
// FILTRAR Y BUSCAR
// ============================================================

function filtrarSistemas() {
    console.log('🔍 Aplicando filtros...');
    cargarSistemas();
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
    const sistema = sistemasData.find(s => s.id === id);
    if (sistema && sistema.puedeEnviar === false) {
        alert(`⚠️ El sistema "${sistema.nombre}" no se puede enviar a validación porque está en estado "${sistema.estado}".`);
        return;
    }
    window.location.href = 'enviar-validacion.html?action=send&id=' + id;
}

function verHistorial(id) {
    window.location.href = 'historial-sistema.html?id=' + id;
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Mis Sistemas - Página cargada');
    
    // Cargar sistemas desde el backend
    cargarSistemas();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'mis-sistemas.html') {
            item.classList.add('active');
        }
    });

    // Event listeners para filtros
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarSistemas);
    }
    
    const filterEstado = document.getElementById('filter-estado');
    if (filterEstado) {
        filterEstado.addEventListener('change', filtrarSistemas);
    }
    
    const filterArea = document.getElementById('filter-area');
    if (filterArea) {
        filterArea.addEventListener('change', filtrarSistemas);
    }
    
    const filterTipo = document.getElementById('filter-tipo');
    if (filterTipo) {
        filterTipo.addEventListener('change', filtrarSistemas);
    }
    
    const filterCriticidad = document.getElementById('filter-criticidad');
    if (filterCriticidad) {
        filterCriticidad.addEventListener('change', filtrarSistemas);
    }
});
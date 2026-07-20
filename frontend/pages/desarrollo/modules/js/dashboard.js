// ============================================================
// DIAGTI · CTIC UNAS — Dashboard Desarrollo
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================

// ✅ URL del backend (cambia si es necesario)
const API_URL = 'http://localhost:8080/api/desarrollador';

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
        window.location.href = "../../../login/html/login.html";
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

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en API:', error);
        return null;
    }
}

// ============================================================
// CARGAR DASHBOARD DESDE EL BACKEND
// ============================================================

async function cargarDashboard() {
    try {
        const usuario = obtenerUsuarioActual();
        const data = await consumirAPI(`/dashboard?usuario=${usuario}`);

        if (data) {
            // ✅ Actualizar estadísticas
            if (data.estadisticas) {
                document.getElementById('total-sistemas').textContent = data.estadisticas.totalSistemas || 0;
                document.getElementById('total-borrador').textContent = data.estadisticas.sistemasBorrador || 0;
                document.getElementById('total-enviado').textContent = data.estadisticas.sistemasEnviados || 0;
                document.getElementById('total-observado').textContent = data.estadisticas.sistemasObservados || 0;
                document.getElementById('total-validado').textContent = data.estadisticas.sistemasValidados || 0;
            }

            // ✅ Actualizar actividad reciente
            if (data.actividadReciente && data.actividadReciente.length > 0) {
                renderizarActividadReciente(data.actividadReciente);
            } else {
                mostrarMensajeSinDatos('actividad-reciente', 'No hay actividad reciente');
            }

            // ✅ Actualizar riesgos críticos
            if (data.riesgosCriticos && data.riesgosCriticos.length > 0) {
                renderizarRiesgosCriticos(data.riesgosCriticos);
            } else {
                mostrarMensajeSinDatos('riesgos-criticos', '✅ No hay riesgos críticos');
            }
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        mostrarMensajeError();
    }
}

// ============================================================
// RENDERIZAR ACTIVIDAD RECIENTE
// ============================================================

function renderizarActividadReciente(actividades) {
    const container = document.getElementById('actividad-reciente');
    if (!container) return;

    if (!actividades || actividades.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--muted);">
                No hay actividad reciente
            </div>
        `;
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

    actividades.forEach(a => {
        const fecha = a.fecha ? new Date(a.fecha).toLocaleDateString('es-ES') : 'N/A';
        const badgeClass = a.estado === 'VALIDADO' ? 'low' : 
                           a.estado === 'OBSERVADO' ? 'high' : 
                           a.estado === 'ENVIADO' ? 'info' : 'gray';

        html += `
            <tr>
                <td><strong>${a.nombreSistema || 'Sistema'}</strong></td>
                <td><span class="badge ${badgeClass}">${a.accion || 'Actualizado'}</span></td>
                <td>${fecha}</td>
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
// RENDERIZAR RIESGOS CRÍTICOS
// ============================================================

function renderizarRiesgosCriticos(riesgos) {
    const container = document.getElementById('riesgos-criticos');
    if (!container) return;

    if (!riesgos || riesgos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--muted);">
                ✅ No hay riesgos críticos
            </div>
        `;
        return;
    }

    // Crear un contenedor para la tabla si no existe
    let html = `
        <div style="overflow-x:auto;margin-top:10px;">
            <table>
                <thead>
                    <tr>
                        <th>Sistema</th>
                        <th>Riesgo</th>
                        <th>Puntaje</th>
                        <th>Criticidad</th>
                    </tr>
                </thead>
                <tbody>
    `;

    riesgos.forEach(r => {
        const colorRiesgo = r.nivelRiesgo === 'CRITICO' ? '#dc2626' :
                            r.nivelRiesgo === 'ALTO' ? '#ea580c' :
                            r.nivelRiesgo === 'MEDIO' ? '#d97706' : '#16a34a';
        
        html += `
            <tr>
                <td><strong>${r.nombre || 'Sistema'}</strong></td>
                <td><span style="color:${colorRiesgo};font-weight:600;">${r.nivelRiesgo || 'N/A'}</span></td>
                <td>${r.puntaje || 0}/100</td>
                <td><span class="badge ${r.criticidad === 'CRITICA' ? 'high' : 'medium'}">${r.criticidad || 'N/A'}</span></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

function mostrarMensajeSinDatos(elementId, mensaje) {
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--muted);">
                ${mensaje}
            </div>
        `;
    }
}

function mostrarMensajeError() {
    const container = document.getElementById('actividad-reciente');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:30px;color:#dc2626;">
                ⚠️ Error al conectar con el servidor. 
                <br><small>Asegúrate de que el backend esté corriendo en http://localhost:8080</small>
            </div>
        `;
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // ✅ Cargar datos reales del backend
    cargarDashboard();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'dashboard.html') {
            item.classList.add('active');
        }
    });
});
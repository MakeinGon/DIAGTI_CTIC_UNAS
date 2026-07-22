// ============================================================
// DIAGTI · CTIC UNAS — Historial del Sistema
// ============================================================

// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL = 'http://localhost:8080/api/desarrollador/historial';

// ============================================================
// OBTENER USUARIO ACTUAL
// ============================================================

function obtenerUsuarioActual() {
    return localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'desarrollador1';
}

// ============================================================
// OBTENER ID DEL SISTEMA DESDE URL
// ============================================================

function obtenerIdSistema() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('sistemaId') || '1';
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
            const error = await response.text();
            throw new Error(error || `Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

// ============================================================
// CARGAR HISTORIAL DESDE EL BACKEND
// ============================================================

async function cargarHistorial() {
    try {
        const id = obtenerIdSistema();
        
        // Mostrar loading
        const container = document.getElementById('historial-timeline');
        if (container) {
            container.innerHTML = `
                <div style="padding:40px;text-align:center;color:var(--muted);">
                    <div style="font-size:32px;margin-bottom:12px;">⏳</div>
                    <p>Cargando historial del sistema...</p>
                </div>
            `;
        }

        const data = await consumirAPI(`/${id}`, 'GET');

        if (data) {
            renderizarInfoSistema(data.sistema);
            renderizarTrazabilidad(data.trazabilidad);
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
        // Fallback a datos mock
        cargarDatosMock();
    }
}

// ============================================================
// DATOS MOCK (FALLBACK)
// ============================================================

function cargarDatosMock() {
    const data = {
        sistema: {
            id: 1,
            codigo: 'SIS001',
            nombre: 'Sistema Académico',
            estadoActual: 'VALIDADO',
            areaUsuaria: 'Dirección Académica',
            responsableTecnico: 'Ing. María Gómez',
            responsableFuncional: 'Dr. Juan Pérez',
            criticidad: 'ALTA',
            nivelRiesgo: 'MEDIO',
            puntajeRiesgo: 45,
            fechaCreacion: '2026-07-01T10:00:00',
            fechaActualizacion: '2026-07-07T15:30:00',
            usuarioCreador: 'desarrollador1',
            usuarioModificador: 'validador1'
        },
        trazabilidad: [
            {
                fecha: '2026-07-07T15:30:00',
                usuario: 'CTIC Validador',
                accion: 'Validó sistema',
                estado: 'VALIDADO',
                descripcion: 'Sistema cumple con todos los requisitos técnicos',
                tipoEvento: 'VALIDACION',
                entidadAfectada: 'ValidacionTecnica'
            },
            {
                fecha: '2026-07-06T14:20:00',
                usuario: 'Luis',
                accion: 'Subsanó observaciones',
                estado: 'SUBSANADO',
                descripcion: 'Se corrigieron las observaciones señaladas',
                tipoEvento: 'SUBSANACION',
                entidadAfectada: 'ValidacionTecnica'
            },
            {
                fecha: '2026-07-05T09:15:00',
                usuario: 'CTIC Validador',
                accion: 'Observó el registro',
                estado: 'OBSERVADO',
                descripcion: 'Falta documentación técnica y evidencia de pruebas',
                tipoEvento: 'OBSERVACION',
                entidadAfectada: 'ValidacionTecnica'
            },
            {
                fecha: '2026-07-03T11:30:00',
                usuario: 'Luis',
                accion: 'Actualizó arquitectura',
                estado: 'BORRADOR',
                descripcion: 'Se actualizó la arquitectura del sistema',
                tipoEvento: 'ACTUALIZACION',
                entidadAfectada: 'ArquitecturaSoftware'
            },
            {
                fecha: '2026-07-01T10:00:00',
                usuario: 'Luis',
                accion: 'Creó sistema',
                estado: 'BORRADOR',
                descripcion: 'Registro inicial del sistema',
                tipoEvento: 'CREACION',
                entidadAfectada: 'SistemaInformatico'
            }
        ]
    };
    
    renderizarInfoSistema(data.sistema);
    renderizarTrazabilidad(data.trazabilidad);
}

// ============================================================
// RENDERIZAR INFORMACIÓN DEL SISTEMA
// ============================================================

function renderizarInfoSistema(sistema) {
    document.getElementById('hist-codigo').textContent = sistema.codigo || '-';
    document.getElementById('hist-nombre').textContent = sistema.nombre || '-';
    document.getElementById('hist-area').textContent = sistema.areaUsuaria || '-';
    document.getElementById('hist-responsable').textContent = sistema.responsableTecnico || '-';

    const estadoClase = obtenerClaseEstado(sistema.estadoActual);
    document.getElementById('hist-estado').innerHTML = 
        `<span class="badge ${estadoClase}">${sistema.estadoActual || '-'}</span>`;
}

// ============================================================
// RENDERIZAR TRAZABILIDAD (Línea de tiempo)
// ============================================================

function renderizarTrazabilidad(trazabilidad) {
    const container = document.getElementById('historial-timeline');
    if (!container) return;

    if (!trazabilidad || trazabilidad.length === 0) {
        container.innerHTML = `
            <div style="padding:40px;text-align:center;color:var(--muted);">
                <div style="font-size:48px;margin-bottom:12px;">📭</div>
                <p>No hay eventos registrados en el historial</p>
            </div>
        `;
        return;
    }

    let html = '';
    let prevDate = null;
    
    trazabilidad.forEach((item, index) => {
        const estadoClase = obtenerClaseEstado(item.estado);
        const fechaFormateada = formatearFecha(item.fecha);
        const esUltimo = index === trazabilidad.length - 1;
        
        // Separador de fecha si cambia
        const fechaActual = item.fecha ? new Date(item.fecha).toLocaleDateString() : '';
        if (fechaActual !== prevDate && index > 0) {
            html += `
                <div class="timeline-separator">
                    <span>${fechaActual}</span>
                </div>
            `;
        }
        prevDate = fechaActual;
        
        // Icono según tipo de evento
        const icono = obtenerIconoEvento(item.tipoEvento);
        
        html += `
            <div class="timeline-item ${esUltimo ? 'last' : ''}">
                <div class="timeline-dot ${obtenerClaseDot(item.tipoEvento)}">
                    ${icono}
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-usuario">${item.usuario || 'Sistema'}</span>
                        <span class="timeline-fecha">${formatearFechaHora(item.fecha)}</span>
                    </div>
                    <div class="timeline-accion">${item.accion}</div>
                    ${item.descripcion ? `<div class="timeline-descripcion">${item.descripcion}</div>` : ''}
                    <div class="timeline-footer">
                        <span class="badge ${estadoClase}">${item.estado || '-'}</span>
                        ${item.entidadAfectada ? `<span class="timeline-entidad">${item.entidadAfectada}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

function obtenerClaseEstado(estado) {
    const mapa = {
        'VALIDADO': 'status-success',
        'APROBADO': 'status-success',
        'OBSERVADO': 'status-danger',
        'RECHAZADO': 'status-danger',
        'ENVIADO': 'status-info',
        'BORRADOR': 'status-secondary',
        'SUBSANADO': 'status-warning',
        'CERRADO': 'status-secondary'
    };
    return mapa[estado] || 'status-secondary';
}

function obtenerClaseDot(tipoEvento) {
    const mapa = {
        'CREACION': 'dot-success',
        'ACTUALIZACION': 'dot-info',
        'VALIDACION': 'dot-success',
        'OBSERVACION': 'dot-danger',
        'SUBSANACION': 'dot-warning',
        'ENVIO': 'dot-info'
    };
    return mapa[tipoEvento] || 'dot-secondary';
}

function obtenerIconoEvento(tipoEvento) {
    const mapa = {
        'CREACION': '📄',
        'ACTUALIZACION': '✏️',
        'VALIDACION': '✅',
        'OBSERVACION': '👁️',
        'SUBSANACION': '🔄',
        'ENVIO': '📤'
    };
    return mapa[tipoEvento] || '📌';
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    try {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return fecha;
    }
}

function formatearFechaHora(fecha) {
    if (!fecha) return '-';
    try {
        const d = new Date(fecha);
        return d.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return fecha;
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    // Cargar historial desde el backend
    cargarHistorial();

    // Marcar ítem activo en sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === 'historial-sistema.html') {
            item.classList.add('active');
        }
    });
});
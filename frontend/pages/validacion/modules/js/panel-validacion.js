// panel-validacion.js

import { obtenerHeaders } from './api-utils.js';

// ============================================
// 1. ESTADO DEL PANEL
// ============================================

let panelAbierto = false;
let sistemaActual = null;
let datosUsuario = null;

// ============================================
// 2. OBTENER DATOS DEL USUARIO
// ============================================

async function obtenerDatosUsuario() {
    try {
        const response = await fetch('http://localhost:8080/api/usuario/actual', {
            headers: obtenerHeaders()
        });
        if (response.ok) {
            datosUsuario = await response.json();
        } else {
            datosUsuario = { nombre: 'Validador CTIC', rol: 'Validador' };
        }
    } catch (error) {
        datosUsuario = { nombre: 'Validador CTIC', rol: 'Validador' };
    }
    return datosUsuario;
}

// ============================================
// 3. ABRIR PANEL
// ============================================

async function abrirPanelValidacion(sistemaId) {
    const panel = document.getElementById('panel-validacion');
    const overlay = document.getElementById('panel-overlay');
    const body = document.getElementById('panel-body');

    if (!panel || !overlay || !body) return;

    body.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span class="spinner-text">Cargando información del sistema...</span>
        </div>
    `;

    overlay.classList.add('active');
    panel.classList.add('active');
    panelAbierto = true;
    document.body.style.overflow = 'hidden';

    if (!datosUsuario) {
        await obtenerDatosUsuario();
    }

    await cargarSistema(sistemaId, body);
}

// ============================================
// 4. CERRAR PANEL
// ============================================

function cerrarPanelValidacion() {
    const panel = document.getElementById('panel-validacion');
    const overlay = document.getElementById('panel-overlay');

    if (panel) panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    panelAbierto = false;
    document.body.style.overflow = '';
}

// Exponer globalmente para usar en HTML
window.abrirPanelValidacion = abrirPanelValidacion;
window.cerrarPanelValidacion = cerrarPanelValidacion;

// ============================================
// 5. CARGAR SISTEMA (CON DATOS DE EJEMPLO)
// ============================================

async function cargarSistema(sistemaId, container) {
    try {
        const response = await fetch(`http://localhost:8080/api/sistemas/${sistemaId}`, {
            headers: obtenerHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        sistemaActual = data;

        const [evidencias, historial] = await Promise.all([
            cargarEvidencias(sistemaId),
            cargarHistorial(sistemaId)
        ]);

        container.innerHTML = renderizarPanel(data, evidencias, historial);

    } catch (error) {
        console.error("Error al cargar sistema:", error);
        
        // ====== USAR DATOS DE EJEMPLO ======
        const dataEjemplo = generarDatosSistemaEjemplo(sistemaId);
        sistemaActual = dataEjemplo;
        
        const evidencias = [
            { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
            { nombre: 'Informe de Pruebas', estado: 'Faltante', clase: 'danger' },
            { nombre: 'Documentación de API', estado: 'Pendiente', clase: 'warning' }
        ];
        
        const historial = [
            { fecha: '2026-07-05', estado: 'Observado', comentario: 'Faltan evidencias de pruebas', validador: 'Validador CTIC', clase: 'warning' },
            { fecha: '2026-07-03', estado: 'Aprobado', comentario: 'Documentación completa y correcta', validador: 'Validador CTIC', clase: 'success' },
            { fecha: '2026-07-01', estado: 'Enviado', comentario: 'Sistema enviado para validación', validador: 'Sistema', clase: 'info' }
        ];
        
        container.innerHTML = renderizarPanel(dataEjemplo, evidencias, historial);
    }
}

// ============================================
// 5.1 GENERAR DATOS DE SISTEMA DE EJEMPLO
// ============================================

function generarDatosSistemaEjemplo(id) {
    const sistemas = {
        1: { 
            id: 1, nombre: 'Sistema Académico UNAS', descripcion: 'Sistema de gestión académica', 
            estado: 'Enviado para validación', ultimaRevision: '2026-07-08', nivelRiesgo: 'Alta',
            responsable: 'Ing. Carlos Ruiz', version: 'v2.5.1', 
            area: 'Oficina de Registro', framework: 'Spring Boot 3.2', baseDatos: 'PostgreSQL 15', servidor: 'Tomcat 10' 
        },
        2: { 
            id: 2, nombre: 'Sistema Financiero', descripcion: 'Sistema de gestión financiera', 
            estado: 'Enviado para validación', ultimaRevision: '2026-07-07', nivelRiesgo: 'Crítica',
            responsable: 'Ing. María Gómez', version: 'v3.0.2', 
            area: 'Oficina de Finanzas', framework: 'Laravel 10', baseDatos: 'MySQL 8', servidor: 'Apache 2.4' 
        },
        3: { 
            id: 3, nombre: 'Portal Web Institucional', descripcion: 'Portal institucional de la UNAS', 
            estado: 'Enviado para validación', ultimaRevision: '2026-07-06', nivelRiesgo: 'Media',
            responsable: 'Ing. Luis Martínez', version: 'v1.8.0', 
            area: 'Oficina de Comunicaciones', framework: 'React 18', baseDatos: 'MongoDB', servidor: 'Node.js 20' 
        }
    };
    
    return sistemas[id] || sistemas[1];
}

// ============================================
// 6. CARGAR EVIDENCIAS
// ============================================

async function cargarEvidencias(sistemaId) {
    try {
        const response = await fetch(`http://localhost:8080/api/sistemas/${sistemaId}/evidencias`, {
            headers: obtenerHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn("Error al cargar evidencias:", error);
        return [
            { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
            { nombre: 'Informe de Pruebas', estado: 'Faltante', clase: 'danger' },
            { nombre: 'Documentación de API', estado: 'Pendiente', clase: 'warning' }
        ];
    }
}

// ============================================
// 7. CARGAR HISTORIAL
// ============================================

async function cargarHistorial(sistemaId) {
    try {
        const response = await fetch(`http://localhost:8080/api/sistemas/${sistemaId}/historial`, {
            headers: obtenerHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn("Error al cargar historial:", error);
        return [
            { fecha: '2026-07-05', estado: 'Observado', comentario: 'Faltan evidencias de pruebas', validador: 'Validador CTIC', clase: 'warning' },
            { fecha: '2026-07-03', estado: 'Aprobado', comentario: 'Documentación completa y correcta', validador: 'Validador CTIC', clase: 'success' },
            { fecha: '2026-07-01', estado: 'Enviado', comentario: 'Sistema enviado para validación', validador: 'Sistema', clase: 'info' }
        ];
    }
}

// ============================================
// 8. RENDERIZAR PANEL
// ============================================

function renderizarPanel(data, evidencias, historial) {
    const badgeColor = data.nivelRiesgo === 'Crítico' ? 'danger' :
                       data.nivelRiesgo === 'Alto' ? 'warning' :
                       data.nivelRiesgo === 'Medio' ? 'info' : 'success';

    return `
        <div class="panel-validacion">

            <!-- INFORMACIÓN DEL SISTEMA -->
            <div class="info-card">
                <div class="info-card-title"><i class="fas fa-desktop"></i> Información del Sistema</div>
                <div class="info-row"><span class="label">Nombre</span><span class="value"><strong>${data.nombre || '--'}</strong></span></div>
                <div class="info-row"><span class="label">Responsable</span><span class="value">${data.responsable || '--'}</span></div>
                <div class="info-row"><span class="label">Versión</span><span class="value">${data.version || '--'}</span></div>
                <div class="info-row"><span class="label">Área</span><span class="value">${data.area || '--'}</span></div>
                <div class="info-row"><span class="label">Estado</span><span class="value"><span class="badge ${getBadgeClass(data.estado)}">${data.estado || 'Pendiente'}</span></span></div>
                <div class="info-row"><span class="label">Criticidad</span><span class="value"><span class="badge ${badgeColor}">${data.nivelRiesgo || 'Media'}</span></span></div>
            </div>

            <!-- EVIDENCIAS -->
            <div class="info-card">
                <div class="info-card-title"><i class="fas fa-file"></i> Evidencias Obligatorias <span style="font-size:11px;color:var(--muted);font-weight:400;">(RF-15)</span></div>
                ${evidencias && evidencias.length > 0 ? evidencias.map(ev => `
                    <div class="evidencia-item">
                        <span class="evidencia-nombre"><i class="fas fa-file-${ev.clase === 'success' ? 'pdf' : 'exclamation'}"></i> ${ev.nombre}</span>
                        <span class="badge ${ev.clase}">${ev.estado === 'Cargado' ? '✅' : ev.estado === 'Faltante' ? '❌' : '⏳'} ${ev.estado}</span>
                    </div>
                `).join('') : '<div style="text-align:center;padding:12px;color:var(--muted);"><i class="fas fa-info-circle"></i> No hay evidencias registradas</div>'}
                ${data.nivelRiesgo === 'Crítico' || data.nivelRiesgo === 'Alta' ? `
                    <div style="margin-top:10px;padding:8px 12px;background:#fef3c7;border-radius:6px;font-size:12px;color:#92400e;">
                        <i class="fas fa-exclamation-triangle"></i> <strong>Nota:</strong> Sistemas con criticidad <strong>${data.nivelRiesgo}</strong> requieren todas las evidencias.
                    </div>
                ` : ''}
            </div>

            <!-- HISTORIAL -->
            <div class="info-card">
                <div class="info-card-title"><i class="fas fa-history"></i> Historial de Validaciones <span style="font-size:11px;color:var(--muted);font-weight:400;">(RNF-19)</span></div>
                ${historial && historial.length > 0 ? historial.map(item => `
                    <div class="historial-item">
                        <span class="fecha">${item.fecha || '--'}</span>
                        <span class="badge ${item.clase || 'info'}">${item.estado || '--'}</span>
                        <span class="comentario">${item.comentario || '--'}</span>
                        <span class="validador">👤 ${item.validador || '--'}</span>
                    </div>
                `).join('') : '<div style="text-align:center;padding:12px;color:var(--muted);"><i class="fas fa-info-circle"></i> No hay historial de validaciones</div>'}
            </div>

            <!-- ACCIONES -->
            <div class="info-card" style="border-top:3px solid var(--color-verde-ctic);">
                <div class="info-card-title"><i class="fas fa-arrows-spin"></i> Acción de Validación</div>
                <div class="form-group">
                    <label for="comentario-panel">Comentario de validación <span class="required">*</span></label>
                    <textarea id="comentario-panel" rows="4" placeholder="Escribe aquí tu comentario..."></textarea>
                    <small><i class="fas fa-info-circle"></i> El comentario es obligatorio y debe tener al menos 5 caracteres.</small>
                </div>
                <div class="form-actions">
                    <button onclick="ejecutarValidacion('aprobado')" class="btn btn-verde"><i class="fas fa-circle-check"></i> Aprobar</button>
                    <button onclick="ejecutarValidacion('observado')" class="btn btn-observar"><i class="fas fa-circle-exclamation"></i> Observar</button>
                    <button onclick="ejecutarValidacion('rechazado')" class="btn btn-rechazar"><i class="fas fa-ban"></i> Rechazar</button>
                </div>
                <div id="mensaje-panel" class="form-message"></div>
                <div id="resumen-panel" class="resumen-validacion">
                    <div class="resumen-titulo">📋 Resumen de la validación</div>
                    <div class="resumen-detalles">
                        <span>Estado: <strong id="resumen-estado">--</strong></span>
                        <span>Validador: <strong id="resumen-validador">--</strong></span>
                        <span>Fecha: <strong id="resumen-fecha">--</strong></span>
                    </div>
                </div>
            </div>

        </div>
    `;
}

// ============================================
// 9. FUNCIONES AUXILIARES
// ============================================

function getBadgeClass(estado) {
    const map = {
        'Pendiente': 'warning',
        'Enviado para validación': 'warning',
        'Enviado': 'info',
        'Observado': 'warning',
        'Aprobado': 'success',
        'Rechazado': 'danger',
        'Cerrado': 'gray',
        'Validado': 'success'
    };
    return map[estado] || 'info';
}

// ============================================
// 10. EJECUTAR VALIDACIÓN
// ============================================

window.ejecutarValidacion = async function(estado) {
    const comentario = document.getElementById('comentario-panel')?.value?.trim();
    const mensajeDiv = document.getElementById('mensaje-panel');
    const resumenDiv = document.getElementById('resumen-panel');
    const botones = document.querySelectorAll('.panel-validacion .form-actions .btn');

    if (!comentario || comentario.length < 5) {
        const textarea = document.getElementById('comentario-panel');
        textarea.classList.add('error');
        mensajeDiv.textContent = '⚠️ El comentario es obligatorio y debe tener al menos 5 caracteres.';
        mensajeDiv.className = 'form-message warning';
        textarea.focus();
        return;
    }

    document.getElementById('comentario-panel')?.classList.remove('error');
    botones.forEach(b => b.disabled = true);

    const nombreSistema = sistemaActual?.nombre || 'Sistema sin nombre';
    const acciones = {
        'aprobado': { texto: 'Aprobando', icono: '✅', estadoFinal: 'Aprobado', clase: 'success' },
        'observado': { texto: 'Observando', icono: '⚠️', estadoFinal: 'Observado', clase: 'warning' },
        'rechazado': { texto: 'Rechazando', icono: '❌', estadoFinal: 'Rechazado', clase: 'danger' }
    };

    const accion = acciones[estado];

    const payload = {
        sistemaId: sistemaActual?.id || 1,
        sistemaNombre: nombreSistema,
        estado: estado,
        estadoTexto: accion.estadoFinal,
        comentario: comentario,
        fechaAccion: new Date().toISOString(),
        validador: datosUsuario?.nombre || 'Validador CTIC',
        usuario: datosUsuario?.nombre || 'Validador CTIC'
    };

    mensajeDiv.textContent = `⏳ ${accion.texto} registro...`;
    mensajeDiv.className = 'form-message info';

    try {
        const response = await fetch('http://localhost:8080/api/validaciones', {
            method: 'POST',
            headers: {
                ...obtenerHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
        }

        mensajeDiv.textContent = `✅ Registro ${accion.estadoFinal.toLowerCase()} correctamente`;
        mensajeDiv.className = 'form-message success';

        document.getElementById('resumen-estado').textContent = accion.estadoFinal;
        document.getElementById('resumen-validador').textContent = datosUsuario?.nombre || 'Validador CTIC';
        document.getElementById('resumen-fecha').textContent = new Date().toLocaleString();
        resumenDiv.className = 'resumen-validacion show';

        setTimeout(() => {
            cerrarPanelValidacion();
            if (window.cargarPendientes) {
                window.cargarPendientes();
            }
        }, 2000);

    } catch (error) {
        console.error("Error:", error);
        mensajeDiv.textContent = `❌ ${error.message}`;
        mensajeDiv.className = 'form-message error';
        botones.forEach(b => b.disabled = false);
    }
};

// ============================================
// 11. CERRAR CON ESC
// ============================================

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && panelAbierto) {
        cerrarPanelValidacion();
    }
});

// ============================================
// 12. EXPORTAR UNA SOLA VEZ
// ============================================

export { 
    abrirPanelValidacion, 
    cerrarPanelValidacion, 
    obtenerDatosUsuario 
};
// ============================================
// 1. IMPORTACIONES
// ============================================

import { obtenerHeaders } from './api-utils.js';
import './panel-detalle.js';
import { configurarCerrarSesion } from "./common.js";

// ... resto del código
// ============================================
// 1. DATOS DE EJEMPLO (PENDIENTES) - SIN CRITICIDAD
// ============================================

const datosEjemplo = [
    { id: 1, nombre: 'Sistema Académico UNAS', area: 'Oficina de Registro', fecha: '2026-07-08' },
    { id: 2, nombre: 'Sistema Financiero', area: 'Oficina de Finanzas', fecha: '2026-07-07' },
    { id: 3, nombre: 'Portal Web Institucional', area: 'Oficina de Comunicaciones', fecha: '2026-07-06' },
    { id: 4, nombre: 'Sistema de Inventario', area: 'Oficina de Logística', fecha: '2026-07-05' },
    { id: 5, nombre: 'Sistema de RRHH', area: 'Oficina de Recursos Humanos', fecha: '2026-07-04' },
    { id: 6, nombre: 'Sistema de Biblioteca', area: 'Biblioteca Central', fecha: '2026-07-03' },
    { id: 7, nombre: 'Sistema de Matrícula', area: 'Oficina de Registro', fecha: '2026-07-02' },
    { id: 8, nombre: 'Sistema de Notas', area: 'Oficina de Registro', fecha: '2026-07-01' }
];

// ============================================
// 2. DATOS DE DETALLE DE SISTEMAS (para el panel de detalle)
// ============================================

const detallesSistemas = {
    1: {
        id: 1,
        nombre: 'Sistema Académico UNAS',
        descripcion: 'Sistema de gestión académica para la Universidad Nacional Agraria de la Selva',
        estado: 'Activo',
        ultimaRevision: '2026-07-08',
        nivelRiesgo: 'Alta',
        responsable: 'Ing. Carlos Ruiz',
        version: 'v2.5.1',
        area: 'Oficina de Registro',
        framework: 'Spring Boot 3.2',
        baseDatos: 'PostgreSQL 15',
        servidor: 'Tomcat 10'
    },
    2: {
        id: 2,
        nombre: 'Sistema Financiero',
        descripcion: 'Sistema de gestión financiera institucional',
        estado: 'Activo',
        ultimaRevision: '2026-07-07',
        nivelRiesgo: 'Crítica',
        responsable: 'Ing. María Gómez',
        version: 'v3.0.2',
        area: 'Oficina de Finanzas',
        framework: 'Laravel 10',
        baseDatos: 'MySQL 8',
        servidor: 'Apache 2.4'
    },
    3: {
        id: 3,
        nombre: 'Portal Web Institucional',
        descripcion: 'Portal web de la Universidad Nacional Agraria de la Selva',
        estado: 'Activo',
        ultimaRevision: '2026-07-06',
        nivelRiesgo: 'Media',
        responsable: 'Ing. Luis Martínez',
        version: 'v1.8.0',
        area: 'Oficina de Comunicaciones',
        framework: 'React 18',
        baseDatos: 'MongoDB',
        servidor: 'Node.js 20'
    }
};

function obtenerDetalleSistema(id) {
    return detallesSistemas[id] || {
        id: id,
        nombre: 'Sistema sin información',
        descripcion: 'No se encontraron datos para este sistema',
        estado: '--',
        ultimaRevision: '--',
        nivelRiesgo: '--',
        responsable: '--',
        version: '--',
        area: '--',
        framework: '--',
        baseDatos: '--',
        servidor: '--'
    };
}

// ============================================
// 3. FUNCIONES AUXILIARES
// ============================================

function getBadgeClassEstado(estado) {
    const map = {
        'Activo': 'success',
        'Inactivo': 'danger',
        'En Mantenimiento': 'warning',
        'Pendiente': 'warning',
        'Enviado para validación': 'warning'
    };
    return map[estado] || 'info';
}

// ============================================
// 4. PANEL DE DETALLE
// ============================================

function abrirPanelDetalle(id) {
    if (typeof abrirPanelDetalleUnico !== 'undefined') {
        console.log('✅ Usando abrirPanelDetalleUnico para ID:', id);
        abrirPanelDetalleUnico(id);
        return;
    }
    
    console.log('⚠️ Usando abrirPanelDetalle original para ID:', id);
    const panel = document.getElementById('panel-detalle');
    const overlay = document.getElementById('panel-overlay-detalle');
    const body = document.getElementById('panel-body-detalle');
    
    if (!panel || !overlay || !body) {
        console.error('❌ No se encontraron elementos del panel de detalle');
        return;
    }
    
    body.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span class="spinner-text">Cargando información del sistema...</span>
        </div>
    `;
    
    overlay.classList.add('active');
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        const data = obtenerDetalleSistema(id);
        body.innerHTML = renderizarDetalleSistema(data);
    }, 300);
}

function cerrarPanelDetalle() {
    if (typeof cerrarPanelDetalleUnico !== 'undefined') {
        cerrarPanelDetalleUnico();
        return;
    }
    
    const panel = document.getElementById('panel-detalle');
    const overlay = document.getElementById('panel-overlay-detalle');
    
    if (panel) panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function renderizarDetalleSistema(data) {
    const badgeColor = data.nivelRiesgo === 'Crítica' ? 'danger' :
                       data.nivelRiesgo === 'Alta' ? 'warning' :
                       data.nivelRiesgo === 'Media' ? 'info' : 'success';

    return `
        <div class="panel-content">
            <div class="info-card" style="border-left: 5px solid var(--color-verde-ctic);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span class="badge info"><i class="fas fa-info-circle"></i> SISTEMA</span>
                        <h2 style="margin: 8px 0 4px; font-size: 20px; color: var(--text);">${data.nombre || '--'}</h2>
                        <p style="color: var(--muted); font-size: 13px; margin: 0;">${data.descripcion || 'Información del sistema'}</p>
                    </div>
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--color-verde-ctic), var(--color-verde-dark)); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                        <i class="fas fa-desktop"></i>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                <div class="info-card" style="padding: 12px 14px; border-left: 3px solid #16a34a;">
                    <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 600;">Estado</div>
                    <div style="font-size: 22px; font-weight: 700; margin: 4px 0; color: var(--text);">${data.estado || '--'}</div>
                    <span class="badge ${getBadgeClassEstado(data.estado)}">Actual</span>
                </div>
                <div class="info-card" style="padding: 12px 14px; border-left: 3px solid #ca8a04;">
                    <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 600;">Última Revisión</div>
                    <div style="font-size: 22px; font-weight: 700; margin: 4px 0; color: var(--text);">${data.ultimaRevision || '--'}</div>
                    <span class="badge warning">Registrada</span>
                </div>
                <div class="info-card" style="padding: 12px 14px; border-left: 3px solid #dc2626;">
                    <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 600;">Riesgo</div>
                    <div style="font-size: 22px; font-weight: 700; margin: 4px 0; color: var(--text);">${data.nivelRiesgo || '--'}</div>
                    <span class="badge ${badgeColor}">Detectado</span>
                </div>
            </div>

            <div class="info-card">
                <div class="info-card-title"><i class="fas fa-folder-open"></i> Información General</div>
                <div class="info-row"><span class="label">Responsable</span><span class="value">${data.responsable || '--'}</span></div>
                <div class="info-row"><span class="label">Versión Actual</span><span class="value">${data.version || '--'}</span></div>
                <div class="info-row"><span class="label">Área</span><span class="value">${data.area || '--'}</span></div>
            </div>

            <div class="info-card">
                <div class="info-card-title"><i class="fas fa-server"></i> Datos Técnicos</div>
                <div class="info-row"><span class="label">Framework</span><span class="value">${data.framework || '--'}</span></div>
                <div class="info-row"><span class="label">Base de Datos</span><span class="value">${data.baseDatos || '--'}</span></div>
                <div class="info-row"><span class="label">Servidor</span><span class="value">${data.servidor || '--'}</span></div>
            </div>

            <button onclick="cerrarPanelDetalle()" class="btn btn-verde" style="width: 100%; justify-content: center; background: #0f75bc; color: white; padding: 10px 16px; border: none; border-radius: 4px; font-weight: 700; font-size: 12px; cursor: pointer;">
                <i class="fas fa-times"></i> Cerrar Detalle
            </button>
        </div>
    `;
}

// ============================================
// 5. FUNCIONES DE ACCIÓN (GLOBALES)
// ============================================

window.verDetalle = function(id) {
    console.log('👁️ Ver detalle del sistema ID:', id);
    abrirPanelDetalle(id);
};

window.abrirPanelValidacion = function(id) {
    window.location.href = `validar-desarrollo.html?id=${id}`;
    console.log(`📢 Redirigiendo a validar-desarrollo.html?id=${id}`);
};

window.cerrarPanelDetalle = cerrarPanelDetalle;

// ============================================
// 6. RENDERIZAR TABLA (SIN CRITICIDAD - 4 COLUMNAS)
// ============================================

function renderizarTabla(datos) {
    const tbody = document.getElementById('pendientes-body');
    
    if (!tbody) {
        console.error('❌ No se encontró pendientes-body');
        return;
    }

    if (!datos || datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: var(--muted);">
                    <i class="fas fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                    No hay sistemas pendientes
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = datos.map(item => `
        <tr>
            <td><strong>${item.nombre}</strong></td>
            <td>${item.area}</td>
            <td>${item.fecha}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-info" onclick="window.verDetalle(${item.id})" title="Ver detalle del sistema" style="background: #dbeafe; color: #1e40af; border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-verde" onclick="window.abrirPanelValidacion(${item.id})" title="Validar sistema" style="background: #1abb9c; color: white; border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                        <i class="fas fa-magnifying-glass"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    console.log('✅ Tabla renderizada con', datos.length, 'registros (sin criticidad)');
}

// ============================================
// 7. CARGAR PENDIENTES DESDE EL BACKEND
// ============================================

async function cargarPendientes() {
    console.log('🔄 Cargando pendientes desde el backend...');
    
    const btnActualizar = document.getElementById('btn-actualizar');
    const icon = btnActualizar?.querySelector('i');
    
    if (btnActualizar) {
        btnActualizar.disabled = true;
        btnActualizar.style.opacity = '0.7';
        if (icon) icon.classList.add('fa-spin');
    }
    
    try {
        // ✅ ENDPOINT CORRECTO
        const response = await fetch('/api/validacion/pendientes', {
            headers: obtenerHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Pendientes desde API:', data);
            
            if (data && data.length > 0) {
                // Convertir datos de la API al formato de la tabla
                const datosTabla = data.map(item => ({
                    id: item.idSistema || item.id,
                    nombre: item.nombreSistema || 'Sistema sin nombre',
                    area: item.area || '--',
                    fecha: item.fechaCreacion ? new Date(item.fechaCreacion).toISOString().split('T')[0] : '--'
                }));
                renderizarTabla(datosTabla);
                mostrarNotificacion(`✅ ${data.length} sistemas pendientes cargados`, 'success');
            } else {
                renderizarTabla([]);
                mostrarNotificacion('📋 No hay sistemas pendientes', 'info');
            }
        } else {
            console.warn('⚠️ API no disponible, usando datos de ejemplo');
            renderizarTabla(datosEjemplo);
            mostrarNotificacion('ℹ️ Usando datos de ejemplo', 'info');
        }
    } catch (error) {
        console.warn('⚠️ Error al conectar con la API:', error.message);
        renderizarTabla(datosEjemplo);
        mostrarNotificacion('ℹ️ Usando datos de ejemplo', 'info');
    } finally {
        if (btnActualizar) {
            btnActualizar.disabled = false;
            btnActualizar.style.opacity = '1';
            if (icon) icon.classList.remove('fa-spin');
        }
    }
}
// ============================================
// 8. MOSTRAR NOTIFICACIONES FLOTANTES
// ============================================

function mostrarNotificacion(mensaje, tipo = 'success') {
    const existing = document.querySelectorAll('.notification-toast');
    existing.forEach(el => el.remove());

    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 380px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#dcfce7', border: '#16a34a', text: '#166534', icon: 'fa-check-circle' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: 'fa-exclamation-circle' },
        warning: { bg: '#fef3c7', border: '#ca8a04', text: '#92400e', icon: 'fa-triangle-exclamation' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'fa-info-circle' }
    };

    const style = colors[tipo] || colors.success;

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        background: ${style.bg};
        border-left: 4px solid ${style.border};
        border-radius: 10px;
        padding: 14px 18px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.4s ease;
        font-size: 13px;
        color: ${style.text};
        font-weight: 600;
        pointer-events: auto;
        min-width: 280px;
        transition: all 0.3s ease;
    `;

    notification.innerHTML = `
        <i class="fas ${style.icon}" style="font-size: 18px; color: ${style.border}; flex-shrink: 0;"></i>
        <span style="flex: 1;">${mensaje}</span>
        <button onclick="this.closest('.notification-toast').remove()" style="
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: ${style.text};
            opacity: 0.5;
            padding: 0 4px;
            transition: opacity 0.2s;
            flex-shrink: 0;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">×</button>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(120%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// ============================================
// 9. ESTILOS DE ANIMACIÓN
// ============================================

if (!document.getElementById('notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-toast {
            animation: slideInRight 0.4s ease;
        }
        .panel-content .info-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 14px;
        }
        .panel-content .info-card-title {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .panel-content .info-card-title i {
            color: var(--color-verde-ctic);
        }
        .panel-content .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid var(--border);
        }
        .panel-content .info-row:last-child {
            border-bottom: none;
        }
        .panel-content .label {
            color: var(--muted);
            font-size: 13px;
        }
        .panel-content .value {
            font-weight: 600;
            font-size: 13px;
            color: var(--text);
        }
        .panel-content .badge {
            display: inline-block;
            border-radius: 999px;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .01em;
        }
        .panel-content .badge.info {
            background: #dbeafe;
            color: #1e40af;
        }
        .panel-content .badge.success {
            background: #dcfce7;
            color: #166534;
        }
        .panel-content .badge.warning {
            background: #fef3c7;
            color: #92400e;
        }
        .panel-content .badge.danger {
            background: #fee2e2;
            color: #991b1b;
        }
    `;
    document.head.appendChild(styleSheet);
}

// ============================================
// 10. INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado');
    
    // Cargar datos iniciales
    cargarPendientes();
    
    // Configurar evento del botón Actualizar
    const btnActualizar = document.getElementById('btn-actualizar');
    if (btnActualizar) {
        // Remover event listeners anteriores para evitar duplicados
        const nuevoBtn = btnActualizar.cloneNode(true);
        btnActualizar.parentNode.replaceChild(nuevoBtn, btnActualizar);
        nuevoBtn.addEventListener('click', cargarPendientes);
    }
    
    // Configurar cerrar sesión
    configurarCerrarSesion();
    
    console.log('✅ Inicialización completa');
});

// ============================================
// 11. EXPONER FUNCIONES GLOBALMENTE
// ============================================

window.cargarPendientes = cargarPendientes;
window.verDetalle = window.verDetalle;
window.abrirPanelValidacion = window.abrirPanelValidacion;
window.cerrarPanelDetalle = cerrarPanelDetalle;

console.log('✅ pendientes.js cargado correctamente (sin criticidad)');
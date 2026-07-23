// dashboard.js

import { obtenerHeaders } from './api-utils.js';
import { configurarCerrarSesion } from "./common.js";

/**
 * Función para actualizar la interfaz con los datos recibidos
 */
function actualizarInterfaz(data) {
    // Actualizar tarjetas de estadísticas
    const statsPendientes = document.getElementById('stats-pendientes');
    const statsSubsanacion = document.getElementById('stats-subsanacion');
    const statsValidados = document.getElementById('stats-validados');

    if (statsPendientes) statsPendientes.textContent = data.pendientes ?? '--';
    if (statsSubsanacion) statsSubsanacion.textContent = data.observados ?? '--';
    if (statsValidados) statsValidados.textContent = data.validados ?? '--';

    // Actualizar indicadores de gestión
    const indPendientes = document.getElementById('ind-pendientes');
    const indSubsanacion = document.getElementById('ind-subsanacion');
    const indValidados = document.getElementById('ind-validados');

    if (indPendientes) indPendientes.textContent = data.pendientes ? `${data.pendientes} sistemas` : '--';
    if (indSubsanacion) indSubsanacion.textContent = data.observados ? `${data.observados} sistemas` : '--';
    if (indValidados) indValidados.textContent = data.validados ? `${data.validados} sistemas` : '--';
}

/**
 * Función para mostrar notificación de actualización
 */
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

/**
 * Función principal para cargar el dashboard
 */
async function cargarDashboard() {
    const btn = document.getElementById('btn-actualizar');
    const icon = btn?.querySelector('i');

    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
        if (icon) icon.classList.add('fa-spin');
    }

    try {
        const response = await fetch('/api/flujo-validacion/historial', {
            headers: obtenerHeaders()
        });

        if (response.ok) {
            const solicitudes = await response.json();
            const vistos = new Set();
            const actuales = solicitudes.filter(x => {
                const clave = `${x.areaOrigen}:${x.codigoSistema}`;
                return vistos.has(clave) ? false : (vistos.add(clave), true);
            });
            const data = {
                pendientes: actuales.filter(x => x.estado === 'PENDIENTE').length,
                observados: actuales.filter(x => x.estado === 'OBSERVADO').length,
                validados: actuales.filter(x => x.estado === 'VALIDADO').length
            };
            actualizarInterfaz(data);
            mostrarNotificacion('✅ Datos cargados correctamente', 'success');
        } else {
            throw new Error(`Error ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Error al conectar con la API:', error.message);
        mostrarNotificacion('No se pudieron consultar las estadísticas reales', 'error');
        actualizarInterfaz({ pendientes: '--', observados: '--', validados: '--' });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            if (icon) icon.classList.remove('fa-spin');
        }
    }
}

/**
 * Inicialización al cargar la página
 */
document.addEventListener('DOMContentLoaded', function() {
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
        `;
        document.head.appendChild(styleSheet);
    }

    const btnActualizar = document.getElementById('btn-actualizar');
    if (btnActualizar) {
        const nuevoBtn = btnActualizar.cloneNode(true);
        btnActualizar.parentNode.replaceChild(nuevoBtn, btnActualizar);
        nuevoBtn.addEventListener('click', cargarDashboard);
    }

    cargarDashboard();
    configurarCerrarSesion();
    window.addEventListener('focus', cargarDashboard);
    window.setInterval(() => { if (!document.hidden) cargarDashboard(); }, 15000);
});

export { cargarDashboard, actualizarInterfaz, mostrarNotificacion };

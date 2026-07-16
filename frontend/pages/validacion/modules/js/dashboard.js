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
    if (statsSubsanacion) statsSubsanacion.textContent = data.subsanacion ?? '--';
    if (statsValidados) statsValidados.textContent = data.validados ?? '--';

    // Actualizar indicadores de gestión
    const indPendientes = document.getElementById('ind-pendientes');
    const indSubsanacion = document.getElementById('ind-subsanacion');
    const indValidados = document.getElementById('ind-validados');

    if (indPendientes) indPendientes.textContent = data.pendientes ? `${data.pendientes} sistemas` : '--';
    if (indSubsanacion) indSubsanacion.textContent = data.subsanacion ? `${data.subsanacion} sistemas` : '--';
    if (indValidados) indValidados.textContent = data.validados ? `${data.validados} sistemas` : '--';
}

/**
 * Función para mostrar notificación de actualización
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Eliminar notificaciones anteriores
    const existing = document.querySelectorAll('.notification-toast');
    existing.forEach(el => el.remove());

    // Crear contenedor si no existe
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

    // Configurar colores según tipo
    const colors = {
        success: { bg: '#dcfce7', border: '#16a34a', text: '#166534', icon: 'fa-check-circle' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: 'fa-exclamation-circle' },
        warning: { bg: '#fef3c7', border: '#ca8a04', text: '#92400e', icon: 'fa-triangle-exclamation' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'fa-info-circle' }
    };

    const style = colors[tipo] || colors.success;

    // Crear notificación
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

    // Auto-eliminar después de 4 segundos
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

    // Mostrar estado de carga
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
        if (icon) icon.classList.add('fa-spin');
    }

    try {
        // Datos de ejemplo predefinidos
        const datosEjemplo = {
            pendientes: 5,
            subsanacion: 3,
            validados: 8
        };

        // Intentar cargar desde la API
        try {
            const response = await fetch('http://localhost:8080/api/dashboard/stats', {
                headers: obtenerHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                datosEjemplo.pendientes = data.pendientes ?? datosEjemplo.pendientes;
                datosEjemplo.subsanacion = data.subsanacion ?? datosEjemplo.subsanacion;
                datosEjemplo.validados = data.validados ?? datosEjemplo.validados;
                mostrarNotificacion('✅ Datos cargados correctamente', 'success');
            } else {
                console.warn('⚠️ API no disponible, usando datos de ejemplo');
                mostrarNotificacion('ℹ️ Usando datos de ejemplo', 'info');
            }
        } catch (error) {
            console.warn('⚠️ Error al conectar con la API:', error.message);
            mostrarNotificacion('ℹ️ Usando datos de ejemplo', 'info');
        }

        // Actualizar interfaz con los datos
        actualizarInterfaz(datosEjemplo);

    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        mostrarNotificacion('❌ Error al cargar datos', 'error');
        
        // Mostrar datos de ejemplo en caso de error
        const datosFallback = {
            pendientes: 5,
            subsanacion: 3,
            validados: 8
        };
        actualizarInterfaz(datosFallback);
    } finally {
        // Restaurar botón
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
    // Agregar estilos de animación si no existen
    if (!document.getElementById('notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(120%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification-toast {
                animation: slideInRight 0.4s ease;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Configurar evento del botón
    const btnActualizar = document.getElementById('btn-actualizar');
    if (btnActualizar) {
        const nuevoBtn = btnActualizar.cloneNode(true);
        btnActualizar.parentNode.replaceChild(nuevoBtn, btnActualizar);
        nuevoBtn.addEventListener('click', cargarDashboard);
    }

    // Cargar datos iniciales
    cargarDashboard();
    
    // Configurar cerrar sesión
    configurarCerrarSesion();
});

// Exportar funciones para uso en otros módulos si es necesario
export { 
    cargarDashboard, 
    actualizarInterfaz, 
    mostrarNotificacion
};
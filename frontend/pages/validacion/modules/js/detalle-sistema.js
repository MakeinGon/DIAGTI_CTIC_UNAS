// detalle-sistema.js

import { obtenerHeaders } from './api-utils.js';
import { configurarCerrarSesion } from "./common.js";

// ============================================================
// 1. ESTADO DE LA APLICACIÓN
// ============================================================

let datosSistema = null;
let sistemaId = null;
let modoEdicion = false;

// ============================================================
// 2. OBTENER ID DEL SISTEMA DESDE LA URL
// ============================================================

function obtenerIdSistema() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id || 1; // Si no hay ID, usar el sistema 1 por defecto
}

// ============================================================
// 3. CARGAR DETALLE DEL SISTEMA
// ============================================================

async function cargarDetalle() {
    const heroTitle = document.getElementById('info-nombre');
    const heroDesc = document.getElementById('sistema-desc');
    
    // Mostrar estado de carga
    if (heroTitle) heroTitle.textContent = 'Cargando...';
    if (heroDesc) heroDesc.textContent = 'Cargando información del sistema...';

    try {
        sistemaId = obtenerIdSistema();
        
        const response = await fetch(`/api/validacion/sistema/${sistemaId}`, {
            headers: obtenerHeaders()
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        datosSistema = data;
        
        // Llenar todos los campos
        actualizarInterfaz(data);
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`✅ Datos del sistema "${data.nombre}" cargados correctamente`, 'success');

    } catch (error) {
        console.error("Error al cargar detalle:", error);
        
        // Datos de ejemplo en caso de error
        const datosEjemplo = generarDatosEjemplo();
        datosSistema = datosEjemplo;
        actualizarInterfaz(datosEjemplo);
        
        mostrarNotificacion('❌ Error al cargar datos. Mostrando datos de ejemplo.', 'error');
    }
}

// ============================================================
// 4. GENERAR DATOS DE EJEMPLO
// ============================================================

function generarDatosEjemplo() {
    return {
        id: 1,
        nombre: 'Sistema Académico UNAS',
        descripcion: 'Sistema de gestión académica para la Universidad Nacional Agraria de la Selva',
        estado: 'Activo',
        ultimaRevision: '2026-07-08',
        nivelRiesgo: 'Medio',
        responsable: 'Ing. Carlos Ruiz',
        version: 'v2.5.1',
        framework: 'Spring Boot 3.2',
        baseDatos: 'PostgreSQL 15',
        servidor: 'Tomcat 10'
    };
}

// ============================================================
// 5. ACTUALIZAR INTERFAZ CON DATOS DEL SISTEMA
// ============================================================

function actualizarInterfaz(data) {
    // Hero
    const heroTitle = document.getElementById('info-nombre');
    const heroDesc = document.getElementById('sistema-desc');
    
    if (heroTitle) heroTitle.textContent = data.nombre || '--';
    if (heroDesc) heroDesc.textContent = data.descripcion || `Información consolidada del sistema ${data.nombre}`;

    // Estadísticas
    const estado = document.getElementById('val-estado');
    const revision = document.getElementById('val-revision');
    const riesgo = document.getElementById('val-riesgo');
    
    if (estado) estado.textContent = data.estado || '--';
    if (revision) revision.textContent = data.ultimaRevision || '--';
    if (riesgo) riesgo.textContent = data.nivelRiesgo || '--';

    // Información General
    const nombre = document.getElementById('info-nombre-txt');
    const responsable = document.getElementById('info-responsable');
    const version = document.getElementById('info-version');
    
    if (nombre) nombre.textContent = data.nombre || '--';
    if (responsable) responsable.textContent = data.responsable || '--';
    if (version) version.textContent = data.version || '--';

    // Datos Técnicos
    const framework = document.getElementById('tech-framework');
    const db = document.getElementById('tech-db');
    const servidor = document.getElementById('tech-servidor');
    
    if (framework) framework.textContent = data.framework || '--';
    if (db) db.textContent = data.baseDatos || '--';
    if (servidor) servidor.textContent = data.servidor || '--';
}

// ============================================================
// 6. FUNCIÓN PARA ABRIR MODAL DE EDICIÓN
// ============================================================

function abrirModalEdicion() {
    if (!datosSistema) {
        mostrarNotificacion('⚠️ No hay datos para editar', 'warning');
        return;
    }

    // Verificar si ya existe el modal
    if (document.getElementById('modal-editar')) {
        document.getElementById('modal-editar').style.display = 'flex';
        return;
    }

    const modalHTML = `
        <div id="modal-editar" class="modal-overlay" style="
            display: flex;
            position: fixed;
            inset: 0;
            background: rgba(15, 60, 90, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 20px;
            backdrop-filter: blur(4px);
        ">
            <div class="modal-content" style="
                background: white;
                border-radius: 16px;
                width: min(600px, 100%);
                max-height: 90vh;
                overflow: auto;
                box-shadow: 0 24px 60px rgba(0,0,0,0.25);
                padding: 0;
            ">
                <!-- Header -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--border);
                ">
                    <h3 style="margin: 0; font-size: 16px;">
                        <i class="fas fa-pen-to-square" style="color: var(--color-verde-ctic);"></i>
                        Editar Ficha del Sistema
                    </h3>
                    <button onclick="cerrarModalEdicion()" style="
                        background: none;
                        border: none;
                        font-size: 22px;
                        cursor: pointer;
                        color: var(--muted);
                        transition: color 0.2s;
                    " onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--muted)'">×</button>
                </div>

                <!-- Body -->
                <div style="padding: 20px 24px;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text);">
                            <i class="fas fa-desktop"></i> Nombre del Sistema <span style="color: #dc2626;">*</span>
                        </label>
                        <input type="text" id="edit-nombre" value="${datosSistema.nombre || ''}" style="
                            width: 100%;
                            padding: 10px 14px;
                            border: 1px solid var(--border);
                            border-radius: 8px;
                            font-size: 13px;
                            font-family: inherit;
                            transition: border-color 0.2s;
                        " onfocus="this.style.borderColor='var(--color-verde-ctic)'" onblur="this.style.borderColor='var(--border)'">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text);">
                            <i class="fas fa-align-left"></i> Descripción
                        </label>
                        <textarea id="edit-descripcion" rows="3" style="
                            width: 100%;
                            padding: 10px 14px;
                            border: 1px solid var(--border);
                            border-radius: 8px;
                            font-size: 13px;
                            font-family: inherit;
                            resize: vertical;
                            transition: border-color 0.2s;
                        " onfocus="this.style.borderColor='var(--color-verde-ctic)'" onblur="this.style.borderColor='var(--border)'">${datosSistema.descripcion || ''}</textarea>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text);">
                                <i class="fas fa-user"></i> Responsable
                            </label>
                            <input type="text" id="edit-responsable" value="${datosSistema.responsable || ''}" style="
                                width: 100%;
                                padding: 10px 14px;
                                border: 1px solid var(--border);
                                border-radius: 8px;
                                font-size: 13px;
                                font-family: inherit;
                                transition: border-color 0.2s;
                            " onfocus="this.style.borderColor='var(--color-verde-ctic)'" onblur="this.style.borderColor='var(--border)'">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text);">
                                <i class="fas fa-tag"></i> Versión
                            </label>
                            <input type="text" id="edit-version" value="${datosSistema.version || ''}" style="
                                width: 100%;
                                padding: 10px 14px;
                                border: 1px solid var(--border);
                                border-radius: 8px;
                                font-size: 13px;
                                font-family: inherit;
                                transition: border-color 0.2s;
                            " onfocus="this.style.borderColor='var(--color-verde-ctic)'" onblur="this.style.borderColor='var(--border)'">
                        </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text);">
                            <i class="fas fa-flag"></i> Estado del Sistema
                        </label>
                        <select id="edit-estado" style="
                            width: 100%;
                            padding: 10px 14px;
                            border: 1px solid var(--border);
                            border-radius: 8px;
                            font-size: 13px;
                            font-family: inherit;
                            background: white;
                            transition: border-color 0.2s;
                        " onfocus="this.style.borderColor='var(--color-verde-ctic)'" onblur="this.style.borderColor='var(--border)'">
                            <option value="Activo" ${datosSistema.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                            <option value="Inactivo" ${datosSistema.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                            <option value="En Mantenimiento" ${datosSistema.estado === 'En Mantenimiento' ? 'selected' : ''}>En Mantenimiento</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                        <div>
                            <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text);">
                                <i class="fas fa-code"></i> Framework
                            </label>
                            <input type="text" id="edit-framework" value="${datosSistema.framework || ''}" style="
                                width: 100%;
                                padding: 10px 14px;
                                border: 1px solid var(--border);
                                border-radius: 8px;
                                font-size: 13px;
                                font-family: inherit;
                                transition: border-color 0.2s;
                            " onfocus="this.style.borderColor='var(--color-verde-ctic)'" onblur="this.style.borderColor='var(--border)'">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px; color: var(--text);">
                                <i class="fas fa-database"></i> Base de Datos
                            </label>
                            <input type="text" id="edit-db" value="${datosSistema.baseDatos || ''}" style="
                                width: 100%;
                                padding: 10px 14px;
                                border: 1px solid var(--border);
                                border-radius: 8px;
                                font-size: 13px;
                                font-family: inherit;
                                transition: border-color 0.2s;
                            " onfocus="this.style.borderColor='var(--color-verde-ctic)'" onblur="this.style.borderColor='var(--border)'">
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 24px;
                    border-top: 1px solid var(--border);
                ">
                    <button onclick="cerrarModalEdicion()" style="
                        padding: 9px 18px;
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        background: transparent;
                        color: var(--text);
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button onclick="guardarEdicion()" style="
                        padding: 9px 24px;
                        border: none;
                        border-radius: 8px;
                        background: var(--color-verde-ctic);
                        color: white;
                        font-weight: 700;
                        font-size: 13px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='var(--color-verde-dark)'" onmouseout="this.style.background='var(--color-verde-ctic)'">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insertar el modal en el DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    // Agregar estilos de animación si no existen
    if (!document.getElementById('modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .modal-content {
                animation: fadeIn 0.3s ease;
            }
            .notification-toast {
                animation: slideInRight 0.4s ease;
            }
            @keyframes slideInRight {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// ============================================================
// 7. GUARDAR EDICIÓN DEL SISTEMA
// ============================================================

async function guardarEdicion() {
    // Obtener valores del formulario
    const nombre = document.getElementById('edit-nombre')?.value?.trim();
    const descripcion = document.getElementById('edit-descripcion')?.value?.trim();
    const responsable = document.getElementById('edit-responsable')?.value?.trim();
    const version = document.getElementById('edit-version')?.value?.trim();
    const estado = document.getElementById('edit-estado')?.value;
    const framework = document.getElementById('edit-framework')?.value?.trim();
    const db = document.getElementById('edit-db')?.value?.trim();

    // Validar campos obligatorios
    if (!nombre) {
        mostrarNotificacion('⚠️ El nombre del sistema es obligatorio', 'warning');
        document.getElementById('edit-nombre')?.focus();
        return;
    }

    // Preparar datos para enviar
    const datosActualizados = {
        ...datosSistema,
        nombre,
        descripcion: descripcion || datosSistema.descripcion,
        responsable: responsable || datosSistema.responsable,
        version: version || datosSistema.version,
        estado: estado || datosSistema.estado,
        framework: framework || datosSistema.framework,
        baseDatos: db || datosSistema.baseDatos
    };

    // Mostrar estado de carga
    const btnGuardar = document.querySelector('#modal-editar .btn-verde');
    const iconoOriginal = btnGuardar?.innerHTML;
    if (btnGuardar) {
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btnGuardar.disabled = true;
    }

    try {
        // Enviar datos a la API
        const response = await fetch(`/api/validacion/sistema/${sistemaId}`, {
            method: 'PUT',
            headers: {
                ...obtenerHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        datosSistema = data;
        
        // Actualizar interfaz
        actualizarInterfaz(data);
        
        // Cerrar modal
        cerrarModalEdicion();
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`✅ Sistema "${data.nombre}" actualizado correctamente`, 'success');

    } catch (error) {
        console.error("Error al guardar cambios:", error);
        
        // Si falla la API, actualizar localmente
        datosSistema = datosActualizados;
        actualizarInterfaz(datosActualizados);
        cerrarModalEdicion();
        
        mostrarNotificacion('⚠️ Cambios guardados localmente. Conecte con el servidor.', 'warning');
        
    } finally {
        // Restaurar botón
        if (btnGuardar) {
            btnGuardar.innerHTML = iconoOriginal;
            btnGuardar.disabled = false;
        }
    }
}

// ============================================================
// 8. FUNCIONES PARA ABRIR/CERRAR MODAL
// ============================================================

function cerrarModalEdicion() {
    const modal = document.getElementById('modal-editar');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('modal-editar');
    if (modal && modal.style.display === 'flex') {
        const content = modal.querySelector('.modal-content');
        if (content && !content.contains(event.target)) {
            cerrarModalEdicion();
        }
    }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarModalEdicion();
    }
});

// ============================================================
// 9. MOSTRAR NOTIFICACIONES
// ============================================================

function mostrarNotificacion(mensaje, tipo = 'success') {
    // Eliminar notificaciones anteriores
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

// ============================================================
// 10. EXPONER FUNCIONES GLOBALMENTE
// ============================================================

window.abrirModalEdicion = abrirModalEdicion;
window.cerrarModalEdicion = cerrarModalEdicion;
window.guardarEdicion = guardarEdicion;

// ============================================================
// 11. INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Configurar el botón de editar
    const btnEditar = document.querySelector('.topbar .btn-verde');
    if (btnEditar) {
        // Reemplazar el botón para evitar event listeners duplicados
        const nuevoBtn = btnEditar.cloneNode(true);
        btnEditar.parentNode.replaceChild(nuevoBtn, btnEditar);
        nuevoBtn.addEventListener('click', abrirModalEdicion);
    }

    // Cargar datos iniciales
    cargarDetalle();
    
    // Configurar cerrar sesión
    configurarCerrarSesion();
});
// registrar-observacion.js

import { obtenerHeaders } from './api-utils.js';
import { configurarCerrarSesion } from "./common.js";

// ============================================================
// 1. REFERENCIAS A ELEMENTOS DEL DOM
// ============================================================

const tituloSistema = document.getElementById('titulo-sistema');
const mensaje = document.getElementById('mensaje-observacion');
const form = document.getElementById('observacion-form');
const inputTitulo = document.getElementById('titulo');
const inputDetalle = document.getElementById('detalle');
const btnEnviar = document.getElementById('btn-enviar');
const areaBadge = document.getElementById('area-badge');
const descripcionArea = document.getElementById('descripcion-area');
const areaInput = document.getElementById('area-observacion');

// Nuevos elementos para personalización dinámica
const tituloPagina = document.getElementById('titulo-pagina');
const descripcionPagina = document.getElementById('descripcion-pagina');
const badgeAreaText = document.getElementById('badge-area-text');
const heroCard = document.querySelector('.hero-card');
const heroPill = document.getElementById('hero-pill');
const heroIcono = document.getElementById('hero-icono');
const btnTexto = document.getElementById('btn-texto');
const btnIcono = document.getElementById('btn-icono');
const iconoTitulo = document.getElementById('icono-titulo');

// ============================================================
// 2. OBTENER ID DEL SISTEMA Y ÁREA DESDE LA URL
// ============================================================

function obtenerIdSistema() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id || 1;
}

function obtenerArea() {
    const urlParams = new URLSearchParams(window.location.search);
    const area = urlParams.get('area');
    return area || 'desarrollo';
}

// ============================================================
// 3. CONFIGURAR ÁREA Y PERSONALIZAR VISTA
// ============================================================

function configurarArea() {
    const area = obtenerArea();
    const areaInfo = {
        'desarrollo': {
            nombre: 'Desarrollo',
            clase: 'desarrollo',
            icono: 'fa-code',
            color: '#0f75bc',
            colorLight: 'rgba(15, 117, 188, 0.1)',
            descripcion: 'Complete el formulario con información clara y detallada para facilitar el análisis por parte del equipo de desarrollo.',
            tituloPagina: 'Registrar Observación - Desarrollo',
            descripcionPagina: 'Registre observaciones, incidencias y recomendaciones para el área de Desarrollo.',
            badgeText: 'OBSERVACIONES - DESARROLLO',
            btnTexto: 'Enviar a Área de Desarrollo',
            btnIcono: 'fa-paper-plane',
            heroIcono: 'fa-code'
        },
        'infraestructura': {
            nombre: 'Infraestructura',
            clase: 'infraestructura',
            icono: 'fa-server',
            color: '#7c3aed',
            colorLight: 'rgba(124, 58, 237, 0.1)',
            descripcion: 'Complete el formulario con información clara y detallada para facilitar el análisis por parte del equipo de infraestructura.',
            tituloPagina: 'Registrar Observación - Infraestructura',
            descripcionPagina: 'Registre observaciones, incidencias y recomendaciones para el área de Infraestructura.',
            badgeText: 'OBSERVACIONES - INFRAESTRUCTURA',
            btnTexto: 'Enviar a Área de Infraestructura',
            btnIcono: 'fa-server',
            heroIcono: 'fa-server'
        }
    };

    const info = areaInfo[area] || areaInfo['desarrollo'];

    // Actualizar título de la página
    if (tituloPagina) {
        tituloPagina.textContent = info.tituloPagina;
    }

    // Actualizar descripción de la página
    if (descripcionPagina) {
        descripcionPagina.textContent = info.descripcionPagina;
    }

    // Actualizar badge del área (hero)
    if (badgeAreaText) {
        badgeAreaText.textContent = info.badgeText;
    }

    // Actualizar badge de área (información)
    if (areaBadge) {
        areaBadge.className = `badge-area ${info.clase}`;
        areaBadge.innerHTML = `<i class="fas ${info.icono}"></i> ${info.nombre}`;
    }

    // Actualizar descripción del área
    if (descripcionArea) {
        descripcionArea.textContent = info.descripcion;
    }

    // Guardar área en campo oculto
    if (areaInput) {
        areaInput.value = area;
    }

    // Cambiar color del hero
    if (heroCard) {
        heroCard.style.borderLeftColor = info.color;
    }

    // Cambiar color y estilo del hero pill
    if (heroPill) {
        heroPill.style.background = `linear-gradient(135deg, ${info.color}, ${info.color}dd)`;
    }

    // Cambiar ícono del hero
    if (heroIcono) {
        heroIcono.className = `fas ${info.heroIcono}`;
    }

    // Cambiar texto del botón
    if (btnTexto) {
        btnTexto.textContent = info.btnTexto;
    }

    // Cambiar ícono del botón
    if (btnIcono) {
        btnIcono.className = `fas ${info.btnIcono}`;
    }

    // Cambiar ícono del título
    if (iconoTitulo) {
        iconoTitulo.className = `fas ${info.heroIcono}`;
        iconoTitulo.style.color = info.color;
    }

    console.log(`✅ Área configurada: ${info.nombre}`);
    return info;
}

// ============================================================
// 4. CARGAR DATOS DEL SISTEMA
// ============================================================

async function cargarSistema() {
    try {
        const sistemaId = obtenerIdSistema();
            const response = await fetch(`/api/validacion/sistema/${sistemaId}`, {
                headers: obtenerHeaders()
            });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const sistema = await response.json();
        
        // Actualizar título con el nombre del sistema
        if (tituloSistema) {
            tituloSistema.textContent = `📋 ${sistema.nombre || 'Sistema sin nombre'}`;
        }
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`✅ Sistema "${sistema.nombre}" cargado correctamente`, 'success');
        
        return sistema;
        
    } catch (error) {
        console.error("Error al cargar el sistema:", error);
        
        // Usar datos de ejemplo
        const sistemaEjemplo = {
            id: obtenerIdSistema(),
            nombre: 'Sistema Académico UNAS'
        };
        
        if (tituloSistema) {
            tituloSistema.textContent = `📋 ${sistemaEjemplo.nombre}`;
        }
        
        mostrarNotificacion('⚠️ Usando datos de ejemplo. Conecte con el servidor.', 'warning');
        return sistemaEjemplo;
    }
}

// ============================================================
// 5. MOSTRAR MENSAJE EN EL FORMULARIO
// ============================================================

function mostrarMensaje(texto, tipo = 'info') {
    if (!mensaje) return;
    
    mensaje.textContent = texto;
    mensaje.className = 'form-message';
    mensaje.style.display = 'block';
    
    if (tipo === 'success') {
        mensaje.classList.add('success');
    } else if (tipo === 'error') {
        mensaje.classList.add('error');
    } else if (tipo === 'loading') {
        mensaje.classList.add('info');
    } else if (tipo === 'warning') {
        mensaje.classList.add('warning');
    }
}

function limpiarMensaje() {
    if (mensaje) {
        mensaje.textContent = '';
        mensaje.className = 'form-message';
        mensaje.style.display = 'none';
    }
}

// ============================================================
// 6. VALIDAR FORMULARIO
// ============================================================

function validarFormulario() {
    const titulo = inputTitulo?.value?.trim();
    const detalle = inputDetalle?.value?.trim();
    let errores = [];

    // Validar título
    if (!titulo) {
        errores.push('El título de la observación es obligatorio');
        if (inputTitulo) {
            inputTitulo.style.borderColor = '#dc2626';
            inputTitulo.classList.add('error');
            inputTitulo.focus();
        }
    } else if (titulo.length < 5) {
        errores.push('El título debe tener al menos 5 caracteres');
        if (inputTitulo) {
            inputTitulo.style.borderColor = '#dc2626';
            inputTitulo.classList.add('error');
            if (!errores.some(e => e.includes('obligatorio'))) {
                inputTitulo.focus();
            }
        }
    } else {
        if (inputTitulo) {
            inputTitulo.style.borderColor = '';
            inputTitulo.classList.remove('error');
        }
    }

    // Validar detalle
    if (!detalle) {
        errores.push('La descripción detallada es obligatoria');
        if (inputDetalle) {
            inputDetalle.style.borderColor = '#dc2626';
            inputDetalle.classList.add('error');
            if (!errores.some(e => e.includes('título'))) {
                inputDetalle.focus();
            }
        }
    } else if (detalle.length < 20) {
        errores.push('La descripción debe tener al menos 20 caracteres');
        if (inputDetalle) {
            inputDetalle.style.borderColor = '#dc2626';
            inputDetalle.classList.add('error');
            if (!errores.some(e => e.includes('título') || e.includes('obligatoria'))) {
                inputDetalle.focus();
            }
        }
    } else {
        if (inputDetalle) {
            inputDetalle.style.borderColor = '';
            inputDetalle.classList.remove('error');
        }
    }

    return errores;
}

// ============================================================
// 7. ENVIAR OBSERVACIÓN
// ============================================================

async function enviarObservacion(event) {
    event.preventDefault();

    // Validar formulario
    const errores = validarFormulario();
    if (errores.length > 0) {
        mostrarMensaje(`❌ ${errores.join('. ')}`, 'error');
        return;
    }

    // Obtener valores
    const titulo = inputTitulo.value.trim();
    const detalle = inputDetalle.value.trim();
    const sistemaNombre = tituloSistema?.textContent?.replace('📋 ', '') || 'Sistema';
    const area = obtenerArea();

    // Preparar payload
    const payload = {
        titulo: titulo,
        descripcion: detalle,
        sistema: sistemaNombre,
        sistemaId: obtenerIdSistema(),
        area: area,
        fechaRegistro: new Date().toISOString(),
        estado: 'Pendiente'
    };

    // Mostrar estado de carga
    mostrarMensaje('⏳ Enviando observación...', 'loading');
    
    if (btnEnviar) {
        btnEnviar.disabled = true;
        const areaNombre = area === 'desarrollo' ? 'Desarrollo' : 'Infraestructura';
        btnEnviar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando a ${areaNombre}...`;
    }

    try {
            const response = await fetch('/api/observaciones', {
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

        const data = await response.json();
        
        // Éxito
        const areaNombre = area === 'desarrollo' ? 'Desarrollo' : 'Infraestructura';
        mostrarMensaje(`✅ Observación de ${areaNombre} registrada correctamente.`, 'success');
        
        // Limpiar formulario
        form.reset();
        if (inputTitulo) {
            inputTitulo.style.borderColor = '';
            inputTitulo.classList.remove('error');
        }
        if (inputDetalle) {
            inputDetalle.style.borderColor = '';
            inputDetalle.classList.remove('error');
        }
        
        // Mostrar notificación flotante
        mostrarNotificacion(`✅ Observación de ${areaNombre} enviada correctamente`, 'success');
        
        // Redirigir después de 2 segundos (volver a la página de validación correspondiente)
        setTimeout(() => {
            if (area === 'desarrollo') {
                window.location.href = `validar-desarrollo.html?id=${payload.sistemaId}`;
            } else {
                window.location.href = `validar-infraestructura.html?id=${payload.sistemaId}`;
            }
        }, 2000);

    } catch (error) {
        console.error("Error al enviar observación:", error);
        
        // Simular éxito en caso de error de red
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            const areaNombre = area === 'desarrollo' ? 'Desarrollo' : 'Infraestructura';
            mostrarMensaje(`⚠️ Sin conexión al servidor. La observación de ${areaNombre} se guardará localmente.`, 'warning');
            
            // Guardar en localStorage como respaldo
            guardarLocalmente(payload);
            
            mostrarNotificacion(`⚠️ Sin conexión. Observación de ${areaNombre} guardada localmente.`, 'warning');
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                if (area === 'desarrollo') {
                    window.location.href = `validar-desarrollo.html?id=${payload.sistemaId}`;
                } else {
                    window.location.href = `validar-infraestructura.html?id=${payload.sistemaId}`;
                }
            }, 2500);
        } else {
            mostrarMensaje(`❌ ${error.message}`, 'error');
            mostrarNotificacion(`❌ ${error.message}`, 'error');
        }
        
    } finally {
        // Restaurar botón
        if (btnEnviar) {
            btnEnviar.disabled = false;
            const area = obtenerArea();
            const btnTextoFinal = area === 'desarrollo' ? 'Enviar a Área de Desarrollo' : 'Enviar a Área de Infraestructura';
            const btnIconoFinal = area === 'desarrollo' ? 'fa-paper-plane' : 'fa-server';
            btnEnviar.innerHTML = `<i class="fas ${btnIconoFinal}"></i> ${btnTextoFinal}`;
        }
    }
}

// ============================================================
// 8. GUARDAR LOCALMENTE (FALLBACK)
// ============================================================

function guardarLocalmente(payload) {
    try {
        const observaciones = JSON.parse(localStorage.getItem('observaciones') || '[]');
        const nuevaObs = {
            ...payload,
            id: Date.now(),
            guardadoLocal: true,
            fechaLocal: new Date().toISOString()
        };
        observaciones.push(nuevaObs);
        localStorage.setItem('observaciones', JSON.stringify(observaciones));
        console.log('📦 Observación guardada en localStorage:', nuevaObs);
    } catch (e) {
        console.error('Error al guardar localmente:', e);
    }
}

// ============================================================
// 9. MOSTRAR NOTIFICACIONES FLOTANTES
// ============================================================

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

// ============================================================
// 10. LIMPIAR ESTILOS DE VALIDACIÓN AL ESCRIBIR
// ============================================================

inputTitulo?.addEventListener('input', function() {
    if (this.value.trim().length >= 5) {
        this.style.borderColor = '';
        this.classList.remove('error');
    }
});

inputDetalle?.addEventListener('input', function() {
    if (this.value.trim().length >= 20) {
        this.style.borderColor = '';
        this.classList.remove('error');
    }
});

// ============================================================
// 11. INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Cargando registrar-observacion.js...');
    
    // Configurar área
    configurarArea();
    
    // Cargar sistema
    cargarSistema();
    
    // Configurar evento del formulario
    if (form) {
        form.addEventListener('submit', enviarObservacion);
    }
    
    // Configurar cerrar sesión
    configurarCerrarSesion();
    
    // Agregar estilos de animación si no existen
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
            .form-message {
                padding: 12px 16px;
                border-radius: 8px;
                margin-top: 16px;
                font-weight: 600;
                display: none;
            }
            .form-message.success {
                display: block;
                background: #dcfce7;
                color: #166534;
                border-left: 4px solid #16a34a;
            }
            .form-message.error {
                display: block;
                background: #fee2e2;
                color: #991b1b;
                border-left: 4px solid #dc2626;
            }
            .form-message.info {
                display: block;
                background: #dbeafe;
                color: #1e40af;
                border-left: 4px solid #3b82f6;
            }
            .form-message.warning {
                display: block;
                background: #fef3c7;
                color: #92400e;
                border-left: 4px solid #ca8a04;
            }
            .badge-area.desarrollo {
                background: #dbeafe;
                color: #0f75bc;
                border: 1px solid #0f75bc33;
            }
            .badge-area.infraestructura {
                background: #ede9fe;
                color: #7c3aed;
                border: 1px solid #7c3aed33;
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    console.log('✅ registrar-observacion.js cargado correctamente');
});

// ============================================================
// 12. EXPORTAR FUNCIONES PARA USO EN OTROS MÓDULOS
// ============================================================

export { enviarObservacion, cargarSistema, validarFormulario, configurarArea, obtenerArea, obtenerIdSistema };
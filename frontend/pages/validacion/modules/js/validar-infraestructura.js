// validar-infraestructura.js

console.log('🚀 Cargando validar-infraestructura.js...');

// ============================================
// 1. OBTENER ID DEL SISTEMA DESDE LA URL
// ============================================

function obtenerIdSistema() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id || 1;
}

// ============================================
// 2. DATOS DE EJEMPLO (SIMULACIÓN DE API)
// ============================================

const sistemasInfraestructuraData = {
    1: {
        id: 1,
        nombre: 'Sistema Académico UNAS',
        responsable: 'Ing. Carlos Ruiz',
        estado: 'Pendiente',
        fechaEnvio: '2026-07-08',
        sistemaOperativo: 'Ubuntu Server 22.04 LTS',
        versionSO: '22.04.3',
        autenticacion: 'LDAP + MFA',
        cifrado: 'AES-256',
        tipoBD: 'PostgreSQL',
        versionBD: '15.2',
        servidor: 'Tomcat 10.1'
    },
    2: {
        id: 2,
        nombre: 'Sistema Financiero',
        responsable: 'Ing. María Gómez',
        estado: 'Pendiente',
        fechaEnvio: '2026-07-07',
        sistemaOperativo: 'Windows Server 2022',
        versionSO: '2022',
        autenticacion: 'Active Directory',
        cifrado: 'SSL/TLS 1.3',
        tipoBD: 'MySQL',
        versionBD: '8.0.33',
        servidor: 'IIS 10'
    },
    3: {
        id: 3,
        nombre: 'Portal Web Institucional',
        responsable: 'Ing. Luis Martínez',
        estado: 'Pendiente',
        fechaEnvio: '2026-07-06',
        sistemaOperativo: 'AlmaLinux 9',
        versionSO: '9.2',
        autenticacion: 'OAuth 2.0',
        cifrado: 'AES-256 + TLS 1.3',
        tipoBD: 'MongoDB',
        versionBD: '6.0.5',
        servidor: 'Node.js 20 + Nginx'
    }
};

function getSistema(id) {
    return sistemasInfraestructuraData[id] || sistemasInfraestructuraData[1];
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
        'Enviado para validación': 'warning',
        'Aprobado': 'success',
        'Observado': 'warning',
        'Rechazado': 'danger'
    };
    return map[estado] || 'info';
}

// ============================================
// 4. CARGAR DATOS DEL SISTEMA DESDE EL BACKEND
// ============================================

async function cargarSistema() {
    const id = obtenerIdSistema();
    
    document.getElementById('titulo-sistema').textContent = '⏳ Cargando...';
    document.getElementById('estado-actual').textContent = 'Cargando...';
    document.getElementById('fecha-envio').textContent = 'Cargando...';
    document.getElementById('responsable').textContent = 'Cargando...';
    
    const infoContainer = document.getElementById('info-infraestructura');
    infoContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando información...</span>
        </div>
    `;

    try {
        const response = await fetch(`/api/validacion/sistema/${id}`, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const validacion = await response.json();
        console.log('✅ Datos de validación (infraestructura):', validacion);

        // ✅ USAR DATOS DE VALIDACIÓN DIRECTAMENTE
        const sistema = {
            idSistema: validacion.idSistema,
            nombre: validacion.nombreSistema || 'Sistema #' + id,
            estadoValidacion: validacion.estadoValidacion || 'Pendiente',
            fechaCreacion: validacion.fechaCreacion,
            observacionGeneral: validacion.observacionGeneral || 'Sin observaciones'
        };

        document.getElementById('titulo-sistema').textContent = `📋 ${sistema.nombre}`;
        document.getElementById('estado-actual').textContent = sistema.estadoValidacion;
        document.getElementById('fecha-envio').textContent = sistema.fechaCreacion ? new Date(sistema.fechaCreacion).toLocaleDateString() : '--';
        document.getElementById('responsable').textContent = validacion.nombreValidador || 'No asignado';

        infoContainer.innerHTML = `
            <div class="info-row">
                <span class="label">ID Sistema</span>
                <span class="value"><strong>${sistema.idSistema}</strong></span>
            </div>
            <div class="info-row">
                <span class="label">Nombre</span>
                <span class="value">${sistema.nombre}</span>
            </div>
            <div class="info-row">
                <span class="label">Estado Actual</span>
                <span class="value"><span class="badge ${getBadgeClassEstado(sistema.estadoValidacion)}">${sistema.estadoValidacion}</span></span>
            </div>
            <div class="info-row">
                <span class="label">Fecha de Creación</span>
                <span class="value">${sistema.fechaCreacion ? new Date(sistema.fechaCreacion).toLocaleString() : '--'}</span>
            </div>
            <div class="info-row">
                <span class="label">Observación General</span>
                <span class="value">${sistema.observacionGeneral}</span>
            </div>
            <div class="info-row">
                <span class="label">Validador Asignado</span>
                <span class="value">${validacion.nombreValidador || 'No asignado'}</span>
            </div>
        `;

        const badgeEstado = document.querySelector('.hero-card .badge');
        if (badgeEstado) {
            const estado = sistema.estadoValidacion;
            badgeEstado.textContent = estado;
            badgeEstado.className = `badge ${getBadgeClassEstado(estado)}`;
            badgeEstado.innerHTML = `<i class="fas fa-server"></i> ${estado}`;
        }

        console.log(`✅ Sistema de infraestructura ${id} cargado correctamente`);

    } catch (error) {
        console.error("❌ Error al cargar sistema de infraestructura:", error);
        
        const sistema = sistemasInfraestructuraData[id] || sistemasInfraestructuraData[1];
        
        document.getElementById('titulo-sistema').textContent = `📋 ${sistema.nombre}`;
        document.getElementById('estado-actual').textContent = sistema.estado || '--';
        document.getElementById('fecha-envio').textContent = sistema.fechaEnvio || '--';
        document.getElementById('responsable').textContent = sistema.responsable || '--';

        infoContainer.innerHTML = `
            <div class="info-row">
                <span class="label">Nombre del Sistema</span>
                <span class="value"><strong>${sistema.nombre || '--'}</strong></span>
            </div>
            <div class="info-row">
                <span class="label">Responsable</span>
                <span class="value">${sistema.responsable || '--'}</span>
            </div>
            <div class="info-row">
                <span class="label">Sistema Operativo</span>
                <span class="value">${sistema.sistemaOperativo || '--'}</span>
            </div>
            <div class="info-row">
                <span class="label">Versión de SO</span>
                <span class="value">${sistema.versionSO || '--'}</span>
            </div>
        `;
        
        mostrarNotificacion('⚠️ Usando datos de ejemplo', 'warning');
    }
}
// ============================================
// 5. FUNCIONES PARA MODAL DE RECHAZO - 🟢 ELIMINADO
// ============================================

// 🔴 Las siguientes funciones han sido eliminadas:
// - abrirModalRechazo()
// - cerrarModalRechazo()  
// - confirmarRechazo()
// - sistemaIdActual (variable)

// ============================================
// 6. EJECUTAR VALIDACIÓN (SOLO APROBAR Y OBSERVAR)
// ============================================

function ejecutarValidacion(estado, comentarioForzado = null) {
    let comentario = comentarioForzado;

    if (!comentario) {
        comentario = document.getElementById('comentario-validacion')?.value?.trim();
    }

    const mensajeDiv = document.getElementById('mensaje-validacion');
    const resumenDiv = document.getElementById('resumen-validacion');
    const botones = document.querySelectorAll('.form-actions .btn');

    // ✅ Validar comentario solo para OBSERVAR
    if (estado === 'observado') {
        if (!comentario || comentario.length < 5) {
            const textarea = document.getElementById('comentario-validacion');
            if (textarea) {
                textarea.classList.add('error');
            }
            mensajeDiv.textContent = '⚠️ El comentario es obligatorio para observar. Debe tener al menos 5 caracteres.';
            mensajeDiv.className = 'form-message warning';
            if (textarea) textarea.focus();
            return;
        }
    }

    const textarea = document.getElementById('comentario-validacion');
    if (textarea) textarea.classList.remove('error');

    // Si es aprobado y no hay comentario, usar uno por defecto
    if (estado === 'aprobado' && !comentario) {
        comentario = '✅ Validación de infraestructura aprobada correctamente.';
    }

    botones.forEach(b => b.disabled = true);

    const id = obtenerIdSistema();
    const sistema = getSistema(id);
    const nombreSistema = sistema.nombre || 'Sistema sin nombre';

    // ✅ Solo dos acciones: Aprobado y Observado
    const acciones = {
        'aprobado': { texto: 'Aprobando', icono: '✅', estadoFinal: 'Aprobado', clase: 'success' },
        'observado': { texto: 'Observando', icono: '⚠️', estadoFinal: 'Observado', clase: 'warning' }
    };

    const accion = acciones[estado];
    mensajeDiv.textContent = `⏳ ${accion.texto} validación de infraestructura...`;
    mensajeDiv.className = 'form-message info';

    setTimeout(() => {
        mensajeDiv.textContent = `✅ Validación de infraestructura ${accion.estadoFinal.toLowerCase()} correctamente`;
        mensajeDiv.className = 'form-message success';

        document.getElementById('resumen-estado').textContent = accion.estadoFinal;
        document.getElementById('resumen-validador').textContent = 'Validador CTIC';
        document.getElementById('resumen-fecha').textContent = new Date().toLocaleString();
        resumenDiv.className = 'resumen-validacion show';

        document.getElementById('estado-actual').textContent = accion.estadoFinal;

        const badgeEstado = document.querySelector('.hero-card .badge');
        if (badgeEstado) {
            badgeEstado.textContent = accion.estadoFinal;
            badgeEstado.className = `badge ${accion.clase}`;
            badgeEstado.innerHTML = `<i class="fas fa-server"></i> ${accion.estadoFinal}`;
        }

        // ✅ Si es observado, redirigir a registrar observación de infraestructura
        if (estado === 'observado') {
            setTimeout(() => {
                mostrarNotificacion('📝 Redirigiendo a registro de observaciones de infraestructura...', 'info');
                setTimeout(() => {
                    window.location.href = `registrar-observacion.html?id=${id}&area=infraestructura`;
                }, 1000);
            }, 500);
        } else {
            // ✅ Si es aprobado, mostrar botón "Finalizar"
            document.getElementById('btn-finalizar-container').style.display = 'block';
            setTimeout(() => {
                botones.forEach(b => b.disabled = false);
                mostrarNotificacion(`✅ Validación de infraestructura aprobada correctamente`, 'success');
            }, 1000);
        }
    }, 1500);
}

// ============================================
// 7. FINALIZAR VALIDACIÓN
// ============================================

function finalizarValidacion() {
    const id = obtenerIdSistema();
    const sistema = getSistema(id);
    
    mostrarNotificacion(`✅ Validación completa del sistema "${sistema.nombre}"`, 'success');
    
    setTimeout(() => {
        window.location.href = 'pendientes.html';
    }, 1500);
}

// ============================================
// 8. MOSTRAR NOTIFICACIONES
// ============================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(el => el.remove());

    const colors = {
        success: { bg: '#dcfce7', border: '#16a34a', text: '#166534', icon: 'fa-check-circle' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: 'fa-exclamation-circle' },
        warning: { bg: '#fef3c7', border: '#ca8a04', text: '#92400e', icon: 'fa-triangle-exclamation' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'fa-info-circle' }
    };

    const style = colors[tipo] || colors.info;

    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: ${style.bg};
        border-left: 4px solid ${style.border};
        border-radius: 10px;
        padding: 14px 20px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: ${style.text};
        font-weight: 600;
        max-width: 400px;
        min-width: 280px;
        animation: slideInRight 0.4s ease;
        transition: all 0.3s ease;
    `;

    notification.innerHTML = `
        <i class="fas ${style.icon}" style="font-size: 18px; color: ${style.border};"></i>
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:${style.text};opacity:0.5;padding:0 4px;">×</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// ============================================
// 9. INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado');
    cargarSistema();

    // ✅ Solo dos eventos: Aprobar y Observar
    document.getElementById('btn-aprobar')?.addEventListener('click', () => ejecutarValidacion('aprobado'));
    document.getElementById('btn-observar')?.addEventListener('click', () => ejecutarValidacion('observado'));

    console.log('✅ Inicialización completa');
});

// ============================================
// 10. EXPONER FUNCIONES GLOBALMENTE
// ============================================

window.obtenerIdSistema = obtenerIdSistema;
window.finalizarValidacion = finalizarValidacion;
// 🔴 Ya no exponemos: abrirModalRechazo, cerrarModalRechazo, confirmarRechazo

console.log('✅ validar-infraestructura.js cargado correctamente (solo Aprobar/Observar)');
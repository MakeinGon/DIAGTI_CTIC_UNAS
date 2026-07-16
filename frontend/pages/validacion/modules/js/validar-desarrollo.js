// validar-desarrollo.js

console.log('🚀 Cargando validar-desarrollo.js...');

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

const sistemasDesarrolloData = {
    1: {
        id: 1,
        codigo: 'SIS-001',
        nombre: 'Sistema Académico UNAS',
        responsable: 'Ing. Carlos Ruiz',
        lenguaje: 'Java',
        version: 'v2.5.1',
        framework: 'Spring Boot 3.2',
        arquitectura: 'Microservicios',
        repositorio: 'https://github.com/unas/sistema-academico',
        tipoAplicacion: 'Web',
        anioDesarrollo: '2026',
        empresa: 'UNAS',
        contrato: 'CT-2026-001',
        bdMotor: 'PostgreSQL 15',
        estado: 'Enviado para validación',
        fechaEnvio: '2026-07-08'
    },
    2: {
        id: 2,
        codigo: 'SIS-002',
        nombre: 'Sistema Financiero',
        responsable: 'Ing. María Gómez',
        lenguaje: 'PHP',
        version: 'v3.0.2',
        framework: 'Laravel 10',
        arquitectura: 'Monolítica',
        repositorio: 'https://github.com/unas/sistema-financiero',
        tipoAplicacion: 'Web',
        anioDesarrollo: '2025',
        empresa: 'UNAS',
        contrato: 'CT-2025-015',
        bdMotor: 'MySQL 8',
        estado: 'Enviado para validación',
        fechaEnvio: '2026-07-07'
    },
    3: {
        id: 3,
        codigo: 'SIS-003',
        nombre: 'Portal Web Institucional',
        responsable: 'Ing. Luis Martínez',
        lenguaje: 'JavaScript',
        version: 'v1.8.0',
        framework: 'React 18',
        arquitectura: 'SPA',
        repositorio: 'https://github.com/unas/portal-web',
        tipoAplicacion: 'Web',
        anioDesarrollo: '2026',
        empresa: 'UNAS',
        contrato: 'CT-2026-003',
        bdMotor: 'MongoDB',
        estado: 'Enviado para validación',
        fechaEnvio: '2026-07-06'
    }
};

const evidenciasDesarrolloData = {
    1: [
        { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
        { nombre: 'Certificado SSL', estado: 'Cargado', clase: 'success' },
        { nombre: 'Documentación de API', estado: 'Pendiente', clase: 'warning' }
    ],
    2: [
        { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
        { nombre: 'Certificado SSL', estado: 'Faltante', clase: 'danger' },
        { nombre: 'Documentación de API', estado: 'Cargado', clase: 'success' }
    ],
    3: [
        { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
        { nombre: 'Certificado SSL', estado: 'Cargado', clase: 'success' },
        { nombre: 'Documentación de API', estado: 'Cargado', clase: 'success' }
    ]
};

function getSistema(id) {
    return sistemasDesarrolloData[id] || sistemasDesarrolloData[1];
}

function getEvidencias(id) {
    return evidenciasDesarrolloData[id] || evidenciasDesarrolloData[1];
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
// 4. CARGAR DATOS DEL SISTEMA
// ============================================

function cargarSistema() {
    const id = obtenerIdSistema();
    const sistema = getSistema(id);
    const evidencias = getEvidencias(id);

    // Actualizar hero
    document.getElementById('titulo-sistema').textContent = `📋 ${sistema.nombre}`;

    // Actualizar estadísticas
    document.getElementById('estado-actual').textContent = sistema.estado || '--';
    document.getElementById('fecha-envio').textContent = sistema.fechaEnvio || '--';
    document.getElementById('responsable').textContent = sistema.responsable || '--';

    // Actualizar información de desarrollo
    const infoContainer = document.getElementById('info-desarrollo');
    infoContainer.innerHTML = `
        <div class="info-row">
            <span class="label">Código del Sistema</span>
            <span class="value"><strong>${sistema.codigo || '--'}</strong></span>
        </div>
        <div class="info-row">
            <span class="label">Nombre</span>
            <span class="value">${sistema.nombre || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Lenguaje</span>
            <span class="value">${sistema.lenguaje || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Versión</span>
            <span class="value">${sistema.version || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Framework</span>
            <span class="value">${sistema.framework || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Arquitectura</span>
            <span class="value">${sistema.arquitectura || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Repositorio</span>
            <span class="value"><a href="${sistema.repositorio || '#'}" target="_blank" style="color: var(--color-azul-ctic);">${sistema.repositorio || '--'}</a></span>
        </div>
        <div class="info-row">
            <span class="label">Tipo de Aplicación</span>
            <span class="value">${sistema.tipoAplicacion || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Año de Desarrollo</span>
            <span class="value">${sistema.anioDesarrollo || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Empresa</span>
            <span class="value">${sistema.empresa || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Contrato</span>
            <span class="value">${sistema.contrato || '--'}</span>
        </div>
        <div class="info-row">
            <span class="label">Motor de BD</span>
            <span class="value">${sistema.bdMotor || '--'}</span>
        </div>
    `;

    // Actualizar evidencias
    const evidenciasContainer = document.getElementById('evidencias-container');
    evidenciasContainer.innerHTML = evidencias.map(ev => `
        <div class="evidencia-item">
            <span class="evidencia-nombre">
                <i class="fas fa-file-${ev.clase === 'success' ? 'pdf' : 'exclamation'}"></i>
                ${ev.nombre}
            </span>
            <span class="badge ${ev.clase}">
                ${ev.estado === 'Cargado' ? '✅' : ev.estado === 'Faltante' ? '❌' : '⏳'} ${ev.estado}
            </span>
        </div>
    `).join('');

    console.log(`✅ Sistema de desarrollo ${id} cargado correctamente`);
}

// ============================================
// 5. FUNCIONES PARA MODAL DE RECHAZO - 🟢 ELIMINADO
// ============================================

// 🔴 Las siguientes funciones han sido eliminadas:
// - abrirModalRechazo()
// - cerrarModalRechazo()  
// - confirmarRechazo()

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
        comentario = '✅ Validación de desarrollo aprobada correctamente.';
    }

    botones.forEach(b => b.disabled = true);

    const id = obtenerIdSistema();
    const sistema = getSistema(id);
    const nombreSistema = sistema.nombre || 'Sistema sin nombre';

    const acciones = {
        'aprobado': { texto: 'Aprobando', icono: '✅', estadoFinal: 'Aprobado', clase: 'success' },
        'observado': { texto: 'Observando', icono: '⚠️', estadoFinal: 'Observado', clase: 'warning' }
    };

    const accion = acciones[estado];
    mensajeDiv.textContent = `⏳ ${accion.texto} validación de desarrollo...`;
    mensajeDiv.className = 'form-message info';

    setTimeout(() => {
        mensajeDiv.textContent = `✅ Validación de desarrollo ${accion.estadoFinal.toLowerCase()} correctamente`;
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
        }

        // ✅ Si es observado, redirigir a registrar observación de desarrollo
        if (estado === 'observado') {
            setTimeout(() => {
                mostrarNotificacion('📝 Redirigiendo a registro de observaciones de desarrollo...', 'info');
                setTimeout(() => {
                    window.location.href = `registrar-observacion.html?id=${id}&area=desarrollo`;
                }, 1000);
            }, 500);
        } else {
            // ✅ Si es aprobado, mostrar botón "Siguiente"
            document.getElementById('btn-siguiente-container').style.display = 'block';
            setTimeout(() => {
                botones.forEach(b => b.disabled = false);
                mostrarNotificacion(`✅ Validación de desarrollo aprobada correctamente`, 'success');
            }, 1000);
        }
    }, 1500);
}

// ============================================
// 7. MOSTRAR NOTIFICACIONES
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
// 8. INICIALIZACIÓN
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
// 9. EXPONER FUNCIONES GLOBALMENTE
// ============================================

window.obtenerIdSistema = obtenerIdSistema;
// 🔴 Ya no exponemos: abrirModalRechazo, cerrarModalRechazo, confirmarRechazo

console.log('✅ validar-desarrollo.js cargado correctamente (solo Aprobar/Observar)');
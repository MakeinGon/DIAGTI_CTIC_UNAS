// validar-informacion.js

console.log('🚀 Cargando validar-informacion.js...');

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

const sistemasData = {
    1: {
        id: 1,
        nombre: 'Sistema Académico UNAS',
        descripcion: 'Sistema de gestión académica para la Universidad Nacional Agraria de la Selva',
        estado: 'Enviado para validación',
        fechaSolicitud: '2026-07-08',
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
        estado: 'Enviado para validación',
        fechaSolicitud: '2026-07-07',
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
        estado: 'Enviado para validación',
        fechaSolicitud: '2026-07-06',
        nivelRiesgo: 'Media',
        responsable: 'Ing. Luis Martínez',
        version: 'v1.8.0',
        area: 'Oficina de Comunicaciones',
        framework: 'React 18',
        baseDatos: 'MongoDB',
        servidor: 'Node.js 20'
    }
};

const evidenciasData = {
    1: [
        { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
        { nombre: 'Informe de Pruebas', estado: 'Faltante', clase: 'danger' },
        { nombre: 'Documentación de API', estado: 'Pendiente', clase: 'warning' }
    ],
    2: [
        { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
        { nombre: 'Informe de Pruebas', estado: 'Cargado', clase: 'success' },
        { nombre: 'Documentación de API', estado: 'Faltante', clase: 'danger' }
    ],
    3: [
        { nombre: 'Manual Técnico', estado: 'Cargado', clase: 'success' },
        { nombre: 'Informe de Pruebas', estado: 'Cargado', clase: 'success' },
        { nombre: 'Documentación de API', estado: 'Cargado', clase: 'success' }
    ]
};

const historialData = {
    1: [
        { fecha: '2026-07-05', estado: 'Observado', comentario: 'Faltan evidencias de pruebas', validador: 'Validador CTIC', clase: 'warning' },
        { fecha: '2026-07-03', estado: 'Aprobado', comentario: 'Documentación completa y correcta', validador: 'Validador CTIC', clase: 'success' },
        { fecha: '2026-07-01', estado: 'Enviado', comentario: 'Sistema enviado para validación', validador: 'Sistema', clase: 'info' }
    ],
    2: [
        { fecha: '2026-07-04', estado: 'Observado', comentario: 'Documentación incompleta', validador: 'Validador CTIC', clase: 'warning' },
        { fecha: '2026-07-02', estado: 'Enviado', comentario: 'Sistema enviado para validación', validador: 'Sistema', clase: 'info' }
    ],
    3: [
        { fecha: '2026-07-06', estado: 'Aprobado', comentario: 'Todo correcto', validador: 'Validador CTIC', clase: 'success' },
        { fecha: '2026-07-01', estado: 'Enviado', comentario: 'Sistema enviado para validación', validador: 'Sistema', clase: 'info' }
    ]
};

function getSistema(id) {
    return sistemasData[id] || sistemasData[1];
}

function getEvidencias(id) {
    return evidenciasData[id] || evidenciasData[1];
}

function getHistorial(id) {
    return historialData[id] || historialData[1];
}

// ============================================
// 3. FUNCIONES AUXILIARES
// ============================================

function getBadgeClass(criticidad) {
    const map = {
        'Crítica': 'danger',
        'Alta': 'warning',
        'Media': 'info',
        'Baja': 'success'
    };
    return map[criticidad] || 'gray';
}

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
// 4. CARGAR DATOS DEL SISTEMA
// ============================================

function cargarSistema() {
    const id = obtenerIdSistema();
    const sistema = getSistema(id);
    const evidencias = getEvidencias(id);
    const historial = getHistorial(id);

    // Actualizar hero
    document.getElementById('titulo-sistema').textContent = `📋 ${sistema.nombre}`;

    // Actualizar estadísticas
    document.getElementById('estado-actual').textContent = sistema.estado || '--';
    document.getElementById('fecha-solicitud').textContent = sistema.fechaSolicitud || '--';

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

    // Actualizar historial
    const historialContainer = document.getElementById('historial-container');
    historialContainer.innerHTML = historial.map(item => `
        <div class="historial-item">
            <span class="fecha">${item.fecha || '--'}</span>
            <span class="badge ${item.clase || 'info'}">${item.estado || '--'}</span>
            <span class="comentario">${item.comentario || '--'}</span>
            <span class="validador">👤 ${item.validador || '--'}</span>
        </div>
    `).join('');

    console.log(`✅ Sistema ${id} cargado correctamente`);
}

// ============================================
// 5. FUNCIONES PARA MODAL DE RECHAZO
// ============================================

let sistemaIdActual = null;

function abrirModalRechazo() {
    sistemaIdActual = obtenerIdSistema();
    document.getElementById('modal-rechazo').style.display = 'flex';
    document.getElementById('motivo-rechazo').value = '';
    document.getElementById('detalle-rechazo').value = '';
    document.body.style.overflow = 'hidden';
}

function cerrarModalRechazo() {
    document.getElementById('modal-rechazo').style.display = 'none';
    document.body.style.overflow = '';
}

function confirmarRechazo() {
    const motivo = document.getElementById('motivo-rechazo').value;
    const detalle = document.getElementById('detalle-rechazo').value.trim();

    if (!motivo) {
        mostrarNotificacion('⚠️ Seleccione un motivo de rechazo', 'warning');
        document.getElementById('motivo-rechazo').focus();
        return;
    }

    if (!detalle || detalle.length < 10) {
        mostrarNotificacion('⚠️ La descripción debe tener al menos 10 caracteres', 'warning');
        document.getElementById('detalle-rechazo').focus();
        return;
    }

    cerrarModalRechazo();

    // Ejecutar el rechazo con la información del modal
    const comentario = `MOTIVO: ${motivo}\nDETALLE: ${detalle}`;
    ejecutarValidacion('rechazado', comentario);
}

// ============================================
// 6. EJECUTAR VALIDACIÓN (COMENTARIO OBLIGATORIO SOLO PARA OBSERVAR Y RECHAZAR)
// ============================================

function ejecutarValidacion(estado, comentarioForzado = null) {
    let comentario = comentarioForzado;
    
    // Si no viene comentario forzado, usar el del textarea
    if (!comentario) {
        comentario = document.getElementById('comentario-validacion')?.value?.trim();
    }

    const mensajeDiv = document.getElementById('mensaje-validacion');
    const resumenDiv = document.getElementById('resumen-validacion');
    const botones = document.querySelectorAll('.form-actions .btn');

    // ====== VALIDAR COMENTARIO (SOLO PARA OBSERVAR Y RECHAZAR) ======
    if (estado === 'observado' || estado === 'rechazado') {
        if (!comentario || comentario.length < 5) {
            const textarea = document.getElementById('comentario-validacion');
            if (textarea) {
                textarea.classList.add('error');
            }
            mensajeDiv.textContent = '⚠️ El comentario es obligatorio para observar o rechazar. Debe tener al menos 5 caracteres.';
            mensajeDiv.className = 'form-message warning';
            if (textarea) textarea.focus();
            return;
        }
    }

    // Limpiar error
    const textarea = document.getElementById('comentario-validacion');
    if (textarea) textarea.classList.remove('error');

    // Si es aprobado y no hay comentario, usar uno por defecto
    if (estado === 'aprobado' && !comentario) {
        comentario = '✅ Sistema aprobado correctamente.';
    }

    botones.forEach(b => b.disabled = true);

    const id = obtenerIdSistema();
    const sistema = getSistema(id);
    const nombreSistema = sistema.nombre || 'Sistema sin nombre';

    const acciones = {
        'aprobado': { texto: 'Aprobando', icono: '✅', estadoFinal: 'Aprobado', clase: 'success' },
        'observado': { texto: 'Observando', icono: '⚠️', estadoFinal: 'Observado', clase: 'warning' },
        'rechazado': { texto: 'Rechazando', icono: '❌', estadoFinal: 'Rechazado', clase: 'danger' }
    };

    const accion = acciones[estado];
    mensajeDiv.textContent = `⏳ ${accion.texto} registro...`;
    mensajeDiv.className = 'form-message info';

    // Simular envío a la API
    setTimeout(() => {
        mensajeDiv.textContent = `✅ Registro ${accion.estadoFinal.toLowerCase()} correctamente`;
        mensajeDiv.className = 'form-message success';

        document.getElementById('resumen-estado').textContent = accion.estadoFinal;
        document.getElementById('resumen-validador').textContent = 'Validador CTIC';
        document.getElementById('resumen-fecha').textContent = new Date().toLocaleString();
        resumenDiv.className = 'resumen-validacion show';

        // Actualizar estado en la tarjeta
        document.getElementById('estado-actual').textContent = accion.estadoFinal;

        // Actualizar badge de estado
        const badgeEstado = document.querySelector('.hero-card .badge');
        if (badgeEstado) {
            badgeEstado.textContent = accion.estadoFinal;
            badgeEstado.className = `badge ${accion.clase}`;
        }

        // ====== SI ES OBSERVADO, REDIRIGIR A REGISTRAR OBSERVACIÓN ======
        if (estado === 'observado') {
            setTimeout(() => {
                mostrarNotificacion('📝 Redirigiendo a registro de observaciones...', 'info');
                setTimeout(() => {
                    window.location.href = `registrar-observacion.html?id=${id}`;
                }, 1000);
            }, 500);
        } else if (estado === 'rechazado') {
            // Si es rechazado, mostrar notificación y volver a pendientes
            setTimeout(() => {
                mostrarNotificacion('❌ Sistema rechazado correctamente', 'error');
                setTimeout(() => {
                    window.location.href = 'pendientes.html';
                }, 1500);
            }, 500);
        } else {
            // Si es aprobado, habilitar botones
            setTimeout(() => {
                botones.forEach(b => b.disabled = false);
                mostrarNotificacion(`✅ Sistema ${accion.estadoFinal.toLowerCase()} correctamente`, 'success');
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

    // Configurar eventos de botones
    document.getElementById('btn-aprobar')?.addEventListener('click', () => ejecutarValidacion('aprobado'));
    document.getElementById('btn-observar')?.addEventListener('click', () => ejecutarValidacion('observado'));
    // El botón rechazar usa onclick en el HTML para abrir el modal

    console.log('✅ Inicialización completa');
});

// Exponer funciones globalmente para el modal
window.abrirModalRechazo = abrirModalRechazo;
window.cerrarModalRechazo = cerrarModalRechazo;
window.confirmarRechazo = confirmarRechazo;
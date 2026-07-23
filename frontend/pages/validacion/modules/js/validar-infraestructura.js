// validar-infraestructura.js — API real (mismo sistema_id oficial)

function obtenerIdSistema() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || urlParams.get('sistemaId');
    return id ? String(id) : null;
}

function getSessionUsername() {
    try {
        const s = JSON.parse(localStorage.getItem('diagti_session') || 'null');
        return s?.username || null;
    } catch (_) {
        return null;
    }
}

function getBadgeClassEstado(estado) {
    const map = {
        Activo: 'success', Inactivo: 'danger', Pendiente: 'warning',
        ENVIADO: 'warning', PENDIENTE: 'warning', VALIDADO: 'success',
        Aprobado: 'success', Observado: 'warning', OBSERVADO: 'warning',
        Rechazado: 'danger', RECHAZADO: 'danger'
    };
    return map[estado] || 'info';
}

function esc(v = '') {
    return String(v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[c]));
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        }
    });
    if (!response.ok) {
        let msg = `Error HTTP ${response.status}`;
        try {
            const err = await response.json();
            msg = err.message || err.error || msg;
        } catch (_) { /* ignore */ }
        throw new Error(msg);
    }
    return response.json();
}

async function cargarSistema() {
    const id = obtenerIdSistema();
    const infoContainer = document.getElementById('info-infraestructura');
    if (!id) {
        document.getElementById('titulo-sistema').textContent = 'Sistema no especificado';
        if (infoContainer) {
            infoContainer.innerHTML = '<div class="info-row"><span class="value">Indique ?id=sistemaId en la URL.</span></div>';
        }
        return;
    }

    document.getElementById('titulo-sistema').textContent = 'Cargando...';
    document.getElementById('estado-actual').textContent = 'Cargando...';
    document.getElementById('fecha-envio').textContent = 'Cargando...';
    document.getElementById('responsable').textContent = 'Cargando...';
    if (infoContainer) {
        infoContainer.innerHTML = '<div class="loading-spinner"><span>Cargando información...</span></div>';
    }

    try {
        const [validacion, infra] = await Promise.all([
            fetchJson(`/api/validacion/sistema/${id}`),
            fetchJson(`/api/infraestructura/sistemas/${id}`)
        ]);

        const datos = infra.evaluacion?.datos || {};
        const nombre = validacion.nombre || validacion.nombreSistema || infra.nombre || `Sistema #${id}`;
        const estado = validacion.estadoValidacion || infra.estadoValidacion || infra.estadoSistemaUi || 'Pendiente';

        document.getElementById('titulo-sistema').textContent = nombre;
        document.getElementById('estado-actual').textContent = estado;
        document.getElementById('fecha-envio').textContent = infra.fechaActualizacion
            ? new Date(infra.fechaActualizacion).toLocaleDateString()
            : (validacion.fechaCreacion ? new Date(validacion.fechaCreacion).toLocaleDateString() : '—');
        document.getElementById('responsable').textContent = infra.responsableTecnico || validacion.responsableTecnico || '—';

        const obsInfra = (infra.observaciones || []).filter(o => {
            const area = (o.area || '').toUpperCase();
            return area.includes('INFRA') || (o.descripcion || '').includes('[INFRAESTRUCTURA]');
        });
        const obsHtml = obsInfra.length
            ? `<ul>${obsInfra.map(o => `<li><strong>${esc(o.estadoObservacion || o.estado)}</strong> — ${esc(o.descripcion)}</li>`).join('')}</ul>`
            : '<p>Sin observaciones de infraestructura.</p>';

        infoContainer.innerHTML = `
            <div class="info-row"><span class="label">ID Sistema</span><span class="value"><strong>${esc(infra.sistemaId)}</strong></span></div>
            <div class="info-row"><span class="label">Código</span><span class="value">${esc(infra.codigo)}</span></div>
            <div class="info-row"><span class="label">Nombre</span><span class="value">${esc(nombre)}</span></div>
            <div class="info-row"><span class="label">Estado sistema</span><span class="value"><span class="badge ${getBadgeClassEstado(infra.estadoSistemaUi)}">${esc(infra.estadoSistemaUi)}</span></span></div>
            <div class="info-row"><span class="label">Estado validación</span><span class="value"><span class="badge ${getBadgeClassEstado(estado)}">${esc(estado)}</span></span></div>
            <div class="info-row"><span class="label">Eval. infraestructura</span><span class="value">${esc(infra.evaluacion?.estadoRegistro || 'SIN_REGISTRO')}</span></div>
            <div class="info-row"><span class="label">Sistema operativo</span><span class="value">${esc(datos.sistemaOperativo || '—')} ${esc(datos.versionSO || '')}</span></div>
            <div class="info-row"><span class="label">Servidor / Ambiente</span><span class="value">${esc(datos.servidor || '—')} / ${esc(datos.ambiente || '—')}</span></div>
            <div class="info-row"><span class="label">Backup</span><span class="value">${esc(datos.backup || '—')} (${esc(datos.frecuenciaBackup || '—')})</span></div>
            <div class="info-row"><span class="label">Exposición</span><span class="value">${esc(datos.exposicion || '—')}</span></div>
            <div class="info-row"><span class="label">Autenticación</span><span class="value">${esc(infra.seguridad?.mecanismoAutenticacion || datos.autenticacion || '—')}</span></div>
            <div class="info-row"><span class="label">SSL/TLS</span><span class="value">${esc(datos.ssl || infra.seguridad?.tipoControl || '—')}</span></div>
            <div class="info-row"><span class="label">Observaciones INFRA</span><span class="value">${obsHtml}</span></div>
        `;

        const badgeEstado = document.querySelector('.hero-card .badge');
        if (badgeEstado) {
            badgeEstado.className = `badge ${getBadgeClassEstado(estado)}`;
            badgeEstado.innerHTML = `<i class="fas fa-server"></i> ${esc(estado)}`;
        }
    } catch (error) {
        console.error('Error al cargar sistema de infraestructura:', error);
        document.getElementById('titulo-sistema').textContent = 'Error al cargar';
        if (infoContainer) {
            infoContainer.innerHTML = `<div class="info-row"><span class="value">${esc(error.message)}</span></div>`;
        }
        mostrarNotificacion(error.message || 'Error al cargar datos', 'error');
    }
}

async function ejecutarValidacion(estado, comentarioForzado = null) {
    let comentario = comentarioForzado;
    if (!comentario) {
        comentario = document.getElementById('comentario-validacion')?.value?.trim();
    }
    const mensajeDiv = document.getElementById('mensaje-validacion');
    const resumenDiv = document.getElementById('resumen-validacion');
    const botones = document.querySelectorAll('.form-actions .btn');
    const id = obtenerIdSistema();
    const username = getSessionUsername();

    if (!id) {
        mensajeDiv.textContent = 'Falta id de sistema en la URL.';
        mensajeDiv.className = 'form-message warning';
        return;
    }

    if (estado === 'observado' && (!comentario || comentario.length < 5)) {
        document.getElementById('comentario-validacion')?.classList.add('error');
        mensajeDiv.textContent = 'El comentario es obligatorio para observar (mín. 5 caracteres).';
        mensajeDiv.className = 'form-message warning';
        return;
    }

    document.getElementById('comentario-validacion')?.classList.remove('error');
    if (estado === 'aprobado' && !comentario) {
        comentario = 'Validación de infraestructura aprobada.';
    }

    botones.forEach(b => b.disabled = true);
    mensajeDiv.textContent = estado === 'aprobado' ? 'Aprobando validación...' : 'Registrando observación...';
    mensajeDiv.className = 'form-message info';

    try {
        if (estado === 'aprobado') {
            await fetchJson('/api/validacion/validar', {
                method: 'POST',
                body: JSON.stringify({
                    idSistema: Number(id),
                    sistemaId: Number(id),
                    username,
                    observacionGeneral: comentario
                })
            });
            mensajeDiv.textContent = 'Validación aprobada correctamente';
            mensajeDiv.className = 'form-message success';
            document.getElementById('resumen-estado').textContent = 'Validado';
            document.getElementById('resumen-validador').textContent = username || 'Validador CTIC';
            document.getElementById('resumen-fecha').textContent = new Date().toLocaleString();
            resumenDiv.className = 'resumen-validacion show';
            document.getElementById('estado-actual').textContent = 'Validado';
            document.getElementById('btn-finalizar-container').style.display = 'block';
            mostrarNotificacion('Validación de infraestructura aprobada', 'success');
        } else {
            await fetchJson('/api/validacion/observaciones', {
                method: 'POST',
                body: JSON.stringify({
                    idSistema: Number(id),
                    sistemaId: Number(id),
                    username,
                    area: 'INFRAESTRUCTURA',
                    descripcion: comentario
                })
            });
            mensajeDiv.textContent = 'Observación de infraestructura registrada';
            mensajeDiv.className = 'form-message success';
            mostrarNotificacion('Redirigiendo a registro de observaciones...', 'info');
            setTimeout(() => {
                window.location.href = `registrar-observacion.html?id=${id}&area=infraestructura`;
            }, 800);
            return;
        }
    } catch (err) {
        mensajeDiv.textContent = err.message;
        mensajeDiv.className = 'form-message warning';
        mostrarNotificacion(err.message, 'error');
    } finally {
        botones.forEach(b => b.disabled = false);
    }
}

function finalizarValidacion() {
    mostrarNotificacion('Validación finalizada', 'success');
    setTimeout(() => { window.location.href = 'pendientes.html'; }, 1000);
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    document.querySelectorAll('.toast-notification').forEach(el => el.remove());
    const colors = {
        success: { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
        warning: { bg: '#fef3c7', border: '#ca8a04', text: '#92400e' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
    };
    const style = colors[tipo] || colors.info;
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;background:${style.bg};border-left:4px solid ${style.border};border-radius:10px;padding:14px 20px;box-shadow:0 8px 30px rgba(0,0,0,.15);color:${style.text};font-weight:600;max-width:400px;`;
    notification.textContent = mensaje;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSistema();
    document.getElementById('btn-aprobar')?.addEventListener('click', () => ejecutarValidacion('aprobado'));
    document.getElementById('btn-observar')?.addEventListener('click', () => ejecutarValidacion('observado'));
});

window.obtenerIdSistema = obtenerIdSistema;
window.finalizarValidacion = finalizarValidacion;

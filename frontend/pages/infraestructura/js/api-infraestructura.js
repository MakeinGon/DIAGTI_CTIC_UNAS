/* ==========================================================================
   DIAGTI · API Infraestructura — puente al backend oficial
   ========================================================================== */

const DIAGTI_INFRA_API = {
    dashboard: '/api/infraestructura/dashboard',
    sistemas: '/api/infraestructura/sistemas',
    historial: '/api/infraestructura/historial',
    observacionesBase: '/api/infraestructura'
};

function diagtiInfraGetSession() {
    try {
        const raw = localStorage.getItem('diagti_session');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function diagtiInfraRequireUsername() {
    const session = diagtiInfraGetSession();
    if (!session || !session.username) {
        window.location.href = '../../login/html/login.html';
        return null;
    }
    return session.username;
}

function diagtiInfraNombreSesion() {
    const session = diagtiInfraGetSession();
    return (session && session.nombreCompleto) ? session.nombreCompleto : 'Infraestructura';
}

function diagtiInfraIniciales() {
    const nombre = diagtiInfraNombreSesion();
    return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'IN';
}

function diagtiInfraApplyUserCard() {
    const nameEl = document.querySelector('.user-card strong');
    const avatar = document.querySelector('.user-card .avatar');
    if (nameEl) nameEl.textContent = diagtiInfraNombreSesion().toUpperCase();
    if (avatar) avatar.textContent = diagtiInfraIniciales();
}

async function diagtiInfraFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        }
    });
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('diagti_session');
        window.location.href = '../../login/html/login.html';
        throw new Error('Sesión no autorizada');
    }
    if (!response.ok) {
        let msg = `Error ${response.status}`;
        try {
            const err = await response.json();
            msg = err.message || err.error || msg;
        } catch (_) {
            try {
                const text = await response.text();
                if (text) msg = text;
            } catch (__) { /* ignore */ }
        }
        throw new Error(msg);
    }
    if (response.status === 204) return null;
    return response.json();
}

async function diagtiInfraDashboard() {
    return diagtiInfraFetch(DIAGTI_INFRA_API.dashboard);
}

async function diagtiInfraListarSistemas(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '') qs.set(k, v);
    });
    const suffix = qs.toString() ? `?${qs}` : '';
    const data = await diagtiInfraFetch(`${DIAGTI_INFRA_API.sistemas}${suffix}`);
    return Array.isArray(data) ? data : [];
}

async function diagtiInfraDetalle(sistemaId) {
    return diagtiInfraFetch(`${DIAGTI_INFRA_API.sistemas}/${sistemaId}`);
}

async function diagtiInfraGuardarEvaluacion(sistemaId, payload) {
    const username = diagtiInfraRequireUsername();
    if (!username) return null;
    const body = { ...payload, username };
    return diagtiInfraFetch(`${DIAGTI_INFRA_API.sistemas}/${sistemaId}/evaluacion`, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

async function diagtiInfraObservaciones(sistemaId, estado) {
    const qs = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    const data = await diagtiInfraFetch(`${DIAGTI_INFRA_API.sistemas}/${sistemaId}/observaciones${qs}`);
    return Array.isArray(data) ? data : [];
}

async function diagtiInfraRegistrarObservacion(sistemaId, body) {
    const username = diagtiInfraRequireUsername();
    if (!username) return null;
    return diagtiInfraFetch(`${DIAGTI_INFRA_API.sistemas}/${sistemaId}/observaciones`, {
        method: 'POST',
        body: JSON.stringify({ ...body, username, area: 'INFRAESTRUCTURA' })
    });
}

async function diagtiInfraAprobarSubsanacion(idObservacion) {
    const username = diagtiInfraRequireUsername();
    if (!username) return null;
    return diagtiInfraFetch(
        `${DIAGTI_INFRA_API.observacionesBase}/observaciones/${idObservacion}/aprobar-subsanacion?username=${encodeURIComponent(username)}`,
        { method: 'POST' }
    );
}

async function diagtiInfraRechazarSubsanacion(idObservacion, comentario) {
    const username = diagtiInfraRequireUsername();
    if (!username) return null;
    return diagtiInfraFetch(
        `${DIAGTI_INFRA_API.observacionesBase}/observaciones/${idObservacion}/rechazar-subsanacion?username=${encodeURIComponent(username)}`,
        { method: 'POST', body: JSON.stringify({ comentario: comentario || '' }) }
    );
}

async function diagtiInfraHistorial(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '') qs.set(k, v);
    });
    const suffix = qs.toString() ? `?${qs}` : '';
    const data = await diagtiInfraFetch(`${DIAGTI_INFRA_API.historial}${suffix}`);
    return Array.isArray(data) ? data : [];
}

document.addEventListener('DOMContentLoaded', () => {
    diagtiInfraRequireUsername();
    diagtiInfraApplyUserCard();
});

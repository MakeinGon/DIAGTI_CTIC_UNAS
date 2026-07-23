/* ==========================================================================
   DIAGTI · API Desarrollo — puente mínimo al backend oficial
   ========================================================================== */

const DIAGTI_DESARROLLO_API = {
    inventario: '/api/desarrollador/inventario',
    misSistemas: '/api/desarrollador/mis-sistemas',
    dashboardSistemas: '/api/desarrollador/dashboard/sistemas',
    observacionesConteo: '/api/desarrollador/observaciones/conteo'
};

function diagtiGetSession() {
    try {
        const raw = localStorage.getItem('diagti_session');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function diagtiRequireUsername() {
    const session = diagtiGetSession();
    if (!session || !session.username) {
        window.location.href = '../../../login/html/login.html';
        return null;
    }
    if (session.rol && String(session.rol).toLowerCase() !== 'desarrollo'
        && String(session.rol).toLowerCase() !== 'admin') {
        console.warn('Rol de sesión no es desarrollo:', session.rol);
    }
    return session.username;
}

function diagtiNombreSesion() {
    const session = diagtiGetSession();
    return (session && session.nombreCompleto) ? session.nombreCompleto : 'Desarrollador';
}

async function diagtiFetchSistemas(extraParams = {}) {
    const username = diagtiRequireUsername();
    if (!username) return [];

    const params = new URLSearchParams({ username, ...extraParams });
    const response = await fetch(`${DIAGTI_DESARROLLO_API.inventario}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('diagti_session');
        window.location.href = '../../../login/html/login.html';
        return [];
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status} al cargar sistemas`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

async function diagtiEnviarValidacion(idSistema) {
    const username = diagtiRequireUsername();
    if (!username) return null;
    const response = await fetch(
        `${DIAGTI_DESARROLLO_API.inventario}/${idSistema}/enviar-validacion?username=${encodeURIComponent(username)}`,
        { method: 'POST', headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) {
        let msg = `Error ${response.status}`;
        try {
            const err = await response.json();
            msg = err.message || msg;
        } catch (_) { /* ignore */ }
        throw new Error(msg);
    }
    return response.json();
}

async function diagtiSubsanarSistema(idSistema, respuesta) {
    const username = diagtiRequireUsername();
    if (!username) return null;
    const response = await fetch(
        `${DIAGTI_DESARROLLO_API.inventario}/${idSistema}/subsanar?username=${encodeURIComponent(username)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ respuesta: respuesta || 'Corrección aplicada desde módulo desarrollo' })
        }
    );
    if (!response.ok) {
        let msg = `Error ${response.status}`;
        try {
            const err = await response.json();
            msg = err.message || msg;
        } catch (_) { /* ignore */ }
        throw new Error(msg);
    }
    return response.json();
}

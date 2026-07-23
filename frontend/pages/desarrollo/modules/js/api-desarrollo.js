/* ==========================================================================
   DIAGTI · API Desarrollo — puente al backend oficial (tabla sistemas)
   ========================================================================== */

const DIAGTI_DESARROLLO_API = {
    inventario: '/api/desarrollador/inventario',
    misSistemas: '/api/desarrollador/mis-sistemas',
    dashboardSistemas: '/api/desarrollador/dashboard/sistemas',
    observacionesConteo: '/api/desarrollador/observaciones/conteo',
    catalogos: '/api/admin/catalogos'
};

/**
 * Fuente principal de autenticación del módulo Desarrollo:
 * localStorage.diagti_session (no window.location.search).
 */
function obtenerSesionDesarrollo() {
    try {
        const raw = localStorage.getItem('diagti_session');
        if (!raw) {
            return null;
        }

        const session = JSON.parse(raw);

        if (!session.username || String(session.rol).toLowerCase() !== 'desarrollo') {
            return null;
        }

        return session;
    } catch (error) {
        console.error('No se pudo leer la sesión de Desarrollo');
        return null;
    }
}

/** Alias de compatibilidad */
function obtenerSesion() {
    return obtenerSesionDesarrollo();
}

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
    const session = obtenerSesionDesarrollo();
    if (!session) {
        window.location.href = '/pages/login/html/login.html';
        return null;
    }
    return session.username;
}

function diagtiNombreSesion() {
    const session = diagtiGetSession();
    return (session && session.nombreCompleto) ? session.nombreCompleto : 'Desarrollador';
}

async function leerRespuesta(response) {
    try {
        return await response.json();
    } catch (_) {
        return {};
    }
}

/**
 * Lista inventario del desarrollador. username es obligatorio.
 * Nunca llama a /api/desarrollador/inventario sin query param.
 */
async function obtenerInventario(username, extraParams = {}) {
    if (!username || !String(username).trim()) {
        throw new Error('No se encontró el usuario autenticado');
    }

    const params = new URLSearchParams({
        username: String(username).trim(),
        ...Object.fromEntries(
            Object.entries(extraParams || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
        )
    });

    const response = await fetch(
        `${DIAGTI_DESARROLLO_API.inventario}?${params.toString()}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
    );

    const data = await leerRespuesta(response);

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('diagti_session');
        window.location.href = '/pages/login/html/login.html';
        return [];
    }

    if (!response.ok) {
        throw new Error(data.message || 'Error al cargar los sistemas');
    }

    return Array.isArray(data) ? data : [];
}

/** Compatibilidad con páginas que aún llaman diagtiFetchSistemas() */
async function diagtiFetchSistemas(extraParams = {}) {
    const session = obtenerSesionDesarrollo();
    if (!session) {
        window.location.href = '/pages/login/html/login.html';
        return [];
    }
    return obtenerInventario(session.username, extraParams);
}

async function diagtiObtenerSistema(idSistema) {
    const session = obtenerSesionDesarrollo();
    if (!session) {
        window.location.href = '/pages/login/html/login.html';
        return null;
    }
    const params = new URLSearchParams({ username: String(session.username).trim() });
    const response = await fetch(
        `${DIAGTI_DESARROLLO_API.inventario}/${encodeURIComponent(idSistema)}?${params.toString()}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
    );
    const body = await leerRespuesta(response);
    if (!response.ok) {
        throw new Error((body && body.message) ? body.message : `Error ${response.status} al obtener detalle`);
    }
    return body;
}

async function diagtiRegistrarSistema(payload) {
    const session = obtenerSesionDesarrollo();
    if (!session) {
        window.location.href = '/pages/login/html/login.html';
        return null;
    }

    const params = new URLSearchParams({ username: String(session.username).trim() });
    const response = await fetch(`${DIAGTI_DESARROLLO_API.inventario}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const body = await leerRespuesta(response);

    if (!response.ok) {
        const error = new Error((body && body.message) ? body.message : `Error ${response.status} al registrar`);
        error.status = response.status;
        throw error;
    }

    return body;
}

async function diagtiFetchCatalogo(tipo) {
    const response = await fetch(`${DIAGTI_DESARROLLO_API.catalogos}/${encodeURIComponent(tipo)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
        throw new Error(`No se pudieron cargar catálogos ${tipo}`);
    }
    const data = await leerRespuesta(response);
    return Array.isArray(data)
        ? data.filter(c => !c.estado || String(c.estado).toLowerCase() === 'activo')
        : [];
}

async function diagtiEnviarValidacion(idSistema) {
    const username = diagtiRequireUsername();
    if (!username) return null;
    const params = new URLSearchParams({ username: String(username).trim() });
    const response = await fetch(
        `${DIAGTI_DESARROLLO_API.inventario}/${idSistema}/enviar-validacion?${params.toString()}`,
        { method: 'POST', headers: { Accept: 'application/json' } }
    );
    const data = await leerRespuesta(response);
    if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
    }
    return data;
}

async function diagtiSubsanarSistema(idSistema, respuesta) {
    const username = diagtiRequireUsername();
    if (!username) return null;
    const params = new URLSearchParams({ username: String(username).trim() });
    const response = await fetch(
        `${DIAGTI_DESARROLLO_API.inventario}/${idSistema}/subsanar?${params.toString()}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ respuesta: respuesta || 'Corrección aplicada desde módulo desarrollo' })
        }
    );
    const data = await leerRespuesta(response);
    if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
    }
    return data;
}

const ApiDesarrollo = {
    obtenerInventario,
    obtenerSistema: diagtiObtenerSistema,
    registrarSistema: diagtiRegistrarSistema,
    fetchCatalogo: diagtiFetchCatalogo,
    enviarValidacion: diagtiEnviarValidacion,
    subsanarSistema: diagtiSubsanarSistema,
    obtenerSesion: obtenerSesionDesarrollo
};

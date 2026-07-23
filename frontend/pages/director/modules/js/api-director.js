/* ==========================================================================
   DIAGTI · API Director — rutas relativas vía Nginx
   ========================================================================== */

const DIAGTI_DIRECTOR_API = {
    dashboard: '/api/director/dashboard',
    riesgos: '/api/director/riesgos',
    reportes: '/api/director/reportes',
    inventario: '/api/director/inventario'
};

function diagtiDirectorGetSession() {
    try {
        const raw = localStorage.getItem('diagti_session');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function diagtiDirectorNombreSesion() {
    const session = diagtiDirectorGetSession();
    return (session && session.nombreCompleto) ? session.nombreCompleto : 'Directivo CTIC';
}

function diagtiDirectorIniciales() {
    const nombre = diagtiDirectorNombreSesion();
    return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'DC';
}

async function diagtiDirectorFetchJson(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json', ...(options.headers || {}) },
            credentials: 'same-origin',
            signal: controller.signal,
            ...options
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

function diagtiDirectorAplicarPerfil() {
    const nombre = diagtiDirectorNombreSesion();
    const iniciales = diagtiDirectorIniciales();
    document.querySelectorAll('.profile-name, .user-name, #profile-name').forEach((el) => {
        el.textContent = nombre;
    });
    document.querySelectorAll('.profile-avatar, .user-avatar, #profile-avatar').forEach((el) => {
        el.textContent = iniciales;
    });
}

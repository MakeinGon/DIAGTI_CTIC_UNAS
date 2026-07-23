// ============================================================
// DIAGTI · CTIC UNAS — Configuración Global
// ============================================================

// ============================================================
// CONFIGURACIÓN DEL BACKEND
// ============================================================

const CONFIG = {
    // URL base para desarrollo (Spring Boot en puerto 8080)
    API_URL: '/api/desarrollador',
    
    // Tiempo de espera para las peticiones (milisegundos)
    TIMEOUT: 30000,
    
    // Número máximo de reintentos
    MAX_RETRIES: 3,
    
    // Headers por defecto
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json'
    }
};

// ============================================================
// DETECCIÓN DE ENTORNO (Producción vs Desarrollo)
// ============================================================

// Si estamos en producción (servidor de la UNAS), cambiar la URL
if (window.location.hostname === 'diagti.unas.edu.pe' || 
    window.location.hostname === 'localhost' && window.location.port === '443') {
    CONFIG.API_URL = 'https://api.diagti.unas.edu.pe/api/desarrollador';
} else if (window.location.hostname === 'localhost' && window.location.port === '8080') {
    // Si el frontend está sirviendo desde el mismo puerto que el backend
    CONFIG.API_URL = '/api/desarrollador';
}

// ============================================================
// FUNCIÓN GENÉRICA PARA CONSUMIR LA API
// ============================================================

async function consumirAPI(endpoint, method = 'GET', body = null, isFormData = false) {
    try {
        const url = `${CONFIG.API_URL}${endpoint}`;
        const options = {
            method: method,
            headers: {}
        };
        const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
        options.headers['X-Usuario'] = session.username || session.nombreCompleto || 'usuario-desarrollo';

        // Configurar headers según el tipo de contenido
        if (isFormData) {
            // Para FormData, no establecer Content-Type (el navegador lo hace automáticamente)
            options.body = body;
        } else {
            options.headers['Content-Type'] = 'application/json';
            if (body) {
                options.body = JSON.stringify(body);
            }
        }

        // Agregar token de autenticación si existe
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        // Agregar timeout a la petición
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        options.signal = controller.signal;

        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `Error HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // Si no se puede parsear JSON, usar el texto
                const text = await response.text();
                if (text) errorMessage = text;
            }
            throw new Error(errorMessage);
        }

        // Si la respuesta está vacía, retornar null
        const contentLength = response.headers.get('content-length');
        if (contentLength && contentLength === '0') {
            return null;
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('⏰ Tiempo de espera agotado:', error);
            throw new Error('La petición ha excedido el tiempo de espera. Por favor, intenta nuevamente.');
        }
        console.error('❌ Error al conectar con la API:', error);
        throw error;
    }
}

// ============================================================
// FUNCIONES HELPER ESPECÍFICAS
// ============================================================

/**
 * Obtiene el usuario actual desde el localStorage o sessionStorage
 */
function obtenerUsuarioActual() {
    const session = JSON.parse(localStorage.getItem('diagti_session') || '{}');
    return session.username || session.nombreCompleto ||
           localStorage.getItem('usuario') || sessionStorage.getItem('usuario') ||
           'usuario-desarrollo';
}

/**
 * Verifica si el usuario está autenticado
 */
function estaAutenticado() {
    return !!localStorage.getItem('token') || !!sessionStorage.getItem('token');
}

/**
 * Cierra sesión eliminando tokens y datos del usuario
 */
function cerrarSesionGlobal() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '../../../login/html/login.html';
}

// ============================================================
// EXPORTACIÓN (para módulos ES6)
// ============================================================

// Si estás usando módulos ES6, descomenta esta línea:
// export { CONFIG, consumirAPI, obtenerUsuarioActual, estaAutenticado, cerrarSesionGlobal };

// ============================================================
// INICIALIZACIÓN
// ============================================================

console.log('🚀 DIAGTI - Configuración cargada');
console.log(`📡 API_URL: ${CONFIG.API_URL}`);
console.log(`⏱️  TIMEOUT: ${CONFIG.TIMEOUT}ms`);
console.log(`🔄 MAX_RETRIES: ${CONFIG.MAX_RETRIES}`);

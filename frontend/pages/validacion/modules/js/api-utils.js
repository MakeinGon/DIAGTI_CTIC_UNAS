// Funciones globales compartidas
export function obtenerHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

// ✅ Función para obtener la URL base de la API
export function getApiUrl(endpoint) {
    return `/api/validacion/${endpoint}`;
}
// Funciones globales compartidas
export function obtenerHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}
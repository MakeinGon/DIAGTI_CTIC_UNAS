import { obtenerHeaders } from './api-utils.js';

async function cargarDashboard() {
    try {
        const response = await fetch('http://localhost:8080/api/dashboard/stats', {
            headers: obtenerHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            // Actualizamos los campos por ID
            document.getElementById('stats-pendientes').textContent = data.pendientes;
            document.getElementById('stats-subsanacion').textContent = data.subsanacion;
            document.getElementById('stats-dictamenes').textContent = data.dictamenes;
            document.getElementById('stats-tiempo').textContent = data.tiempoPromedio;
            
            document.getElementById('ind-validar').textContent = `${data.pendientes} sistemas`;
        }
    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
    }
}

document.getElementById('btn-actualizar').addEventListener('click', cargarDashboard);
cargarDashboard();
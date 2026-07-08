import { obtenerHeaders } from './api-utils.js';

async function cargarHistorial() {
    const tbody = document.getElementById('historial-body');
    
    try {
        const response = await fetch('http://localhost:8080/api/historial', {
            headers: obtenerHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            
            tbody.innerHTML = data.map(item => `
                <tr>
                    <td><strong>${item.sistema}</strong></td>
                    <td>${item.fecha}</td>
                    <td><span class="status-pill ${item.claseEstado}">${item.accion}</span></td>
                    <td>${item.observaciones}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Error al cargar historial:", error);
        tbody.innerHTML = '<tr><td colspan="4">Error al cargar el historial.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', cargarHistorial);
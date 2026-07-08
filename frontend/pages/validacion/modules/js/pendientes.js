import { obtenerHeaders } from './api-utils.js';

async function cargarPendientes() {
    const tbody = document.getElementById('pendientes-body');
    
    try {
        const response = await fetch('http://localhost:8080/api/pendientes', {
            headers: obtenerHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            
            tbody.innerHTML = data.map(item => `
                <tr>
                    <td><strong>${item.nombre}</strong></td>
                    <td>${item.area}</td>
                    <td><span class="status-pill ${item.claseCriticidad}">${item.criticidad}</span></td>
                    <td>${item.fecha}</td>
                    <td><a class="link-action" href="detalle-sistema.html?id=${item.id}">→ Revisar</a></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Error al cargar pendientes:", error);
        tbody.innerHTML = '<tr><td colspan="5">No se pudo cargar la información.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', cargarPendientes);
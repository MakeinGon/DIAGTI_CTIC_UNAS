import { obtenerHeaders } from './api-utils.js';

async function cargarDetalle() {
    try {
        // Asumiendo que el ID del sistema se maneja por parámetro o fijo
        const response = await fetch('http://localhost:8080/api/sistemas/1', {
            headers: obtenerHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            
            // Llenado de datos
            document.getElementById('sistema-desc').textContent = `Información consolidada del sistema ${data.nombre}`;
            document.getElementById('val-estado').textContent = data.estado;
            document.getElementById('val-revision').textContent = data.ultimaRevision;
            document.getElementById('val-riesgo').textContent = data.nivelRiesgo;
            
            document.getElementById('info-nombre').textContent = data.nombre;
            document.getElementById('info-responsable').textContent = data.responsable;
            document.getElementById('info-version').textContent = data.version;
            
            document.getElementById('tech-framework').textContent = data.framework;
            document.getElementById('tech-db').textContent = data.baseDatos;
            document.getElementById('tech-servidor').textContent = data.servidor;
        }
    } catch (error) {
        console.error("Error al cargar detalle:", error);
    }
}

document.addEventListener('DOMContentLoaded', cargarDetalle);
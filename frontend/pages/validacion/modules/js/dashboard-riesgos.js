import { obtenerHeaders } from './api-utils.js';

async function cargarDatosRiesgos() {
    try {
        const response = await fetch('http://localhost:8080/api/riesgos/resumen', {
            headers: obtenerHeaders()
        });

        if (!response.ok) throw new Error('Error al cargar datos');
        
        const data = await response.json();

        // Actualizar números
        document.getElementById('stat-critico').textContent = data.critico;
        document.getElementById('stat-alto').textContent = data.alto;
        document.getElementById('stat-medio').textContent = data.medio;
        document.getElementById('stat-bajo').textContent = data.bajo;
        
        document.getElementById('hero-text').textContent = data.mensajeGeneral;
        document.getElementById('hero-pill').textContent = data.estadoPortafolio;

    } catch (error) {
        console.error("Error:", error);
    }
}

document.addEventListener('DOMContentLoaded', cargarDatosRiesgos);
import { obtenerHeaders } from './api-utils.js';

const tituloSistema = document.getElementById('titulo-sistema');
const mensaje = document.getElementById('mensaje-observacion');
const form = document.getElementById('observacion-form');

async function cargarSistema() {
    try {
        const response = await fetch('http://localhost:8080/api/sistemas/1', {
            headers: obtenerHeaders()
        });

        if (!response.ok) throw new Error('No se pudo cargar el sistema.');
        const sistema = await response.json();
        tituloSistema.textContent = `🏢 Sistema: ${sistema.nombre || 'Sin nombre'}`;
    } catch (error) {
        console.error(error);
        tituloSistema.textContent = '🏢 Sistema';
    }
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `form-message show ${tipo}`;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('detalle').value,
        sistemaNombre: tituloSistema.textContent.replace('🏢 Sistema: ', '').replace('🏢 Sistema', ''),
        fechaRegistro: new Date().toISOString()
    };

    mostrarMensaje('⏳ Enviando observación...', 'loading');

    try {
        const response = await fetch('http://localhost:8080/api/observaciones', {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('No se pudo guardar la observación.');

        mostrarMensaje('✓ Observación registrada correctamente.', 'success');
        form.reset();
        setTimeout(() => { window.location.href = 'historial.html'; }, 1500);
    } catch (error) {
        mostrarMensaje('✗ ' + error.message, 'error');
    }
});

cargarSistema();
import { obtenerHeaders } from './api-utils.js';

const mensaje = document.getElementById('mensaje-validacion');
const btnAprobar = document.getElementById('btn-aprobar');
const btnObservar = document.getElementById('btn-observar');
const tituloSistema = document.getElementById('titulo-sistema');

async function cargarSistema() {
    try {
        const response = await fetch('http://localhost:8080/api/sistemas/1', {
            headers: obtenerHeaders()
        });
        if (!response.ok) throw new Error('No se pudo cargar el sistema.');

        const sistema = await response.json();
        tituloSistema.textContent = `Validación de sistema: ${sistema.nombre || 'Sin nombre'}`;
    } catch (error) {
        console.error(error);
        tituloSistema.textContent = 'Validación de sistema';
    }
}

async function enviarValidacion(estado) {
    const payload = {
        sistemaNombre: tituloSistema.textContent.replace('Validación de sistema: ', ''),
        estado: estado,
        fechaAccion: new Date().toISOString(),
        observaciones: estado === 'observado'
            ? 'Registro observado desde la interfaz de validación.'
            : 'Registro aprobado desde la interfaz de validación.'
    };

    mensaje.textContent = 'Enviando validación...';

    try {
        const response = await fetch('http://localhost:8080/api/validaciones', {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'No se pudo guardar la validación.');
        }

        mensaje.textContent = 'Validación enviada correctamente.';
        mensaje.style.color = '#1abb9c';
        alert('Validación registrada correctamente.');
    } catch (error) {
        mensaje.textContent = error.message || 'Ocurrió un error al enviar la validación.';
        mensaje.style.color = '#d32f2f';
        alert('Error al enviar la validación: ' + error.message);
    }
}

btnAprobar.addEventListener('click', () => enviarValidacion('aprobado'));
btnObservar.addEventListener('click', () => enviarValidacion('observado'));

cargarSistema();
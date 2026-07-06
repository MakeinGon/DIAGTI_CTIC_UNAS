document.addEventListener('DOMContentLoaded', () => {
    cargarControlesSeguridad();
});

function cargarControlesSeguridad() {
    const controles = [
        { nombre: "Certificado SSL/TLS (HTTPS)", estado: "Cumple" },
        { nombre: "Autenticación OpenLDAP", estado: "Cumple" },
        { nombre: "Multi-Factor de Autenticación (MFA)", estado: "Parcial" },
        { nombre: "Logs de Eventos y Auditoría", estado: "Cumple" },
        { nombre: "Estándar OWASP Top 10", estado: "Parcial" },
        { nombre: "Cifrado de Datos Sensibles", estado: "Cumple" },
        { nombre: "Control de Acceso por IP", estado: "Cumple" }
    ];

    const container = document.getElementById('controles-seguridad');
    container.innerHTML = '';

    controles.forEach(c => {
        const div = document.createElement('div');
        div.className = 'control-item';
        div.innerHTML = `
            <div><strong>${c.nombre}</strong></div>
            <div><span class="status ${c.estado.toLowerCase().replace(' ', '-')}">${c.estado}</span></div>
        `;
        container.appendChild(div);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    cargarTablaInfra();
});

function cargarTablaInfra() {
    const equipos = [
        { nombre: "Servidor Principal SIGA", estado: "Activo", ubicacion: "Data Center Principal", mantenimiento: "28 Jun 2026" },
        { nombre: "Firewall Perimetral", estado: "Activo", ubicacion: "Rack Principal", mantenimiento: "01 Jul 2026" },
        { nombre: "Switch Core Cisco", estado: "Activo", ubicacion: "Sala de Redes", mantenimiento: "15 Jun 2026" },
        { nombre: "NAS Almacenamiento", estado: "Advertencia", ubicacion: "Data Center", mantenimiento: "20 Jun 2026" },
        { nombre: "Servidor de Respaldos", estado: "Activo", ubicacion: "Backup Site", mantenimiento: "04 Jul 2026" }
    ];

    const tbody = document.querySelector('#tabla-infra tbody');
    tbody.innerHTML = '';

    equipos.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${e.nombre}</strong></td>
            <td><span class="badge ${e.estado === 'Activo' ? 'success' : 'warning'}">${e.estado}</span></td>
            <td>${e.ubicacion}</td>
            <td>${e.mantenimiento}</td>
            <td>
                <button style="padding:6px 14px; background:#1abb9c; color:white; border:none; border-radius:5px; cursor:pointer;">
                    Monitorear
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
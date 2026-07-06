document.addEventListener('DOMContentLoaded', () => {
    cargarTablaDespliegue();
});

function cargarTablaDespliegue() {
    const despliegues = [
        {
            sistema: "SIGA - Sistema Integrado de Gestión Académica",
            ambiente: "Producción",
            dominio: "siga.unas.edu.pe",
            plataforma: "Docker + Proxmox",
            ultimo: "02 Jul 2026"
        },
        {
            sistema: "SIAF - Sistema Administrativo Financiero",
            ambiente: "Producción",
            dominio: "siaf.unas.edu.pe",
            plataforma: "Servidor Físico",
            ultimo: "01 Jul 2026"
        },
        {
            sistema: "Plataforma de Matrícula en Línea",
            ambiente: "Producción",
            dominio: "matricula.unas.edu.pe",
            plataforma: "Docker",
            ultimo: "30 Jun 2026"
        },
        {
            sistema: "Moodle - Plataforma Virtual",
            ambiente: "Producción",
            dominio: "moodle.unas.edu.pe",
            plataforma: "VM Proxmox",
            ultimo: "03 Jul 2026"
        }
    ];

    const tbody = document.querySelector('#tabla-despliegue tbody');
    tbody.innerHTML = '';

    despliegues.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${d.sistema}</strong></td>
            <td><span class="badge success">${d.ambiente}</span></td>
            <td>${d.dominio}</td>
            <td>${d.plataforma}</td>
            <td>${d.ultimo}</td>
            <td>
                <button style="padding:6px 14px; background:#1abb9c; color:white; border:none; border-radius:5px; cursor:pointer;">
                    Ver Detalle
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}